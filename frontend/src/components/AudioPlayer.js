import React from 'react';
import { Play, Pause, Square, Volume2, VolumeX } from 'lucide-react';

const AudioPlayer = ({
  file,
  audioRef,
  isPlaying,
  currentTime,
  duration,
  volume,
  playbackRate,
  onTogglePlay,
  onStop,
  onSeek,
  onVolumeChange,
  onPlaybackRateChange
}) => {
  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * duration;
    onSeek(time);
  };

  const handleVolumeClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    onVolumeChange(Math.max(0, Math.min(1, percent)));
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = volume * 100;

  return (
    <div className="card">
      {/* 文件信息 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {file.originalName}
        </h2>
        <div className="flex items-center text-sm text-gray-500 space-x-4">
          <span>大小: {(file.size / 1024 / 1024).toFixed(2)} MB</span>
          <span>时长: {formatTime(duration)}</span>
          <span>格式: {file.mimetype}</span>
        </div>
      </div>

      {/* 进度条 */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div 
          className="audio-progress"
          onClick={handleProgressClick}
        >
          <div 
            className="audio-progress-bar"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 播放控制 */}
      <div className="flex items-center justify-between">
        {/* 主要控制按钮 */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onTogglePlay}
            className="w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            disabled={!duration}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </button>
          
          <button
            onClick={onStop}
            className="w-10 h-10 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            disabled={!duration}
          >
            <Square className="w-5 h-5" />
          </button>
        </div>

        {/* 播放速度控制 */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">速度:</span>
          <select
            value={playbackRate}
            onChange={(e) => onPlaybackRateChange(parseFloat(e.target.value))}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value={0.5}>0.5x</option>
            <option value={0.75}>0.75x</option>
            <option value={1}>1x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        </div>

        {/* 音量控制 */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onVolumeChange(volume > 0 ? 0 : 1)}
            className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            {volume > 0 ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </button>
          
          <div className="w-20">
            <div 
              className="h-2 bg-gray-200 rounded-full cursor-pointer"
              onClick={handleVolumeClick}
            >
              <div 
                className="h-full bg-primary-600 rounded-full transition-all duration-100"
                style={{ width: `${volumePercent}%` }}
              />
            </div>
          </div>
          
          <span className="text-xs text-gray-500 w-8">
            {Math.round(volumePercent)}%
          </span>
        </div>
      </div>

      {/* 波形可视化占位 */}
      <div className="mt-6 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="flex items-end space-x-1">
          {Array.from({ length: 50 }, (_, i) => (
            <div
              key={i}
              className={`w-1 bg-primary-400 rounded-t transition-all duration-300 ${
                isPlaying ? 'wave-animation' : ''
              }`}
              style={{
                height: `${Math.random() * 40 + 10}px`,
                animationDelay: `${i * 50}ms`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;