import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { auth } from '@clerk/nextjs';
import { getPDFPageCount } from '@/lib/external/pdf-utils';

// 设置API路由最大执行时间为1小时（3600秒）
export const maxDuration = 3600;
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

    // 验证文件类型（扩展支持多种MIME类型）
    const allowedTypes = {
      'pdf-to-markdown': ['application/pdf'],
      'pdf-translation': ['application/pdf'],
      'image-to-markdown': ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff'],
      'markdown-translation': ['text/markdown', 'text/plain', 'application/octet-stream'],
      'format-conversion': ['text/markdown', 'application/octet-stream'],
    };

    const allowedExtensions = {
      'pdf-to-markdown': ['.pdf'],
      'pdf-translation': ['.pdf'],
      'image-to-markdown': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'],
      'markdown-translation': ['.md', '.markdown', '.txt'],
      'format-conversion': ['.md', '.markdown'],
    };

    const allowedTypesForTask = allowedTypes[taskType as keyof typeof allowedTypes];
    const allowedExtensionsForTask = allowedExtensions[taskType as keyof typeof allowedExtensions];
    
    // 获取文件扩展名
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    // 验证文件类型（通过MIME类型或文件扩展名）
    const isValidType = allowedTypesForTask?.includes(file.type) || 
                       allowedExtensionsForTask?.includes(fileExtension);
    
    if (!isValidType) {
      console.log(`文件验证失败 - 文件名: ${file.name}, MIME类型: ${file.type}, 扩展名: ${fileExtension}`);
      return NextResponse.json(
        { success: false, message: `不支持的文件类型。允许的格式：${allowedExtensionsForTask?.join(', ')}` },
        { status: 400 }
      );
    }

    // 验证文件大小
    const maxSizes = {
      'pdf-to-markdown': 300 * 1024 * 1024, // 300MB
      'pdf-translation': 300 * 1024 * 1024, // 300MB
      'image-to-markdown': 100 * 1024 * 1024, // 100MB
      'markdown-translation': 100 * 1024 * 1024, // 100MB
      'format-conversion': 100 * 1024 * 1024, // 100MB
    };

    const maxSize = maxSizes[taskType as keyof typeof maxSizes];
    
    // 检查文件是否为空
    if (file.size === 0) {
      return NextResponse.json(
        { success: false, message: "不能上传空文件，请选择有内容的文件" },
        { status: 400 }
      );
    }
    
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: `文件大小超出限制，最大 ${maxSize / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // 获取数据存储路径
    const dataStoragePath = process.env.DATA_STORAGE_PATH || './data';
    const today = new Date().toISOString().split('T')[0];
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
        const maxPages = 800;
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
      try {
        const textContent = buffer.toString('utf-8');
        additionalInfo = {
          needsPageDetection: false,
          characterCount: textContent.length,
          wordCount: textContent.split(/\s+/).filter(word => word.length > 0).length,
        };
      } catch (error) {
        console.error('读取文件内容失败:', error);
      additionalInfo = {
        needsPageDetection: false,
          characterCount: file.size, // 使用文件大小作为备选
      };
      }
    }

    return NextResponse.json({
      success: true,
      message: "文件上传成功",
      storagePath: relativePath,
      fileName: file.name,
      fileSize: file.size,
      additionalInfo,
    });

  } catch (error) {
    console.error("文件上传失败:", error);
    return NextResponse.json(
      { success: false, message: "文件上传失败" },
      { status: 500 }
    );
  }
} 