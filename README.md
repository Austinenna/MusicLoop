# MusicLoop - 音乐学习应用

一个专为学习音乐设计的网页应用，支持音乐分段和循环播放功能。

## 功能特性

- 🎵 音频文件上传和播放
- ✂️ 音乐分段设置（设置开始和结束时间点）
- 🔄 分段循环播放
- ⏯️ 播放控制（播放/暂停/停止）
- 📱 响应式设计，支持移动端

## 技术栈

### 前端
- React 18
- Tailwind CSS
- HTML5 Audio API

### 后端
- Node.js
- Express.js
- Multer（文件上传）

## 项目结构

```
MusicLoop/
├── frontend/          # React 前端应用
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Node.js 后端服务
│   ├── routes/
│   ├── uploads/
│   └── package.json
└── README.md
```

## 快速开始

### 后端启动
```bash
cd backend
npm install
npm start
```

### 前端启动
```bash
cd frontend
npm install
npm start
```

## 使用说明

1. 上传音频文件（支持 MP3, WAV 格式）
2. 使用时间轴设置分段的开始和结束时间
3. 点击循环播放按钮开始学习
4. 可以调整播放速度和音量

## 开发计划

- [x] 基础项目结构
- [ ] 音频上传功能
- [ ] 音频播放器组件
- [ ] 分段设置界面
- [ ] 循环播放逻辑
- [ ] 响应式UI设计