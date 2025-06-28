import React, { useState } from 'react';
import { Music, Trash2, Play, Clock, HardDrive } from 'lucide-react';

const FileList = ({ files, currentFile, onFileSelect, onFileDelete }) => {
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileExtension = (filename) => {
    return filename.split('.').pop().toUpperCase();
  };

  const handleDeleteClick = (filename, e) => {
    e.stopPropagation();
    setDeleteConfirm(filename);
  };

  const confirmDelete = (filename) => {
    onFileDelete(filename);
    setDeleteConfirm(null);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  if (files.length === 0) {
    return (
      <div className="card text-center py-8">
        <Music className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">暂无音频文件</h3>
        <p className="text-gray-500 text-sm">
          上传您的第一个音频文件开始学习
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <HardDrive className="w-5 h-5 mr-2 text-primary-600" />
        音频文件 ({files.length})
      </h2>
      
      <div className="space-y-2 max-h-96 overflow-y-auto hide-scrollbar">
        {files.map((file) => {
          const isSelected = currentFile && currentFile.filename === file.filename;
          const isDeleting = deleteConfirm === file.filename;
          
          return (
            <div key={file.filename}>
              {/* 文件项 */}
              <div
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => !isDeleting && onFileSelect(file)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    {/* 文件图标 */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'bg-primary-600' : 'bg-gray-200'
                    }`}>
                      {isSelected ? (
                        <Play className="w-5 h-5 text-white" />
                      ) : (
                        <Music className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    
                    {/* 文件信息 */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium truncate ${
                        isSelected ? 'text-primary-900' : 'text-gray-900'
                      }`}>
                        {file.originalName}
                      </h3>
                      
                      <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center">
                          <HardDrive className="w-3 h-3 mr-1" />
                          {formatFileSize(file.size)}
                        </span>
                        
                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-medium">
                          {getFileExtension(file.filename)}
                        </span>
                        
                        {file.uploadDate && (
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDate(file.uploadDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* 删除按钮 */}
                  <button
                    onClick={(e) => handleDeleteClick(file.filename, e)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors duration-200 flex-shrink-0"
                    title="删除文件"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {/* 当前播放指示器 */}
                {isSelected && (
                  <div className="mt-2 flex items-center text-xs text-primary-600">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mr-2 animate-pulse"></div>
                    当前选中
                  </div>
                )}
              </div>
              
              {/* 删除确认 */}
              {isDeleting && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 mb-3">
                    确定要删除 "{file.originalName}" 吗？此操作无法撤销。
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => confirmDelete(file.filename)}
                      className="btn-danger text-xs py-1 px-3"
                    >
                      确认删除
                    </button>
                    <button
                      onClick={cancelDelete}
                      className="btn-secondary text-xs py-1 px-3"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* 文件统计 */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>总文件数: {files.length}</span>
          <span>
            总大小: {formatFileSize(files.reduce((total, file) => total + file.size, 0))}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FileList;