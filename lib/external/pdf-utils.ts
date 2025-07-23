import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * PDF页数检测结果接口
 */
export interface PDFPageCountResult {
  success: boolean;
  pageCount?: number;
  error?: string;
}

/**
 * 调用外部Python脚本检测PDF页数
 * 
 * @param filePath PDF文件路径
 * @returns Promise<PDFPageCountResult>
 */
export async function detectPDFPageCount(filePath: string): Promise<PDFPageCountResult> {
  return new Promise((resolve) => {
    // 使用Python脚本进行PDF页数检测
    const pythonScript = `
import sys
import json
try:
    import fitz  # PyMuPDF
    
    if len(sys.argv) != 2:
        print(json.dumps({"success": False, "error": "Missing file path argument"}))
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    try:
        doc = fitz.open(pdf_path)
        page_count = len(doc)
        doc.close()
        
        print(json.dumps({"success": True, "pageCount": page_count}))
    except Exception as e:
        print(json.dumps({"success": False, "error": f"PDF processing error: {str(e)}"}))
        
except ImportError:
    print(json.dumps({"success": False, "error": "PyMuPDF (fitz) not installed"}))
except Exception as e:
    print(json.dumps({"success": False, "error": f"Script error: {str(e)}"}))
`;

    // 创建临时Python脚本文件
    const tempScriptPath = path.join(process.cwd(), 'temp_pdf_detector.py');
    
    fs.writeFile(tempScriptPath, pythonScript)
      .then(() => {
        // 执行Python脚本
        const pythonProcess = spawn('python', [tempScriptPath, filePath], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
          output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });

        pythonProcess.on('close', async (code) => {
          // 清理临时脚本文件
          try {
            await fs.unlink(tempScriptPath);
          } catch (e) {
            console.warn('无法删除临时脚本文件:', e);
          }

          if (code !== 0) {
            resolve({
              success: false,
              error: `Python script failed with code ${code}: ${errorOutput}`
            });
            return;
          }

          try {
            const result = JSON.parse(output.trim());
            resolve(result);
          } catch (e) {
            resolve({
              success: false,
              error: `Failed to parse Python output: ${output}`
            });
          }
        });

        pythonProcess.on('error', async (error) => {
          // 清理临时脚本文件
          try {
            await fs.unlink(tempScriptPath);
          } catch (e) {
            console.warn('无法删除临时脚本文件:', e);
          }

          resolve({
            success: false,
            error: `Failed to spawn Python process: ${error.message}`
          });
        });

        // 设置超时（30秒）
        setTimeout(() => {
          pythonProcess.kill();
          resolve({
            success: false,
            error: 'PDF page detection timeout (30s)'
          });
        }, 30000);
      })
      .catch((error) => {
        resolve({
          success: false,
          error: `Failed to create temp script: ${error.message}`
        });
      });
  });
}

/**
 * 备用PDF页数检测方法：基于文件大小估算
 * 作为Python脚本失败时的降级方案
 * 
 * @param filePath PDF文件路径
 * @param fileSize 文件大小（字节）
 * @returns Promise<PDFPageCountResult>
 */
export async function estimatePDFPageCount(filePath: string, fileSize: number): Promise<PDFPageCountResult> {
  try {
    // 简单估算：1MB约等于1页（经验值）
    const estimatedPages = Math.max(1, Math.ceil(fileSize / (1024 * 1024)));
    
    return {
      success: true,
      pageCount: estimatedPages
    };
  } catch (error) {
    return {
      success: false,
      error: `Estimation failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * 检测PDF页数的主函数
 * 优先使用精确检测，失败时降级到估算
 * 
 * @param filePath PDF文件路径
 * @param fileSize 文件大小（字节）
 * @returns Promise<PDFPageCountResult>
 */
export async function getPDFPageCount(filePath: string, fileSize: number): Promise<PDFPageCountResult> {
  // 首先尝试精确检测
  const preciseResult = await detectPDFPageCount(filePath);
  
  if (preciseResult.success) {
    console.log(`PDF精确页数检测成功: ${preciseResult.pageCount}页`);
    return preciseResult;
  }
  
  console.warn('PDF精确页数检测失败，使用估算方法:', preciseResult.error);
  
  // 降级到估算方法
  const estimationResult = await estimatePDFPageCount(filePath, fileSize);
  
  if (estimationResult.success) {
    console.log(`PDF页数估算结果: ${estimationResult.pageCount}页`);
    return {
      ...estimationResult,
      error: `注意：使用估算方法 (原因: ${preciseResult.error})`
    };
  }
  
  // 两种方法都失败了
  return {
    success: false,
    error: `页数检测失败 - 精确检测: ${preciseResult.error}, 估算: ${estimationResult.error}`
  };
} 
 