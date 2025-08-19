"use client";

import React, { useState, useCallback } from 'react';
import { useUser } from '@/hooks/use-auth';
import { motion } from 'framer-motion';
import { useSSEWithReconnect } from '@/lib/hooks/use-sse-with-reconnect';
import { 
  FileText, 
  Upload, 
  Settings,
  Download, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Repeat,
  Languages
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculatePoints, validateFileFormat, getAcceptedExtensions, FILE_FORMAT_CONFIG, type TaskType } from '@/lib/utils';
import { AuthGuard } from '@/components/common/auth-guard';

interface ProcessingStatus {
  taskId: number | null;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  downloadUrl?: string;
}

export default function PDFToMarkdownPage() {
  const { user } = useUser();
  const { connect: connectSSE, disconnect: disconnectSSE } = useSSEWithReconnect();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isDetectingPages, setIsDetectingPages] = useState(false);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    taskId: null,
    status: 'idle',
    progress: 0,
    message: '',
  });

  // 处理参数
  const [tableMode, setTableMode] = useState<'markdown' | 'image'>('markdown');
  const [enableTranslation, setEnableTranslation] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('zh');
  const [outputOptions, setOutputOptions] = useState<string[]>(['original']);

  // 检测PDF页数
  const detectPDFPageCount = async (file: File) => {
    setIsDetectingPages(true);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPageCount();
      
      // 检查页数限制
      const config = FILE_FORMAT_CONFIG['pdf-to-markdown'];
      if (config.maxPages && pages > config.maxPages) {
        setErrorMessage(`PDF page limit exceeded. File has ${pages} pages, maximum supported is ${config.maxPages} pages. Please select a PDF file with fewer pages.`);
        setSelectedFile(null);
        setPageCount(null);
        return;
      }
      
      setPageCount(pages);
      console.log(`PDF页数检测完成: ${pages}页`);
    } catch (error) {
      console.error('PDF页数检测失败:', error);
      setErrorMessage('PDF page detection failed, please ensure the file format is correct');
      setSelectedFile(null);
      setPageCount(null);
    } finally {
      setIsDetectingPages(false);
    }
  };

  // 支持的语言列表
  const languages = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'es', name: 'Spanish' },
  { code: 'ru', name: 'Russian' },
  ];

  // 拖拽处理
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateAndSetFile = (file: File) => {
    console.log('选择的文件:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });
    
    // 使用统一的文件格式验证
    const validation = validateFileFormat(file, 'pdf-to-markdown' as TaskType);
    
    if (!validation.isValid) {
              setErrorMessage(validation.error || 'File format validation failed');
      return;
    }
    
    setSelectedFile(file);
    setErrorMessage(''); // 清除之前的错误消息
    setPageCount(null); // 重置页数
    // 精确检测PDF页数
    detectPDFPageCount(file);
    console.log('文件验证通过，已设置文件');
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const handleTranslationOutputChange = (option: 'original' | 'translated' | 'bilingual') => {
    setOutputOptions(prev => {
      if (prev.includes(option)) {
        return prev.filter(item => item !== option);
      } else {
        return [...prev, option];
      }
    });
  };

  const startProcessing = async () => {
    if (!selectedFile || !user) return;

    setProcessingStatus({
      taskId: null,
      status: 'uploading',
      progress: 0,
                message: 'Uploading file...',
    });

    try {
      // 1. 先上传文件到存储系统
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('taskType', 'pdf-to-markdown');

      const uploadResponse = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('File upload failed');
      }

      const uploadResult = await uploadResponse.json();
      
      // 验证PDF页数检测
      if (uploadResult.data?.needsPageDetection && !uploadResult.data?.additionalInfo?.pageCount) {
        throw new Error('PDF page detection failed, unable to calculate accurate points. Please retry or contact support.');
      }

      // 获取实际页数
      const pageCount = uploadResult.data?.additionalInfo?.pageCount;
      if (!pageCount) {
        throw new Error('Unable to get PDF page count information, please re-upload the file.');
      }
      
      // 2. 构建处理参数
      const processingParams = {
        tableMode,
        enableTranslation,
        ...(enableTranslation && {
          targetLanguage,
          translationOutput: outputOptions,
        }),
      };

      // 3. 创建处理任务
      const response = await fetch('/api/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'pdf-to-markdown',
          inputFilename: selectedFile.name,
          inputFileSize: selectedFile.size,
          inputStoragePath: uploadResult.data.storagePath,
          processingParams,
          pageCount: pageCount,
        }),
      });

      const result = await response.json();

      if (result.success && result.taskId) {
        setProcessingStatus({
          taskId: result.taskId,
          status: 'processing',
          progress: 0,
          message: 'Task created, starting processing...',
        });

        // 4. 建立SSE连接监听状态更新
        connectSSE(result.sseUrl, {
          onMessage: (data) => {
            if (data.type === 'status_update' && data.data) {
              const { status, progress, message } = data.data;
              console.log(`📊 状态更新: ${status} ${progress}% ${message || ''}`);
              
              setProcessingStatus(prev => ({
                ...prev,
                status: status === 'completed' ? 'completed' : 
                       status === 'failed' ? 'failed' : 'processing',
                progress: progress || prev.progress,
                message: message || prev.message,
                downloadUrl: status === 'completed' ? `/api/tasks/${result.taskId}/download` : undefined,
              }));
            }
          }
        });

      } else {
        setProcessingStatus({
          taskId: null,
          status: 'failed',
          progress: 0,
          message: result.message || 'Task creation failed',
        });
      }
    } catch (error) {
      console.error('处理失败:', error);
      setProcessingStatus({
        taskId: null,
        status: 'failed',
        progress: 0,
        message: error instanceof Error ? error.message : 'Processing failed, please try again',
      });
    }
  };



  const resetForm = () => {
    setSelectedFile(null);
    setErrorMessage('');
    setPageCount(null);
    setIsDetectingPages(false);
    setProcessingStatus({
      taskId: null,
      status: 'idle',
      progress: 0,
      message: '',
    });
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            PDF Parsing
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Intelligently convert PDF documents to editable Markdown format with table processing and multilingual translation support
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：文件上传 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 文件上传区域 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                  Upload PDF File
              </h2>
              
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="space-y-4">
                    <FileText className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      onClick={() => setSelectedFile(null)}
                      variant="outline"
                      size="sm"
                    >
                                              Reselect
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Drag PDF files here, or
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('pdf-file-input')?.click()}
                        className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Select PDF File
                      </Button>
                                              <input
                          id="pdf-file-input"
                          type="file"
                          accept={getAcceptedExtensions('pdf-to-markdown' as TaskType)}
                          onChange={handleFileChange}
                          className="hidden"
                        />
                    </div>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">
                        Supports PDF format, max 300MB, up to 800 pages
                      </p>
                  </div>
                )}
              </div>

              {/* 错误消息显示 */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
                >
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-sm text-red-600 dark:text-red-400">{errorMessage}</span>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* 处理状态 */}
            {processingStatus.status !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Processing Status
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {processingStatus.status === 'uploading' || processingStatus.status === 'processing' ? (
                      <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                    ) : processingStatus.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {processingStatus.status === 'uploading' ? 'Uploading' :
                       processingStatus.status === 'processing' ? 'Processing' :
                       processingStatus.status === 'completed' ? 'Completed' :
                       processingStatus.message}
                    </span>
                  </div>

                  {processingStatus.status === 'completed' && processingStatus.downloadUrl && (
                    <div className="flex space-x-3">
                      <Button
                        onClick={async () => {
                          try {
                            const response = await fetch(processingStatus.downloadUrl!);
                            if (response.ok) {
                              window.open(processingStatus.downloadUrl);
                            } else {
                              // 处理不同的错误状态码
                              const errorData = await response.json().catch(() => ({}));
                              
                              if (response.status === 402) {
                                // 积分不足的情况
                                alert(errorData.message || "Insufficient points to download this file");
                              } else {
                                alert(errorData.message || "File download failed, please try again later");
                              }
                            }
                          } catch (error) {
                            console.error('下载失败:', error);
                            alert("An error occurred during download, please try again later");
                          }
                        }}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                                                  Download Result
                      </Button>
                      <Button
                        onClick={resetForm}
                        variant="outline"
                      >
                        Process New File
                      </Button>
                    </div>
                  )}

                  {processingStatus.status === 'failed' && (
                    <Button
                      onClick={resetForm}
                      variant="outline"
                      className="w-full"
                    >
                                              Start Over
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* 右侧：处理参数 */}
          <div className="space-y-6">
            {/* 积分预览 */}
            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 shadow-lg border border-blue-200 dark:border-blue-800"
              >
                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Points Cost Preview
                </h4>
                
                <div className="space-y-3">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">File:</span>
                        <span className="font-medium text-gray-900 dark:text-white truncate max-w-32" title={selectedFile.name}>
                          {selectedFile.name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Size:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center border border-green-200 dark:border-green-800">
                    <div className="text-green-800 dark:text-green-200 font-medium">
                      {isDetectingPages ? 'Detecting pages...' : `Detected pages: ${pageCount || 'N/A'} pages`}
                    </div>
                    <div className="text-green-600 dark:text-green-400 text-sm mt-1">
                      {isDetectingPages ? 'Points cost will be shown after detection' : `Cost: ${calculatePoints('pdf-to-markdown', selectedFile.size, pageCount || 0, enableTranslation)} points`}
                    </div>
                  </div>

                  {enableTranslation && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800">
                      <div className="text-green-800 dark:text-green-200 font-medium text-center">
                        Translation Enabled
                      </div>
                      <div className="text-green-600 dark:text-green-400 text-sm text-center mt-1">
                        Total Points = Pages × 8
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Processing Settings
              </h3>

              <div className="space-y-6">
                {/* 表格处理方式 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Table Processing Method
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="tableMode"
                        value="markdown"
                        checked={tableMode === 'markdown'}
                        onChange={(e) => setTableMode(e.target.value as 'markdown')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex items-center space-x-2">
                        <Repeat className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Convert to Markdown Table
                        </span>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="tableMode"
                        value="image"
                        checked={tableMode === 'image'}
                        onChange={(e) => setTableMode(e.target.value as 'image')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex items-center space-x-2">
                        <Languages className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Keep as Image Format
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* 翻译选项 */}
                <div>
                  <label className="flex items-center space-x-3 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={enableTranslation}
                      onChange={(e) => setEnableTranslation(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <div className="flex items-center space-x-2">
                      <Languages className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Enable Translation
                      </span>
                    </div>
                  </label>

                  {enableTranslation && (
                    <div className="space-y-4 pl-7">
                      {/* 目标语言 */}
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Target Language
                        </label>
                        <select
                          value={targetLanguage}
                          onChange={(e) => setTargetLanguage(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                        >
                          {languages.map(lang => (
                            <option key={lang.code} value={lang.code}>
                              {lang.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 翻译输出 */}
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Translation Output (select at least one)
                        </label>
                        <div className="space-y-2">
                          {[
                            { value: 'original', label: 'Original' },
                            { value: 'translated', label: 'Translated' },
                            { value: 'bilingual', label: 'Bilingual' },
                          ].map(option => (
                            <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={outputOptions.includes(option.value as any)}
                                onChange={() => handleTranslationOutputChange(option.value as any)}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {option.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 开始处理按钮 */}
                <Button
                  onClick={startProcessing}
                  disabled={!selectedFile || processingStatus.status === 'processing' || processingStatus.status === 'uploading' || (enableTranslation && outputOptions.length === 0)}
                  className="w-full"
                >
                  {processingStatus.status === 'processing' || processingStatus.status === 'uploading' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Start Parsing
                    </>
                  )}
                </Button>
              </div>
            </motion.div>

            {/* 积分消耗说明 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800"
            >
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                Points Cost Information
              </h4>
              <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                                  <li>• PDF Parsing: 2 points/page</li>
                  <li>• PDF Parsing + Translation: 3 points/page (total)</li>
                <li>• Points deducted on first download</li>
              </ul>
            </motion.div>


          </div>
        </div>
      </div>
      </div>
    </AuthGuard>
  );
} 