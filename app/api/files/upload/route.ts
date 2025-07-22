import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "用户未认证" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const taskType = formData.get('taskType') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "未找到文件" },
        { status: 400 }
      );
    }

    // 验证文件类型和大小
    const allowedTypes = {
      'pdf-to-markdown': ['application/pdf'],
      'image-to-markdown': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      'markdown-translation': ['text/markdown', 'text/plain'],
      'pdf-translation': ['application/pdf'],
      'format-conversion': ['text/markdown', 'text/plain'],
    };

    const maxSizes = {
      'pdf-to-markdown': 300 * 1024 * 1024, // 300MB
      'image-to-markdown': 50 * 1024 * 1024, // 50MB
      'markdown-translation': 10 * 1024 * 1024, // 10MB
      'pdf-translation': 300 * 1024 * 1024, // 300MB
      'format-conversion': 10 * 1024 * 1024, // 10MB
    };

    if (!allowedTypes[taskType as keyof typeof allowedTypes]?.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "不支持的文件类型" },
        { status: 400 }
      );
    }

    if (file.size > maxSizes[taskType as keyof typeof maxSizes]) {
      return NextResponse.json(
        { success: false, message: "文件大小超出限制" },
        { status: 400 }
      );
    }

    // 创建存储路径
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
      // TODO: 调用PDF分析工具获取实际页数
      // 这里需要集成实际的PDF页数检测功能
      additionalInfo = {
        needsPageDetection: true, // 标记需要页数检测
      };
    }

    return NextResponse.json({
      success: true,
      message: "文件上传成功",
      storagePath: relativePath,
      fileName: file.name,
      fileSize: file.size,
      ...additionalInfo,
    });

  } catch (error) {
    console.error("文件上传失败:", error);
    return NextResponse.json(
      { success: false, message: "文件上传失败" },
      { status: 500 }
    );
  }
} 