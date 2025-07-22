"use client";

import React, { useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Languages, Upload, AlertCircle, CheckCircle2, Loader2, Download, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

// 支持的文件格式
const SUPPORTED_FILE_TYPES = [
  'text/markdown',
  '.md'
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

// 支持的语言选项
const LANGUAGES = [
  { code: 'zh', name: '中文' },
  { code: 'en', name: '英语' },
  { code: 'ja', name: '日语' },
  { code: 'ko', name: '韩语' },
  { code: 'fr', name: '法语' },
  { code: 'de', name: '德语' },
  { code: 'es', name: '西班牙语' },
  { code: 'ru', name: '俄语' },
];

interface ProcessingStatus {
  taskId: string | null;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  downloadUrl?: string;
}

export default function MarkdownTranslationPage() {
  const { user } = useUser();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState('zh');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    taskId: null,
    status: 'idle',
    progress: 0,
    message: '',
  });

  // 处理文件选择
  const handleFileChange = useCallback((file: File) => {
    const isValidType = SUPPORTED_FILE_TYPES.some(type => 
      file.type === type || file.name.toLowerCase().endsWith(type)
    );

    if (!isValidType) {
      alert('不支持的文件格式。请选择 .md 格式的文件。');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert('文件大小超出限制。请选择小于 100MB 的文件。');
      return;
    }

    setSelectedFile(file);
    setProcessingStatus({
      taskId: null,
      status: 'idle',
      progress: 0,
      message: '',
    });
  }, []);

  // 拖拽处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  }, [handleFileChange]);

  // 开始处理
  const startProcessing = async () => {
    if (!selectedFile || !user) return;

    setProcessingStatus({
      taskId: null,
      status: 'uploading',
      progress: 0,
      message: '正在上传文件...',
    });

    try {
      // 1. 上传文件
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('taskType', 'markdown-translation');

      const uploadResponse = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('文件上传失败');
      }

      const uploadResult = await uploadResponse.json();
      
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
          taskType: 'markdown-translation',
          inputFilename: selectedFile.name,
          inputFileSize: selectedFile.size,
          inputStoragePath: uploadResult.storagePath,
          processingParams,
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
        
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'status_update' && data.data.taskId === result.taskId) {
              const { status, progress, message } = data.data;
              
              setProcessingStatus(prev => ({
                ...prev,
                status: status as ProcessingStatus['status'],
                progress: progress || 0,
                message: message || '翻译中...',
                downloadUrl: status === 'completed' ? `/api/tasks/${result.taskId}/download` : undefined,
              }));

              if (status === 'completed' || status === 'failed') {
                eventSource.close();
              }
            }
          } catch (error) {
            console.error('解析SSE消息失败:', error);
          }
        };

        eventSource.onerror = () => {
          eventSource.close();
          setProcessingStatus(prev => ({
            ...prev,
            status: 'failed',
            message: '连接中断，请刷新页面查看结果'
          }));
        };

      } else {
        throw new Error(result.message || '创建任务失败');
      }

    } catch (error) {
      console.error('处理失败:', error);
      setProcessingStatus({
        taskId: null,
        status: 'failed',
        progress: 0,
        message: error instanceof Error ? error.message : '翻译失败，请重试',
      });
    }
  };

  // 重置表单
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
            <Languages className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Markdown翻译
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            将Markdown文档翻译为其他语言，保留原始格式和结构
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">选择Markdown文件</h3>
              
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : selectedFile
                    ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {selectedFile ? (
                  <div className="space-y-3">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedFile(null)}
                      className="text-sm"
                    >
                      重新选择
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        拖拽Markdown文件到这里，或
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('file-input')?.click()}
                      >
                        选择Markdown文件
                      </Button>
                      <input
                        id="file-input"
                        type="file"
                        accept=".md"
                        onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                        className="hidden"
                      />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      支持 .md 格式，最大 100MB
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">处理状态</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {processingStatus.status === 'uploading' || processingStatus.status === 'processing' ? (
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                    ) : processingStatus.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {processingStatus.message}
                    </span>
                  </div>

                  {(processingStatus.status === 'uploading' || processingStatus.status === 'processing') && (
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
                        翻译新文件
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
                  
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center border border-green-200 dark:border-green-800">
                    <div className="text-green-800 dark:text-green-200 font-medium">
                      本次消耗：{Math.max(1, Math.ceil(selectedFile.size / 1024) * 5)}积分
                    </div>
                    <div className="text-green-600 dark:text-green-400 text-sm mt-1">
                      5积分/KB（最少1KB）
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
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    {LANGUAGES.map((lang) => (
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
                    className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            {/* 开始处理按钮 */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <Button
                onClick={startProcessing}
                disabled={!selectedFile || !user || sourceLanguage === targetLanguage || processingStatus.status === 'uploading' || processingStatus.status === 'processing'}
                className="w-full"
                size="lg"
              >
                {processingStatus.status === 'uploading' || processingStatus.status === 'processing' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    翻译中...
                  </>
                ) : (
                  <>
                    <Languages className="h-4 w-4 mr-2" />
                    开始翻译
                  </>
                )}
              </Button>
              
              {sourceLanguage === targetLanguage && (
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-2 text-center">
                  源语言和目标语言不能相同
                </p>
              )}
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
                <li>• Markdown翻译：5积分/KB</li>
                <li>• 保留原始格式和结构</li>
                <li>• 处理失败将返还积分</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 