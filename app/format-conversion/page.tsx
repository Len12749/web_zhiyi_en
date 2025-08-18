"use client";

import React, { useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
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
  Repeat
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculatePoints, validateFileFormat, getAcceptedExtensions, formatFileSize, type TaskType } from '@/lib/utils';
import { AuthGuard } from '@/components/common/auth-guard';

interface ProcessingStatus {
  taskId: number | null;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  downloadUrl?: string;
}

export default function FormatConversionPage() {
  const { user } = useUser();
  const { connect: connectSSE, disconnect: disconnectSSE } = useSSEWithReconnect();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    taskId: null,
    status: 'idle',
    progress: 0,
    message: '',
  });

  // 格式转换参数
  const [targetFormat, setTargetFormat] = useState('word');

  // 支持的目标格式
  const formats = [
  { code: 'word', name: 'Word Document (.docx)', icon: '📄' },
  { code: 'html', name: 'HTML Page (.html)', icon: '🌐' },
  { code: 'pdf', name: 'PDF Document (.pdf)', icon: '📕' },
  { code: 'latex', name: 'LaTeX Document (.tex)', icon: '📜' },
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
    const validation = validateFileFormat(file, 'format-conversion' as TaskType);
    
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'File format validation failed');
      return;
    }
    
    setSelectedFile(file);
    setErrorMessage(''); // 清除之前的错误消息
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

  const startProcessing = async () => {
    if (!selectedFile || !user) return;

    console.log('开始处理文件:', {
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileType: selectedFile.type
    });

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
      formData.append('taskType', 'format-conversion');
      
      console.log('发送上传请求...');

      const uploadResponse = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('上传响应状态:', uploadResponse.status, uploadResponse.statusText);

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        console.error('上传失败:', errorData);
        throw new Error(errorData.message || 'File upload failed');
      }

      const uploadResult = await uploadResponse.json();
      console.log('上传结果:', uploadResult);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.message || 'File upload failed');
      }

      // 2. 构建处理参数
      const processingParams = {
        targetFormat,
      };

      // 3. 创建处理任务
      const response = await fetch('/api/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'format-conversion',
          inputFilename: selectedFile.name,
          inputFileSize: selectedFile.size,
          inputStoragePath: uploadResult.data.storagePath,
          processingParams,
        }),
      });

      const result = await response.json();

      if (result.success && result.taskId) {
        setProcessingStatus({
          taskId: result.taskId,
          status: 'processing',
          progress: 0,
          message: 'Task created, starting conversion...',
        });

        // 4. 建立SSE连接监听状态更新
        connectSSE(result.sseUrl, {
          onMessage: (data) => {
            if (data.type === 'status_update') {
              setProcessingStatus(prev => ({
                ...prev,
                status: data.data.status === 'completed' ? 'completed' : 
                       data.data.status === 'failed' ? 'failed' : 'processing',
                progress: data.data.progress || prev.progress,
                message: data.data.message || prev.message,
                downloadUrl: data.data.status === 'completed' ? `/api/tasks/${result.taskId}/download` : undefined,
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
              <Repeat className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Format Conversion
            </h1>
                      <p className="text-gray-600 dark:text-gray-400">
            Convert Markdown files to Word, PDF, HTML, LaTeX and other formats
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
                Upload Markdown File
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
                          {formatFileSize(selectedFile.size)}
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
                          Drag Markdown files here, or
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById('markdown-file-input')?.click()}
                          className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Select Markdown File
                        </Button>
                        <input
                          id="markdown-file-input"
                          type="file"
                          accept={getAcceptedExtensions('format-conversion' as TaskType)}
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Supports .md, .markdown formats only, max 100MB
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

            {/* 右侧：格式设置和积分预览 */}
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
                            {formatFileSize(selectedFile.size)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center border border-green-200 dark:border-green-800">
                      <div className="text-green-800 dark:text-green-200 font-medium">
                        Cost: {calculatePoints('format-conversion', selectedFile.size)} points
                      </div>
                      <div className="text-green-600 dark:text-green-400 text-sm mt-1">
                        Charged by file size: 1 point/KB
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
                Conversion Settings
              </h3>

                <div className="space-y-6">
                  {/* 目标格式 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Target Format
                    </label>
                    <div className="space-y-2">
                      {formats.map(format => (
                        <label key={format.code} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="targetFormat"
                            value={format.code}
                            checked={targetFormat === format.code}
                            onChange={(e) => setTargetFormat(e.target.value)}
                            className="w-4 h-4 text-blue-600"
                          />
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{format.icon}</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {format.name}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 开始处理按钮 */}
                  <Button
                    onClick={startProcessing}
                    disabled={!selectedFile || processingStatus.status === 'processing' || processingStatus.status === 'uploading'}
                    className="w-full"
                  >
                    {processingStatus.status === 'processing' || processingStatus.status === 'uploading' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <Repeat className="h-4 w-4 mr-2" />
                        Start Conversion
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
                  <li>• Format Conversion: 1 point/conversion</li>
                  <li>• Supports multiple output formats</li>
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