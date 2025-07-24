import { PDFDocument } from 'pdf-lib';
import { promises as fs } from 'fs';

/**
 * PDF页数检测结果接口
 */
export interface PDFPageCountResult {
  success: boolean;
  pageCount?: number;
  error?: string;
}

/**
 * 使用pdf-lib检测PDF页数
 * 
 * @param filePath PDF文件路径
 * @returns Promise<PDFPageCountResult>
 */
export async function detectPDFPageCount(filePath: string): Promise<PDFPageCountResult> {
  try {
    // 读取PDF文件
    const pdfBuffer = await fs.readFile(filePath);
    
    // 加载PDF文档
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    // 获取页数
    const pageCount = pdfDoc.getPageCount();
    
    return {
      success: true,
      pageCount: pageCount
    };
  } catch (error: any) {
    console.error('PDF页数检测失败:', error);
    
    // 处理不同类型的错误
    let errorMessage = 'PDF文件解析失败';
    
    if (error.message) {
      if (error.message.includes('Invalid PDF')) {
        errorMessage = 'PDF文件格式无效或损坏';
      } else if (error.message.includes('password') || error.message.includes('encrypted')) {
        errorMessage = 'PDF文件受密码保护，暂不支持';
      } else if (error.message.includes('ENOENT')) {
        errorMessage = '找不到PDF文件';
      } else {
        errorMessage = `PDF解析错误: ${error.message}`;
      }
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * 检测PDF页数的主函数
 * 只使用精确检测，失败直接返回错误
 * 
 * @param filePath PDF文件路径
 * @param fileSize 文件大小（字节）
 * @returns Promise<PDFPageCountResult>
 */
export async function getPDFPageCount(filePath: string, fileSize: number): Promise<PDFPageCountResult> {
  console.log(`开始精确检测PDF页数: ${filePath}`);
  
  // 检查文件大小是否合理
  if (fileSize === 0) {
    return {
      success: false,
      error: 'PDF文件为空'
    };
  }
  
  // 检查文件大小是否过大（超过300MB）
  const maxSize = 300 * 1024 * 1024; // 300MB
  if (fileSize > maxSize) {
    return {
      success: false,
      error: `PDF文件过大（${Math.round(fileSize / (1024 * 1024))}MB），最大支持300MB`
    };
  }
  
  // 进行PDF页数检测
  const result = await detectPDFPageCount(filePath);
  
  if (result.success) {
    console.log(`PDF精确页数检测成功: ${result.pageCount}页`);
    
    // 验证页数是否合理
    if (result.pageCount && result.pageCount <= 0) {
      return {
        success: false,
        error: 'PDF文件页数无效'
      };
    }
    
    // 验证页数限制
    const maxPages = 800;
    if (result.pageCount && result.pageCount > maxPages) {
      return {
        success: false,
        error: `PDF页数超出限制（当前${result.pageCount}页，最大支持${maxPages}页）`
      };
    }
    
    return result;
  }
  
  // 检测失败，直接返回错误
  console.error('PDF精确页数检测失败:', result.error);
  return {
    success: false,
    error: `PDF页数检测失败: ${result.error}`
  };
} 
 