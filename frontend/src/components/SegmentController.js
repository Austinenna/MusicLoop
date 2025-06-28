import React, { useState, useRef, useEffect } from 'react';
import { RotateCcw, Scissors, Play, Pause } from 'lucide-react';

const SegmentController = ({
  duration,
  currentTime,
  segment,
  isLooping,
  onSegmentChange,
  onLoopToggle,
  onSeek
}) => {
  const [isDragging, setIsDragging] = useState(null); // 'start' | 'end' | null
  const timelineRef = useRef(null);

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimeFromPosition = (clientX) => {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return percent * duration;
  };

  const getPositionFromTime = (time) => {
    if (duration === 0) return 0;
    return (time / duration) * 100;
  };

  const handleMouseDown = (type, e) => {
    e.preventDefault();
    setIsDragging(type);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newTime = getTimeFromPosition(e.clientX);
    
    if (isDragging === 'start') {
      const newStart = Math.max(0, Math.min(newTime, segment.end - 1));
      onSegmentChange({ ...segment, start: newStart });
    } else if (isDragging === 'end') {
      const newEnd = Math.max(segment.start + 1, Math.min(newTime, duration));
      onSegmentChange({ ...segment, end: newEnd });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const handleTimelineClick = (e) => {
    if (isDragging) return;
    const clickTime = getTimeFromPosition(e.clientX);
    onSeek(clickTime);
  };

  const handleStartTimeChange = (e) => {
    const newStart = Math.max(0, Math.min(parseFloat(e.target.value) || 0, segment.end - 1));
    onSegmentChange({ ...segment, start: newStart });
  };

  const handleEndTimeChange = (e) => {
    const newEnd = Math.max(segment.start + 1, Math.min(parseFloat(e.target.value) || duration, duration));
    onSegmentChange({ ...segment, end: newEnd });
  };

  const setCurrentAsStart = () => {
    const newStart = Math.max(0, Math.min(currentTime, segment.end - 1));
    onSegmentChange({ ...segment, start: newStart });
  };

  const setCurrentAsEnd = () => {
    const newEnd = Math.max(segment.start + 1, Math.min(currentTime, duration));
    onSegmentChange({ ...segment, end: newEnd });
  };

  const resetSegment = () => {
    onSegmentChange({ start: 0, end: duration });
  };

  const playSegment = () => {
    onSeek(segment.start);
  };

  // 添加全局鼠标事件监听
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, segment]);

  const startPercent = getPositionFromTime(segment.start);
  const endPercent = getPositionFromTime(segment.end);
  const currentPercent = getPositionFromTime(currentTime);
  const segmentWidth = endPercent - startPercent;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Scissors className="w-5 h-5 mr-2 text-primary-600" />
          分段控制
        </h3>
        
        <button
          onClick={onLoopToggle}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors duration-200 ${
            isLooping
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>{isLooping ? '循环中' : '开始循环'}</span>
        </button>
      </div>

      {/* 时间轴 */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>0:00</span>
          <span>当前: {formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        
        <div 
          ref={timelineRef}
          className="timeline cursor-pointer"
          onClick={handleTimelineClick}
        >
          {/* 分段区域 */}
          <div
            className="timeline-segment"
            style={{
              left: `${startPercent}%`,
              width: `${segmentWidth}%`
            }}
          />
          
          {/* 当前播放位置 */}
          <div
            className="absolute top-0 w-0.5 h-full bg-red-500 z-10"
            style={{ left: `${currentPercent}%` }}
          />
          
          {/* 开始时间拖拽手柄 */}
          <div
            className="timeline-handle bg-primary-600 left-0 z-20"
            style={{ left: `${startPercent}%` }}
            onMouseDown={(e) => handleMouseDown('start', e)}
          />
          
          {/* 结束时间拖拽手柄 */}
          <div
            className="timeline-handle bg-primary-600 right-0 z-20"
            style={{ left: `${endPercent}%` }}
            onMouseDown={(e) => handleMouseDown('end', e)}
          />
        </div>
      </div>

      {/* 时间输入和控制按钮 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* 开始时间 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            开始时间 (秒)
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              min="0"
              max={segment.end - 1}
              step="0.1"
              value={segment.start.toFixed(1)}
              onChange={handleStartTimeChange}
              className="input flex-1"
            />
            <button
              onClick={setCurrentAsStart}
              className="btn-secondary whitespace-nowrap"
              disabled={currentTime >= segment.end}
            >
              设为当前
            </button>
          </div>
          <p className="text-xs text-gray-500">
            {formatTime(segment.start)}
          </p>
        </div>

        {/* 结束时间 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            结束时间 (秒)
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              min={segment.start + 1}
              max={duration}
              step="0.1"
              value={segment.end.toFixed(1)}
              onChange={handleEndTimeChange}
              className="input flex-1"
            />
            <button
              onClick={setCurrentAsEnd}
              className="btn-secondary whitespace-nowrap"
              disabled={currentTime <= segment.start}
            >
              设为当前
            </button>
          </div>
          <p className="text-xs text-gray-500">
            {formatTime(segment.end)}
          </p>
        </div>
      </div>

      {/* 分段信息和操作 */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <span className="font-medium">分段时长:</span> {formatTime(segment.end - segment.start)}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={playSegment}
            className="btn-primary flex items-center space-x-1"
            disabled={segment.end <= segment.start}
          >
            <Play className="w-4 h-4" />
            <span>播放分段</span>
          </button>
          
          <button
            onClick={resetSegment}
            className="btn-secondary"
          >
            重置
          </button>
        </div>
      </div>

      {/* 使用提示 */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-1">使用提示:</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• 拖拽时间轴上的手柄来设置分段范围</li>
          <li>• 点击时间轴可以快速跳转到指定位置</li>
          <li>• 开启循环后，播放会在分段范围内重复</li>
          <li>• 可以手动输入精确的时间值</li>
        </ul>
      </div>
    </div>
  );
};

export default SegmentController;