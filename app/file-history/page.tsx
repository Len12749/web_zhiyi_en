"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { 
  History, 
  FileText, 
  Image, 
  Languages, 
  RefreshCw,
  Download, 
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTime, formatFileSize } from '@/lib/utils';

interface Task {
  id: number;
  taskType: string;
  taskStatus: string;
  progressPercent: number;
  statusMessage: string | null;
  inputFilename: string;
  inputFileSize: number;
  resultFilename: string | null;
  resultFileSize: number | null;
  createdAt: string;
  completedAt: string | null;
  expiresAt: string;
}

const taskTypeNames = {
  'pdf-to-markdown': 'PDF解析',
  'image-to-markdown': '图片转Markdown',
  'markdown-translation': 'Markdown翻译',
  'pdf-translation': 'PDF翻译',
  'format-conversion': '格式转换',
};

const taskTypeIcons = {
  'pdf-to-markdown': FileText,
  'image-to-markdown': Image,
  'markdown-translation': Languages,
  'pdf-translation': RefreshCw,
  'format-conversion': RefreshCw,
};

const statusColors = {
  pending: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
  processing: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
  completed: 'text-green-600 bg-green-100 dark:bg-green-900/20',
  failed: 'text-red-600 bg-red-100 dark:bg-red-900/20',
};

const statusNames = {
  pending: '等待中',
  processing: '处理中',
  completed: '已完成',
  failed: '失败',
};

export default function FileHistoryPage() {
  const { user } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 获取任务历史
  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks/history');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTasks(result.tasks || []);
        }
      }
    } catch (error) {
      console.error('获取任务历史失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  // 过滤任务
  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'all' || task.taskStatus === filter;
    const matchesSearch = searchTerm === '' || 
      task.inputFilename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      taskTypeNames[task.taskType as keyof typeof taskTypeNames].includes(searchTerm);
    
    return matchesFilter && matchesSearch;
  });

  // 下载文件
  const downloadFile = async (taskId: number, filename: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/download`);
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

  // 删除任务
  const deleteTask = async (taskId: number) => {
    if (!confirm('确定要删除这个任务吗？此操作不可撤销。')) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
        setSelectedTasks(prev => prev.filter(id => id !== taskId));
      } else {
        alert('删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败');
    }
  };

  // 批量删除
  const batchDelete = async () => {
    if (selectedTasks.length === 0) return;
    
    if (!confirm(`确定要删除选中的 ${selectedTasks.length} 个任务吗？此操作不可撤销。`)) {
      return;
    }

    try {
      const promises = selectedTasks.map(taskId =>
        fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      );

      await Promise.all(promises);
      
      setTasks(prev => prev.filter(task => !selectedTasks.includes(task.id)));
      setSelectedTasks([]);
    } catch (error) {
      console.error('批量删除失败:', error);
      alert('批量删除失败');
    }
  };

  // 切换任务选择
  const toggleTaskSelection = (taskId: number) => {
    setSelectedTasks(prev => {
      if (prev.includes(taskId)) {
        return prev.filter(id => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(filteredTasks.map(task => task.id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <History className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            文件历史
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            查看和管理您的所有文件处理记录
          </p>
        </motion.div>

        {/* 工具栏 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
              {/* 搜索 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索文件名或任务类型..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm w-64"
                />
              </div>

              {/* 状态过滤 */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">全部状态</option>
                <option value="completed">已完成</option>
                <option value="processing">处理中</option>
                <option value="pending">等待中</option>
                <option value="failed">失败</option>
              </select>

              {/* 批量操作 */}
              {selectedTasks.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    已选择 {selectedTasks.length} 项
                  </span>
                  <Button
                    onClick={batchDelete}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    批量删除
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={fetchTasks}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新
              </Button>
            </div>
          </div>
        </motion.div>

        {/* 任务列表 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
        >
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {tasks.length === 0 ? '暂无处理记录' : '无匹配的记录'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {tasks.length === 0 ? '开始使用我们的服务来处理您的文件吧！' : '尝试调整搜索条件或过滤器'}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
              {/* 表头 */}
              <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-700/50">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded mr-4"
                  />
                  <div className="grid grid-cols-12 gap-4 flex-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="col-span-4">文件信息</div>
                    <div className="col-span-2">任务类型</div>
                    <div className="col-span-2">状态</div>
                    <div className="col-span-2">创建时间</div>
                    <div className="col-span-2">操作</div>
                  </div>
                </div>
              </div>

              {/* 任务列表 */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTasks.map((task, index) => {
                  const Icon = taskTypeIcons[task.taskType as keyof typeof taskTypeIcons] || FileText;
                  const isExpired = new Date(task.expiresAt) < new Date();
                  
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task.id)}
                          onChange={() => toggleTaskSelection(task.id)}
                          className="w-4 h-4 text-blue-600 rounded mr-4"
                        />
                        
                        <div className="grid grid-cols-12 gap-4 flex-1 items-center">
                          {/* 文件信息 */}
                          <div className="col-span-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {task.inputFilename}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatFileSize(task.inputFileSize)}
                                  {task.resultFileSize && ` → ${formatFileSize(task.resultFileSize)}`}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* 任务类型 */}
                          <div className="col-span-2">
                            <span className="text-sm text-gray-900 dark:text-white">
                              {taskTypeNames[task.taskType as keyof typeof taskTypeNames]}
                            </span>
                          </div>

                          {/* 状态 */}
                          <div className="col-span-2">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[task.taskStatus as keyof typeof statusColors]}`}>
                                {task.taskStatus === 'processing' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                                {task.taskStatus === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                                {task.taskStatus === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                                {task.taskStatus === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                {statusNames[task.taskStatus as keyof typeof statusNames]}
                              </span>
                              {task.taskStatus === 'processing' && (
                                <span className="text-xs text-gray-500">
                                  {task.progressPercent}%
                                </span>
                              )}
                            </div>
                            {isExpired && task.taskStatus === 'completed' && (
                              <p className="text-xs text-red-500 mt-1">已过期</p>
                            )}
                          </div>

                          {/* 创建时间 */}
                          <div className="col-span-2">
                            <p className="text-sm text-gray-900 dark:text-white">
                              {formatTime(task.createdAt)}
                            </p>
                            {task.completedAt && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                完成于 {formatTime(task.completedAt)}
                              </p>
                            )}
                          </div>

                          {/* 操作 */}
                          <div className="col-span-2">
                            <div className="flex items-center space-x-2">
                              {task.taskStatus === 'completed' && !isExpired && task.resultFilename && (
                                <Button
                                  onClick={() => downloadFile(task.id, task.resultFilename!)}
                                  size="sm"
                                  variant="outline"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                onClick={() => deleteTask(task.id)}
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 