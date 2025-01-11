const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 画像アップロードの設定
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // 画像を保存するフォルダ
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // 一意のファイル名
    }
});

const upload = multer({ storage: storage });

// 静的ファイルの提供
app.use(express.static('public'));
app.use('/uploads', express.static('uploads')); // 画像のURLを提供

// 画像アップロードAPI
app.post('/upload', upload.single('image'), (req, res) => {
    if (req.file) {
        res.json({ imageUrl: `/uploads/${req.file.filename}` }); // 画像URLをクライアントに返す
    } else {
        res.status(400).send('No file uploaded');
    }
});

// チャットの処理
let connectedUsers = 0;
io.on('connection', (socket) => {
    if (connectedUsers >= 5) {
        socket.emit('message', 'Sorry, the chat room is full.');
        socket.disconnect();
        return;
    }

    connectedUsers++;

    // メッセージを受け取ったとき
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });

    // 画像メッセージを受け取ったとき
    socket.on('image message', (imageUrl) => {
        io.emit('image message', imageUrl); // 受け取った画像を全員に送信
    });

    // ユーザーが切断したとき
    socket.on('disconnect', () => {
        connectedUsers--;
    });
});

// サーバーのポート設定
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
