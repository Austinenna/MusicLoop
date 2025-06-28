import React, { useState, useRef } from 'react';
import { Upload, FileAudio, AlertCircle, CheckCircle } from 'lucide-react';

const AudioUploader = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);

  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'];
  const maxSize = 50 * 1024 * 1024; // 50MB

  const validateFile = (file) => {
    if (!allowedTypes.includes(file.type)) {
      return '只支持 MP3、WAV、OGG 格式的音频文件';
    }
    if (file.size > maxSize) {
      return '文件大小不能超过 50MB';
    }
    return null;
  };

  const uploadFile = async (file) => {
    const error = validateFile(file);
    if (error) {
      setUploadStatus({ type: 'error', message: error });
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus({ 
          type: 'success', 
          message: '文件上传成功！' 
        });
        onUploadSuccess(data.file);
        
        // 3秒后清除状态
        setTimeout(() => setUploadStatus(null), 3000);
      } else {
        setUploadStatus({ 
          type: 'error', 
          message: data.error || '上传失败' 
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({ 
        type: 'error', 
        message: '网络错误，请重试' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      uploadFile(files[0]);
    }
    // 清空input值，允许重复选择同一文件
    e.target.value = '';
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <FileAudio className="w-5 h-5 mr-2 text-primary-600" />
        上传音频文件
      </h2>
      
      <div
        className={`drag-area cursor-pointer transition-all duration-200 ${
          isDragging ? 'drag-over' : ''
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center">
          {isUploading ? (
            <>
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 font-medium">正在上传...</p>
            </>
          ) : (
            <>
              <Upload className={`w-12 h-12 mb-4 ${
                isDragging ? 'text-primary-600' : 'text-gray-400'
              }`} />
              <p className="text-gray-700 font-medium mb-2">
                {isDragging ? '释放文件以上传' : '点击或拖拽文件到此处'}
              </p>
              <p className="text-sm text-gray-500">
                支持 MP3、WAV、OGG 格式，最大 50MB
              </p>
            </>
          )}
        </div>
      </div>

      {/* 状态提示 */}
      {uploadStatus && (
        <div className={`mt-4 p-3 rounded-lg flex items-center ${
          uploadStatus.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {uploadStatus.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{uploadStatus.message}</span>
        </div>
      )}
    </div>
  );
};

export default AudioUploader;