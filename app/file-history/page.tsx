"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  History, 
  Download, 
  Trash2, 
  Eye, 
  FileText, 
  Image, 
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  Search,
  Package,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthGuard } from '@/components/common/auth-guard';

// 任务类型
type TaskType = 'pdf-to-markdown' | 'image-to-markdown' | 'markdown-translation' | 'pdf-translation' | 'format-conversion';
type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface FileHistoryItem {
  id: number;
  taskType: TaskType;
  taskStatus: TaskStatus;
  progressPercent: number;
  statusMessage: string | null;
  inputFilename: string;
  inputFileSize: number;
  resultFilename: string | null;
  resultFileSize: number | null;
  actualPointsUsed: number;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
  expiresAt: string;
}

const taskTypeNames: Record<TaskType, string> = {
  'pdf-to-markdown': 'PDF解析',
  'image-to-markdown': '图片转Markdown',
  'markdown-translation': 'Markdown翻译',
  'pdf-translation': 'PDF翻译',
  'format-conversion': '格式转换'
};

const statusColors: Record<TaskStatus, string> = {
  completed: 'text-green-600 bg-green-100 dark:bg-green-900/20',
  processing: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  failed: 'text-red-600 bg-red-100 dark:bg-red-900/20',
  pending: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
};

const statusIcons: Record<TaskStatus, any> = {
  completed: CheckCircle,
  processing: Loader,
  failed: XCircle,
  pending: Clock
};

