"use client";

import React, { useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { 
  Image as ImageIcon, 
  Upload, 
  Download, 
  AlertCircle,
  CheckCircle,
  Loader2,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculatePoints } from '@/lib/utils';
import { AuthGuard } from '@/components/common/auth-guard';

// 图片文件限制
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff', 'image/webp'];

interface ProcessingStatus {
  taskId: number | null;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  downloadUrl?: string;
}

export default function ImageToMarkdownPage() {
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
      if (ACCEPTED_TYPES.includes(file.type)) {
        // 检查文件大小
        if (file.size > MAX_FILE_SIZE) {
          setErrorMessage(`文件大小超出限制。请选择小于 ${MAX_FILE_SIZE / (1024 * 1024)}MB 的图片文件。`);
          return;
        }
        
        setSelectedFile(file);
        setErrorMessage(''); // 清除之前的错误消息
      } else {
        setErrorMessage('请选择支持的图片格式（JPG、PNG、GIF、BMP、TIFF、WEBP）');
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (ACCEPTED_TYPES.includes(file.type)) {
        // 检查文件大小
        if (file.size > MAX_FILE_SIZE) {
          setErrorMessage(`文件大小超出限制。请选择小于 ${MAX_FILE_SIZE / (1024 * 1024)}MB 的图片文件。`);
          return;
        }
        
        setSelectedFile(file);
        setErrorMessage(''); // 清除之前的错误消息
      } else {
        setErrorMessage('请选择支持的图片格式（JPG、PNG、GIF、BMP、TIFF、WEBP）');
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
      formData.append('taskType', 'image-to-markdown');

      const uploadResponse = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('文件上传失败');
      }

      const uploadResult = await uploadResponse.json();

      // 2. 创建处理任务
      const response = await fetch('/api/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: 'image-to-markdown',
          inputFilename: selectedFile.name,
          inputFileSize: selectedFile.size,
          inputStoragePath: uploadResult.storagePath,
          processingParams: {},
        }),
      });

      const result = await response.json();

      if (result.success && result.taskId) {
        setProcessingStatus({
          taskId: result.taskId,
          status: 'processing',
          progress: 0,
          message: '任务已创建，开始处理...',
        });

        // 2.5. 定期检查任务状态（备用机制）
        const statusCheckInterval = setInterval(async () => {
          try {
            const statusResponse = await fetch(`/api/tasks/${result.taskId}`);
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              if (statusData.success && statusData.task) {
                const task = statusData.task;
                console.log(`📋 定期状态检查: ${task.taskStatus} ${task.progressPercent}%`);
                
                if (task.taskStatus === 'completed') {
                  console.log('📋 通过状态检查发现任务已完成');
                  setProcessingStatus(prev => ({
                    ...prev,
                    status: 'completed',
                    progress: 100,
                    message: '任务完成！',
                    downloadUrl: `/api/tasks/${result.taskId}/download`,
                  }));
                  clearInterval(statusCheckInterval);
                } else if (task.taskStatus === 'failed') {
                  console.log('📋 通过状态检查发现任务失败');
                  setProcessingStatus(prev => ({
                    ...prev,
                    status: 'failed',
                    progress: 0,
                    message: task.statusMessage || '处理失败',
                  }));
                  clearInterval(statusCheckInterval);
                }
              }
            }
          } catch (error) {
            console.error('状态检查失败:', error);
          }
        }, 3000); // 每3秒检查一次

        // 3. 建立SSE连接监听状态更新
        console.log(`🔗 建立SSE连接: ${result.sseUrl}`);
        const eventSource = new EventSource(result.sseUrl);
        
        // 设置1小时超时保护
        const timeoutId = setTimeout(() => {
          eventSource.close();
          clearInterval(statusCheckInterval);
          setProcessingStatus(prev => ({
            ...prev,
            status: 'failed',
            message: '处理超时（1小时），请重试或联系支持',
          }));
        }, 3600000); // 1小时 = 3600000毫秒
        
        eventSource.onmessage = (event) => {
          console.log('🔔 图片转Markdown收到SSE消息:', event.data);
          const data = JSON.parse(event.data);
          
          if (data.type === 'status_update') {
            console.log('📊 更新状态:', data.data.status, data.data.progress + '%', data.data.message);
            setProcessingStatus(prev => ({
              ...prev,
              status: data.data.status === 'completed' ? 'completed' : 'processing',
              progress: data.data.progress || prev.progress,
              message: data.data.message || prev.message,
              downloadUrl: data.data.status === 'completed' ? `/api/tasks/${result.taskId}/download` : undefined,
            }));

            if (data.data.status === 'completed' || data.data.status === 'failed') {
              console.log('✅ 任务完成，关闭SSE连接');
              clearTimeout(timeoutId);
              clearInterval(statusCheckInterval);
              eventSource.close();
              
              // 任务完成后立即刷新通知
              const refreshEvent = new CustomEvent('refreshNotifications');
              window.dispatchEvent(refreshEvent);
            }
          }
        };

        eventSource.onopen = (event) => {
          console.log('🎉 SSE连接已建立');
        };

        eventSource.onerror = (error) => {
          console.error('❌ SSE连接错误:', error);
          clearTimeout(timeoutId);
          clearInterval(statusCheckInterval);
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
              <ImageIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              图片转Markdown
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              利用AI智能识别图片内容，将图片转换为结构化的Markdown文本
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
                  上传图片文件
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
                      <ImageIcon className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto" />
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
                          拖拽图片文件到此处，或
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById('image-file-input')?.click()}
                          className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          选择图片文件
                        </Button>
                        <input
                          id="image-file-input"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        支持JPG、PNG、GIF、BMP、TIFF、WEBP格式，最大 50MB
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

            {/* 右侧：积分预览和说明 */}
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
                        本次消耗：5积分
                      </div>
                      <div className="text-green-600 dark:text-green-400 text-sm mt-1">
                        每张图片固定消耗5积分
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
                {/* 开始处理按钮 */}
                <Button
                  onClick={startProcessing}
                  disabled={!selectedFile || processingStatus.status === 'processing' || processingStatus.status === 'uploading'}
                  className="w-full"
                >
                  {processingStatus.status === 'processing' || processingStatus.status === 'uploading' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      开始识别
                    </>
                  )}
                </Button>
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
                  <li>• 图片识别：5积分/张</li>
                  <li>• 支持多种图片格式</li>
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