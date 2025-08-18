import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { join } from 'path';
import { existsSync } from 'fs';
import { mkdir, writeFile, readFile } from 'fs/promises';
import { validateFileFormat, FILE_FORMAT_CONFIG, type TaskType, getBeijingDateString } from '@/lib/utils';
import { getPDFPageCount } from '@/lib/external/pdf-utils';

// 强制动态渲染，避免静态生成错误
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not logged in" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const taskType = formData.get('taskType') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file found" },
        { status: 400 }
      );
    }

    if (!taskType) {
      return NextResponse.json(
        { success: false, message: "No task type specified" },
        { status: 400 }
      );
    }

    // 使用统一的文件格式验证
    const validation = validateFileFormat(file, taskType as TaskType);
    if (!validation.isValid) {
      console.log(`文件验证失败 - 文件名: ${file.name}, MIME类型: ${file.type}`);
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: 400 }
      );
    }

    // 获取数据存储路径
    const dataStoragePath = process.env.DATA_STORAGE_PATH || './data';
    // 使用统一的工具函数获取北京时间
    const today = getBeijingDateString();
    const timestamp = Date.now();
    
    const uploadDir = join(
      dataStoragePath,
      'uploads',
      userId,
      taskType,
      today,
      timestamp.toString()
    );

    const originalDir = join(uploadDir, 'original');
    
    // 确保目录存在
    if (!existsSync(originalDir)) {
      await mkdir(originalDir, { recursive: true });
    }

    // 保存文件
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(originalDir, file.name);
    
    await writeFile(filePath, buffer);

    // 创建元数据
    const metadata = {
      originalName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadTime: new Date().toISOString(),
      userId,
      taskType,
    };

    const metadataPath = join(uploadDir, 'metadata.json');
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    // 构建相对存储路径（用于数据库存储）
    const relativePath = join(
      'uploads',
      userId,
      taskType,
      today,
      timestamp.toString()
    ).replace(/\\/g, '/');

    // 获取文件额外信息
    let additionalInfo = {};
    
    if (file.type === 'application/pdf') {
      console.log(`开始检测PDF文件页数: ${file.name}`);
      
      // 集成PDF页数检测功能
      const pageCountResult = await getPDFPageCount(filePath, file.size);
      
      if (pageCountResult.success && pageCountResult.pageCount !== undefined) {
        console.log(`PDF页数检测成功: ${pageCountResult.pageCount}页`);
        
        // 验证页数限制
        const config = FILE_FORMAT_CONFIG[taskType as TaskType];
        const maxPages = (config as any)?.maxPages || 800;
        
        if (pageCountResult.pageCount > maxPages) {
          return NextResponse.json(
            { 
              success: false, 
              message: `PDF page limit exceeded. Current file has ${pageCountResult.pageCount} pages, maximum supported is ${maxPages} pages.` 
            },
            { status: 400 }
          );
        }
        
        additionalInfo = {
          pageCount: pageCountResult.pageCount,
          needsPageDetection: false,
          pageDetectionMethod: 'precise',
        };
      } else {
        console.error('PDF页数检测失败:', pageCountResult.error);
        
        // 页数检测失败，返回错误
        return NextResponse.json(
          { 
            success: false, 
            message: `PDF page detection failed: ${pageCountResult.error}. Please ensure the PDF file is complete and not corrupted.` 
          },
          { status: 400 }
        );
      }
    } else if (taskType === 'markdown-translation') {
      // Markdown翻译按字符数计费
      try {
        // 读取文件内容并计算字符数
        const fileContent = await readFile(filePath, 'utf-8');
        const charCount = fileContent.length;
        
        additionalInfo = {
          pageCount: 1, // 保留兼容性
          needsPageDetection: false,
          pageDetectionMethod: 'default',
          charCount: charCount, // 添加字符数信息
        };
      } catch (err) {
        console.error('计算文件字符数失败:', err);
        additionalInfo = {
          pageCount: 1,
          needsPageDetection: false,
          pageDetectionMethod: 'default',
          charCount: file.size, // 如果读取失败，使用文件大小作为备选
        };
      }
    } else if (taskType === 'format-conversion') {
      // 格式转换按次数计费
      additionalInfo = {
        pageCount: 1, // 默认值
        needsPageDetection: false,
        pageDetectionMethod: 'default',
      };
    }

    return NextResponse.json({
      success: true,
      message: "File uploaded successfully",
      data: {
        storagePath: relativePath,
        originalName: file.name,
        fileSize: file.size,
        timestamp,
        additionalInfo
      }
    });

  } catch (error) {
    console.error('文件上传错误:', error);
    return NextResponse.json(
      { success: false, message: "File upload failed, please try again" },
      { status: 500 }
    );
  }
} 