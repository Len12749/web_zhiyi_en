// PDF专用工具函数
// PDF页数检测
export async function detectPDFPageCount(file: File): Promise<number> {
  try {
    const { PDFDocument } = await import('pdf-lib');
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    return pdfDoc.getPageCount();
  } catch (error) {
    console.error('检测PDF页数失败:', error);
    throw new Error('无法检测PDF页数，请确保文件格式正确');
  }
}