"use client";

import React, { useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Settings,
  Download, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Globe,
  Languages
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculatePoints, detectPDFPageCount as detectPDFPages } from '@/lib/utils';
import { AuthGuard } from '@/components/common/auth-guard';

// PDF文件限制
const MAX_FILE_SIZE = 300 * 1024 * 1024; // 300MB
const MAX_PAGES = 800; // 最多800页

interface ProcessingStatus {
  taskId: number | null;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  downloadUrl?: string;
}

export default function PDFTranslationPage() {
  const { user } = useUser();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    taskId: null,
    status: 'idle',
    progress: 0,
    message: '',
  });

  // 翻译参数
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('zh');
  const [detectedPageCount, setDetectedPageCount] = useState<number>(0);
  const [isDetectingPages, setIsDetectingPages] = useState<boolean>(false);

  // 源语言列表 (输入语言简化为英文和中文)
  const sourceLanguages = [
    { code: 'en', name: '英语' },
    { code: 'zh', name: '中文' },
  ];

  // 目标语言列表 (与后端PDF翻译服务的LANGUAGE_MAPPING保持一致)
  const targetLanguages = [
    { code: 'zh', name: '中文' },
    { code: 'en', name: '英语' },
    { code: 'ja', name: '日语' },
    { code: 'ko', name: '韩语' },
    { code: 'fr', name: '法语' },
    { code: 'de', name: '德语' },
    { code: 'es', name: '西班牙语' },
    { code: 'ru', name: '俄语' },
  ];

  // 精确检测PDF页数
  const detectPDFPageCount = async (file: File) => {
    try {
      setIsDetectingPages(true);
      setDetectedPageCount(0);
      
      // 使用pdf-lib直接检测页数
      const pageCount = await detectPDFPages(file);
      
      if (pageCount > MAX_PAGES) {
        throw new Error(`PDF页数超过限制（最大${MAX_PAGES}页，当前${pageCount}页）`);
      }
      
      setDetectedPageCount(pageCount);
      console.log(`PDF页数检测成功: ${pageCount}页`);
      
    } catch (error) {
      console.error('PDF页数检测失败:', error);
      setErrorMessage(error instanceof Error ? error.message : '页数检测失败，请重新选择文件');
      setSelectedFile(null);
      setDetectedPageCount(0);
    } finally {
      setIsDetectingPages(false);
    }
  };

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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        // 检查文件大小
        if (file.size > MAX_FILE_SIZE) {
          setErrorMessage(`文件大小超出限制。请选择小于 ${MAX_FILE_SIZE / (1024 * 1024)}MB 的PDF文件。`);
          return;
        }
        
        setSelectedFile(file);
        setErrorMessage(''); // 清除之前的错误消息
        // 精确检测PDF页数
        detectPDFPageCount(file);
      } else {
        // 文件类型不正确，不设置错误消息，因为上面的UI已经有提示
        return;
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        // 检查文件大小
        if (file.size > MAX_FILE_SIZE) {
          setErrorMessage(`文件大小超出限制。请选择小于 ${MAX_FILE_SIZE / (1024 * 1024)}MB 的PDF文件。`);
          return;
        }
        
        setSelectedFile(file);
        setErrorMessage(''); // 清除之前的错误消息
        // 精确检测PDF页数
        detectPDFPageCount(file);
      } else {
        // 文件类型不正确，不设置错误消息，因为上面的UI已经有提示
        return;
      }
    }
  };

  const startProcessing = async () => {
    if (!selectedFile || !user) return;

    setProcessingStatus({
      taskId: null,
      status: 'uploading',
      progress: 0,
      message: '正在上传文件...',
    });

    try {
      // 1. 先上传文件到存储系统
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('taskType', 'pdf-translation');

      const uploadResponse = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('文件上传失败');
      }

      const uploadResult = await uploadResponse.json();
      
      // 验证PDF页数检测
      if (uploadResult.needsPageDetection && !uploadResult.additionalInfo?.pageCount) {
        throw new Error('PDF页数检测失败，无法计算准确积分。请重试或联系客服。');
      }

      // 获取实际页数
      const pageCount = uploadResult.additionalInfo?.pageCount;
      if (!pageCount) {
        throw new Error('无法获取PDF页数信息，请重新上传文件。');
      }
      
      // 2. 构建处理参数
      const processingParams = {
        sourceLanguage,
        targetLanguage,
      };

      // 3. 创建处理任务
      const response = await fetch('/api/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'pdf-translation',
          inputFilename: selectedFile.name,
          inputFileSize: selectedFile.size,
          inputStoragePath: uploadResult.storagePath,
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
          message: '任务已创建，开始翻译...',
        });

        // 4. 建立SSE连接监听状态更新
        const eventSource = new EventSource(result.sseUrl);
        
        // 设置1小时超时保护
        const timeoutId = setTimeout(() => {
          eventSource.close();
          setProcessingStatus(prev => ({
            ...prev,
            status: 'failed',
            message: '处理超时（1小时），请重试或联系支持',
          }));
        }, 3600000); // 1小时 = 3600000毫秒
        
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          if (data.type === 'status_update') {
            // 先更新状态
            setProcessingStatus(prev => ({
              ...prev,
              status: data.data.status === 'completed' ? 'completed' : 'processing',
              progress: data.data.progress || prev.progress,
              message: data.data.message || prev.message,
              downloadUrl: data.data.status === 'completed' ? `/api/tasks/${result.taskId}/download` : undefined,
            }));

            // 如果任务完成或失败，立即同步刷新通知
            if (data.data.status === 'completed' || data.data.status === 'failed') {
              // 立即触发通知刷新，与状态更新同步
              const refreshEvent = new CustomEvent('refreshNotifications');
              window.dispatchEvent(refreshEvent);
              
              clearTimeout(timeoutId);
              eventSource.close();
            }
          }
        };

        eventSource.onerror = (error) => {
          console.error('SSE连接错误:', error);
          clearTimeout(timeoutId);
          eventSource.close();
        };

      } else {
        setProcessingStatus({
          taskId: null,
          status: 'failed',
          progress: 0,
          message: result.message || '任务创建失败',
        });
      }
    } catch (error) {
      console.error('处理失败:', error);
      setProcessingStatus({
        taskId: null,
        status: 'failed',
        progress: 0,
        message: error instanceof Error ? error.message : '处理失败，请重试',
      });
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setErrorMessage('');
    setDetectedPageCount(0);
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
              <Globe className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              PDF翻译
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              将PDF文档翻译为目标语言，保留原有的版式和排版
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
                  上传PDF文件
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
                        重新选择
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          拖拽PDF文件到此处，或
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById('pdf-file-input')?.click()}
                          className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          选择PDF文件
                        </Button>
                        <input
                          id="pdf-file-input"
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        支持PDF格式，最大 300MB，最多 800页
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
                    处理状态
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
                        {processingStatus.message}
                      </span>
                    </div>

                    {(processingStatus.status === 'processing' || processingStatus.status === 'uploading') && (
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${processingStatus.progress}%` }}
                        ></div>
                      </div>
                    )}

                    {processingStatus.status === 'completed' && processingStatus.downloadUrl && (
                      <div className="flex space-x-3">
                        <Button
                          onClick={() => window.open(processingStatus.downloadUrl)}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          下载结果
                        </Button>
                        <Button
                          onClick={resetForm}
                          variant="outline"
                        >
                          处理新文件
                        </Button>
                      </div>
                    )}

                    {processingStatus.status === 'failed' && (
                      <Button
                        onClick={resetForm}
                        variant="outline"
                        className="w-full"
                      >
                        重新开始
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* 右侧：翻译设置和积分预览 */}
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
                    积分消耗预览
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">文件：</span>
                          <span className="font-medium text-gray-900 dark:text-white truncate max-w-32" title={selectedFile.name}>
                            {selectedFile.name}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">大小：</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center border border-green-200 dark:border-green-800">
                      <div className="text-green-800 dark:text-green-200 font-medium">
                        {isDetectingPages ? '页数检测中...' : `检测页数：${detectedPageCount}页`}
                      </div>
                      <div className="text-green-600 dark:text-green-400 text-sm mt-1">
                        {isDetectingPages ? '检测完成后显示积分消耗' : `本次消耗：${calculatePoints('pdf-translation', selectedFile.size, detectedPageCount)}积分`}
                      </div>
                    </div>
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
                  翻译设置
                </h3>

                <div className="space-y-6">
                  {/* 源语言 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      源语言
                    </label>
                    <select
                      value={sourceLanguage}
                      onChange={(e) => setSourceLanguage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                    >
                      {sourceLanguages.map(lang => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 目标语言 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      目标语言
                    </label>
                    <select
                      value={targetLanguage}
                      onChange={(e) => setTargetLanguage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                    >
                      {targetLanguages.map(lang => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 开始处理按钮 */}
                  <Button
                    onClick={startProcessing}
                    disabled={!selectedFile || processingStatus.status === 'processing' || processingStatus.status === 'uploading' || sourceLanguage === targetLanguage}
                    className="w-full"
                  >
                    {processingStatus.status === 'processing' || processingStatus.status === 'uploading' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        翻译中...
                      </>
                    ) : (
                      <>
                        <Globe className="h-4 w-4 mr-2" />
                        开始翻译
                      </>
                    )}
                  </Button>
                  
                  {sourceLanguage === targetLanguage && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                      源语言和目标语言不能相同
                    </p>
                  )}
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
                  积分消耗说明
                </h4>
                <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                  <li>• PDF翻译：3积分/页</li>
                  <li>• 保留原文档排版</li>
                  <li>• 处理失败将返还积分</li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
} 