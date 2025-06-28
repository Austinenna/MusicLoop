import React, { useState, useRef, useEffect } from 'react';
import { Upload, Play, Pause, Square, RotateCcw, Volume2, Clock } from 'lucide-react';
import AudioUploader from './components/AudioUploader';
import AudioPlayer from './components/AudioPlayer';
import SegmentController from './components/SegmentController';
import FileList from './components/FileList';

function App() {
  const [currentFile, setCurrentFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [segment, setSegment] = useState({ start: 0, end: 0 });
  const [isLooping, setIsLooping] = useState(false);
  const [files, setFiles] = useState([]);
  
  const audioRef = useRef(null);
  const loopTimeoutRef = useRef(null);

  // 加载文件列表
  const loadFiles = async () => {
    try {
      const response = await fetch('/api/files');
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('加载文件列表失败:', error);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  // 音频事件处理
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const time = audio.currentTime;
      setCurrentTime(time);
      
      // 循环播放逻辑
      if (isLooping && segment.end > segment.start && time >= segment.end) {
        audio.currentTime = segment.start;
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setSegment({ start: 0, end: audio.duration });
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (isLooping && segment.end > segment.start) {
        audio.currentTime = segment.start;
        audio.play();
        setIsPlaying(true);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isLooping, segment]);

  // 播放控制
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !currentFile) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const stopAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.pause();
    audio.currentTime = segment.start;
    setIsPlaying(false);
  };

  const seekTo = (time) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.currentTime = Math.max(0, Math.min(time, duration));
  };

  // 文件选择处理
  const handleFileSelect = (file) => {
    setCurrentFile(file);
    setIsPlaying(false);
    setCurrentTime(0);
    setSegment({ start: 0, end: 0 });
  };

  // 上传成功处理
  const handleUploadSuccess = (file) => {
    setFiles(prev => [file, ...prev]);
    setCurrentFile(file);
  };

  // 删除文件处理
  const handleFileDelete = async (filename) => {
    try {
      await fetch(`/api/files/${filename}`, { method: 'DELETE' });
      setFiles(prev => prev.filter(f => f.filename !== filename));
      if (currentFile && currentFile.filename === filename) {
        setCurrentFile(null);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('删除文件失败:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MusicLoop</h1>
                <p className="text-sm text-gray-600">音乐学习助手</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>让学习更高效</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：文件管理 */}
          <div className="lg:col-span-1 space-y-6">
            <AudioUploader onUploadSuccess={handleUploadSuccess} />
            <FileList 
              files={files}
              currentFile={currentFile}
              onFileSelect={handleFileSelect}
              onFileDelete={handleFileDelete}
            />
          </div>

          {/* 右侧：播放器和控制 */}
          <div className="lg:col-span-2 space-y-6">
            {currentFile ? (
              <>
                {/* 音频播放器 */}
                <AudioPlayer
                  file={currentFile}
                  audioRef={audioRef}
                  isPlaying={isPlaying}
                  currentTime={currentTime}
                  duration={duration}
                  volume={volume}
                  playbackRate={playbackRate}
                  onTogglePlay={togglePlay}
                  onStop={stopAudio}
                  onSeek={seekTo}
                  onVolumeChange={setVolume}
                  onPlaybackRateChange={setPlaybackRate}
                />

                {/* 分段控制器 */}
                <SegmentController
                  duration={duration}
                  currentTime={currentTime}
                  segment={segment}
                  isLooping={isLooping}
                  onSegmentChange={setSegment}
                  onLoopToggle={setIsLooping}
                  onSeek={seekTo}
                />

                {/* 隐藏的音频元素 */}
                <audio
                  ref={audioRef}
                  src={`http://localhost:3001${currentFile.url}`}
                  volume={volume}
                  playbackRate={playbackRate}
                  preload="metadata"
                />
              </>
            ) : (
              <div className="card text-center py-16">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  选择或上传音频文件
                </h3>
                <p className="text-gray-500">
                  支持 MP3、WAV、OGG 格式，最大 50MB
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;