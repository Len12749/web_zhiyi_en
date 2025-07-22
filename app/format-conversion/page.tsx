'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, RefreshCw, Download, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculatePoints } from '@/lib/utils';

// 支持的输入文件格式
const SUPPORTED_INPUT_TYPES = [
  'text/markdown',
  '.md'
];

// 支持的输出格式
const OUTPUT_FORMATS = [
  { value: 'docx', label: 'Word文档 (.docx)' },
  { value: 'html', label: 'HTML网页 (.html)' },
  { value: 'pdf', label: 'PDF文档 (.pdf)' },
  { value: 'latex', label: 'LaTeX文档 (.tex)' },
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

interface ProcessingStatus {
  taskId: string | null;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  downloadUrl?: string;
}

export default function FormatConversionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState('docx');
  const [dragActive, setDragActive] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    taskId: null,
    status: 'idle',
    progress: 0,
    message: '',
  });

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
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, []);

  const handleFileSelection = useCallback((file: File) => {
    const isValidType = SUPPORTED_INPUT_TYPES.some(type => 
      type.startsWith('.') ? file.name.toLowerCase().endsWith(type) : file.type === type
    );

    if (!isValidType) {
      alert('不支持的文件格式。请选择 Markdown (.md) 格式的文件。');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert(`文件大小超出限制。请选择小于 ${MAX_FILE_SIZE / (1024 * 1024)}MB 的文件。`);
      return;
    }

    setSelectedFile(file);
  }, []);

  const handleStartConversion = async () => {
    if (!selectedFile) return;

    try {
      setProcessingStatus({
        taskId: null,
        status: 'uploading',
        progress: 10,
        message: '正在上传文件...',
      });

      // 1. 上传文件
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('taskType', 'format-conversion');

      const uploadResponse = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('文件上传失败');
      }

      const uploadResult = await uploadResponse.json();

      // TODO: 集成页数检测
      const pageCount = uploadResult.additionalInfo?.pageCount || 1; // Markdown默认1页
      
      setProcessingStatus(prev => ({
        ...prev,
        status: 'uploading',
        progress: 50,
        message: '文件上传成功，创建处理任务...',
      }));

      // 2. 创建处理任务
      const taskResponse = await fetch('/api/tasks/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskType: 'format-conversion',
          inputFilename: selectedFile.name,
          inputFileSize: selectedFile.size,
          inputStoragePath: uploadResult.storagePath,
          processingParams: {
            outputFormat,
          },
          pageCount,
        }),
      });

      if (!taskResponse.ok) {
        const errorData = await taskResponse.json();
        throw new Error(errorData.message || '任务创建失败');
      }

      const result = await taskResponse.json();

      if (result.success && result.taskId) {
        setProcessingStatus({
          taskId: result.taskId,
          status: 'processing',
          progress: 0,
          message: '任务已创建，开始转换...',
        });

        // 3. 建立SSE连接监听状态更新
        const eventSource = new EventSource(result.sseUrl);
        
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          if (data.type === 'status_update') {
            setProcessingStatus(prev => ({
              ...prev,
              status: data.data.status === 'completed' ? 'completed' : 'processing',
              progress: data.data.progress || prev.progress,
              message: data.data.message || prev.message,
              downloadUrl: data.data.status === 'completed' ? `/api/tasks/${result.taskId}/download` : undefined,
            }));

            if (data.data.status === 'completed' || data.data.status === 'failed') {
              eventSource.close();
            }
          }
        };

        eventSource.onerror = (error) => {
          console.error('SSE连接错误:', error);
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
    setProcessingStatus({
      taskId: null,
      status: 'idle',
      progress: 0,
      message: '',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            格式转换
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            将Markdown文档转换为Word、PDF、HTML、LaTeX等多种格式
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
                上传Markdown文件
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
                        {(selectedFile.size / 1024).toFixed(2)} KB
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
                      <p className="text-gray-900 dark:text-white font-medium mb-2">
                        拖拽Markdown文件到这里，或者
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('markdown-file-input')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        选择Markdown文件
                      </Button>
                      <input
                        id="markdown-file-input"
                        type="file"
                        accept=".md"
                        onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])}
                        className="hidden"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      支持 Markdown (.md) 格式，最大 100MB
                    </p>
                  </div>
                )}
              </div>
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
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center border border-orange-200 dark:border-orange-800">
                    <div className="text-orange-800 dark:text-orange-200 font-medium">
                      页数检测中...
                    </div>
                    <div className="text-orange-600 dark:text-orange-400 text-sm mt-1">
                      上传后显示准确积分消耗
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
                转换设置
              </h3>

              <div className="space-y-6">
                {/* 输出格式设置 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    目标格式
                  </label>
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {OUTPUT_FORMATS.map((format) => (
                      <option key={format.value} value={format.value}>
                        {format.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 开始转换按钮 */}
                <Button
                  onClick={handleStartConversion}
                  disabled={!selectedFile || processingStatus.status !== 'idle'}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  开始转换
                </Button>
              </div>
            </motion.div>

            {/* 积分说明 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 text-sm"
            >
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">积分消耗说明</h4>
              <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                <li>• 格式转换：2积分/页</li>
                <li>• 支持多种输出格式</li>
                <li>• 处理失败将返还积分</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 