const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 确保uploads目录存在
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 静态文件服务 - 提供上传的音频文件
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // 保持原文件名，添加时间戳避免冲突
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// 文件过滤器 - 只允许音频文件
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('只支持音频文件格式 (MP3, WAV, OGG)'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB 限制
  }
});

// 路由

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SingLoop Backend is running' });
});

// 上传音频文件
app.post('/api/upload', upload.single('audio'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件' });
    }

    const fileInfo = {
      id: req.file.filename.split('-')[0] + '-' + req.file.filename.split('-')[1],
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: `/uploads/${req.file.filename}`
    };

    res.json({
      success: true,
      message: '文件上传成功',
      file: fileInfo
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: '文件上传失败' });
  }
});

// 获取已上传的文件列表
app.get('/api/files', (req, res) => {
  try {
    const files = fs.readdirSync(uploadsDir)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.mp3', '.wav', '.ogg'].includes(ext);
      })
      .map(filename => {
        const filePath = path.join(uploadsDir, filename);
        const stats = fs.statSync(filePath);
        return {
          id: filename.split('-')[0] + '-' + filename.split('-')[1],
          filename: filename,
          originalName: filename.split('-').slice(2).join('-'),
          size: stats.size,
          url: `/uploads/${filename}`,
          uploadDate: stats.birthtime
        };
      });

    res.json({ files });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: '获取文件列表失败' });
  }
});

// 删除文件
app.delete('/api/files/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: '文件删除成功' });
    } else {
      res.status(404).json({ error: '文件不存在' });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: '删除文件失败' });
  }
});

// 错误处理中间件
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: '文件大小超过限制 (50MB)' });
    }
  }
  res.status(500).json({ error: error.message || '服务器内部错误' });
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 SingLoop Backend server is running on port ${PORT}`);
  console.log(`📁 Upload directory: ${uploadsDir}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;