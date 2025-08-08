import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { join } from 'path';
import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { validateFileFormat, FILE_FORMAT_CONFIG, type TaskType } from '@/lib/utils';
import { getPDFPageCount } from '@/lib/external/pdf-utils';

// 强制动态渲染，避免静态生成错误
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "用户未登录" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const taskType = formData.get('taskType') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "没有找到文件" },
        { status: 400 }
      );
    }

    if (!taskType) {
      return NextResponse.json(
        { success: false, message: "没有指定任务类型" },
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
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
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
              message: `PDF页数超出限制。当前文件有 ${pageCountResult.pageCount} 页，最多支持 ${maxPages} 页。` 
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
            message: `PDF页数检测失败: ${pageCountResult.error}。请确保PDF文件完整且未损坏。` 
          },
          { status: 400 }
        );
      }
    } else if (taskType === 'markdown-translation' || taskType === 'format-conversion') {
      // Markdown文件默认按文件大小计费，页数检测不是必需的
      additionalInfo = {
        pageCount: 1, // 默认值
        needsPageDetection: false,
        pageDetectionMethod: 'default',
      };
    }

    return NextResponse.json({
      success: true,
      message: "文件上传成功",
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
      { success: false, message: "文件上传失败，请重试" },
      { status: 500 }
    );
  }
} 