export default function FileHistoryPage() {
  const [files, setFiles] = useState<FileHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [isBatchMode, setIsBatchMode] = useState(false);

  // 获取文件历史
  const fetchFileHistory = async () => {
    try {
      const response = await fetch('/api/tasks/history');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setFiles(result.tasks || []);
        }
      }
    } catch (error) {
      console.error('获取文件历史失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFileHistory();
  }, []);

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.inputFilename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         taskTypeNames[file.taskType].includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || file.taskStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSelectFile = (fileId: number) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map(file => file.id));
    }
  };

  const handleDownload = async (fileId: number, filename: string) => {
    try {
      const response = await fetch(`/api/tasks/${fileId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('下载失败');
      }
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败');
    }
  };

  const handleBatchDownload = async () => {
    if (selectedFiles.length === 0) return;
    
    const completedFiles = filteredFiles.filter(file => 
      selectedFiles.includes(file.id) && 
      file.taskStatus === 'completed' && 
      file.resultFilename &&
      !isExpired(file.expiresAt)
    );
    
    if (completedFiles.length === 0) {
      alert('没有可下载的已完成文件（可能文件已过期）');
      return;
    }

    // 如果只有一个文件，直接下载
    if (completedFiles.length === 1) {
      await handleDownload(completedFiles[0].id, completedFiles[0].resultFilename!);
      return;
    }

    // 多个文件时，逐个下载
    try {
      for (const file of completedFiles) {
        await new Promise(resolve => setTimeout(resolve, 500)); // 防止并发过多
        await handleDownload(file.id, file.resultFilename!);
      }
      alert(`成功下载 ${completedFiles.length} 个文件`);
    } catch (error) {
      console.error('批量下载失败:', error);
      alert('批量下载失败');
    }
  };

  const handleDelete = async (fileId: number) => {
    if (!confirm('确定要删除这个任务吗？此操作不可撤销。')) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFiles(prev => prev.filter(file => file.id !== fileId));
        setSelectedFiles(prev => prev.filter(id => id !== fileId));
      } else {
        alert('删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedFiles.length === 0) return;
    
    if (!confirm(`确定要删除选中的 ${selectedFiles.length} 个任务吗？此操作不可撤销。`)) {
      return;
    }

    try {
      const promises = selectedFiles.map(fileId =>
        fetch(`/api/tasks/${fileId}`, { method: 'DELETE' })
      );

      await Promise.all(promises);
      
      setFiles(prev => prev.filter(file => !selectedFiles.includes(file.id)));
      setSelectedFiles([]);
    } catch (error) {
      console.error('批量删除失败:', error);
      alert('批量删除失败');
    }
  };

  const toggleBatchMode = () => {
    setIsBatchMode(!isBatchMode);
    if (isBatchMode) {
      setSelectedFiles([]);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">加载文件历史中...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 页面标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-center"
          >
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              文件历史
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              查看和管理您处理过的所有文件，支持重新下载和删除
            </p>
          </motion.div>

          {/* 搜索和过滤 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6"
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* 搜索框 */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索文件名或任务类型..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 状态过滤 */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">所有状态</option>
                <option value="completed">已完成</option>
                <option value="processing">处理中</option>
                <option value="failed">失败</option>
              </select>

              {/* 批量管理按钮 */}
              <Button 
                onClick={toggleBatchMode}
                variant={isBatchMode ? "default" : "outline"}
                size="sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                {isBatchMode ? '退出批量管理' : '批量管理'}
              </Button>

              {/* 批量操作 */}
              {isBatchMode && selectedFiles.length > 0 && (
                <div className="flex gap-2">
                  <Button onClick={handleBatchDownload} variant="outline" size="sm">
                    <Package className="h-4 w-4 mr-2" />
                    批量下载 ({selectedFiles.filter(id => {
                      const file = filteredFiles.find(f => f.id === id);
                      return file?.taskStatus === 'completed' && file?.resultFilename;
                    }).length})
                  </Button>
                  <Button onClick={handleBatchDelete} variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    删除 ({selectedFiles.length})
                  </Button>
                </div>
              )}
            </div>
          </motion.div>

          {/* 文件列表 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* 表头 */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-700">
              <div className="flex items-center">
                {isBatchMode && (
                  <input
                    type="checkbox"
                    checked={selectedFiles.length === filteredFiles.length && filteredFiles.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-4"
                  />
                )}
                <div className={`grid grid-cols-12 gap-4 w-full text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${!isBatchMode ? 'ml-0' : ''}`}>
                  <div className="col-span-3">文件信息</div>
                  <div className="col-span-2">类型</div>
                  <div className="col-span-2">状态</div>
                  <div className="col-span-2">时间</div>
                  <div className="col-span-1">积分</div>
                  <div className="col-span-2">操作</div>
                </div>
              </div>
            </div>

            {/* 文件列表 */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredFiles.map((file, index) => {
                const StatusIcon = statusIcons[file.taskStatus];
                const expired = isExpired(file.expiresAt);
                
                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center">
                      {isBatchMode && (
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={() => handleSelectFile(file.id)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-4"
                        />
                      )}
                      <div className={`grid grid-cols-12 gap-4 w-full items-center ${!isBatchMode ? 'ml-0' : ''}`}>
                        {/* 文件信息 */}
                        <div className="col-span-3 flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                            {file.taskType.includes('image') ? (
                              <Image className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {file.inputFilename}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatFileSize(file.inputFileSize)}
                              {file.resultFileSize && ` → ${formatFileSize(file.resultFileSize)}`}
                            </p>
                            {expired && file.taskStatus === 'completed' && (
                              <p className="text-xs text-red-500">已过期</p>
                            )}
                          </div>
                        </div>

                        {/* 类型 */}
                        <div className="col-span-2">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {taskTypeNames[file.taskType]}
                          </span>
                        </div>

                        {/* 状态 */}
                        <div className="col-span-2">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[file.taskStatus]}`}>
                              <StatusIcon className={`h-3 w-3 mr-1 ${(file.taskStatus === 'processing' || file.taskStatus === 'pending') ? 'animate-spin' : ''}`} />
                              {file.taskStatus === 'completed' && '已完成'}
                              {(file.taskStatus === 'processing' || file.taskStatus === 'pending') && '处理中'}
                              {file.taskStatus === 'failed' && '失败'}
                            </span>
                          </div>
                          {file.taskStatus === 'failed' && file.errorMessage && (
                            <p className="text-xs text-red-500 mt-1">
                              {file.errorMessage}
                            </p>
                          )}
                        </div>

                        {/* 时间 */}
                        <div className="col-span-2">
                          <p className="text-sm text-gray-900 dark:text-white">
                            {formatTime(file.createdAt)}
                          </p>
                          {file.completedAt && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              完成于 {formatTime(file.completedAt)}
                            </p>
                          )}
                        </div>

                        {/* 积分 */}
                        <div className="col-span-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {file.actualPointsUsed || 0}
                          </span>
                        </div>

                        {/* 操作 */}
                        <div className="col-span-2">
                          <div className="flex items-center space-x-2">
                            {file.taskStatus === 'completed' && !expired && file.resultFilename && (
                              <button
                                onClick={() => handleDownload(file.id, file.resultFilename!)}
                                className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                title="下载"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(file.id)}
                              className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                              title="删除"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* 空状态 */}
            {filteredFiles.length === 0 && (
              <div className="px-6 py-12 text-center">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {searchTerm || filterStatus !== 'all' ? '没有找到匹配的文件' : '还没有处理过文件'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || filterStatus !== 'all' 
                    ? '尝试调整搜索条件或过滤器' 
                    : '开始上传和处理您的第一个文件吧'
                  }
                </p>
              </div>
            )}
          </motion.div>

          {/* 存储说明 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800"
          >
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
              文件存储说明
            </h4>
            <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
              <li>• 处理完成的文件将保留7天，请及时下载</li>
              <li>• 您可以随时删除不需要的文件释放存储空间</li>
              <li>• 处理失败的文件不消耗积分，可以重新处理</li>
              <li>• 支持批量下载和删除操作，提高操作效率</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </AuthGuard>
  );
} 