const socket = io();

const joinContainer = document.getElementById('join-container');
const chatContainer = document.getElementById('chat-container');
const joinForm = document.getElementById('join-form');
const usernameInput = document.getElementById('username');
const roomInput = document.getElementById('room');
const errorMessage = document.getElementById('error-message');
const roomNameDisplay = document.getElementById('room-name');
const usersDisplay = document.getElementById('users');
const messagesDisplay = document.getElementById('messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

let room = '';
let username = '';

// ルームに参加
joinForm.addEventListener('submit', (e) => {
  e.preventDefault();
  username = usernameInput.value.trim();
  room = roomInput.value.trim();

  socket.emit('join-room', { room, username });

  socket.on('room-full', () => {
    errorMessage.textContent = `Room "${room}" is full. Please try another room.`;
  });

  socket.on('user-joined', ({ username, users }) => {
    if (!chatContainer.style.display) {
      joinContainer.style.display = 'none';
      chatContainer.style.display = 'flex';
      roomNameDisplay.textContent = room;
    }
    updateUsers(users);
    addMessage(`${username} joined the room.`);
  });
});

// メッセージ送信
messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (message) {
    socket.emit('chat-message', { room, message, username });
    messageInput.value = '';
  }
});

// メッセージ受信
socket.on('chat-message', ({ username, message }) => {
  addMessage(`${username}: ${message}`);
});

// ユーザーが退出
socket.on('user-left', ({ username, users }) => {
  updateUsers(users);
  addMessage(`${username} left the room.`);
});

// メッセージを表示
function addMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.textContent = message;
  messagesDisplay.appendChild(messageElement);
  messagesDisplay.scrollTop = messagesDisplay.scrollHeight;
}

// ユーザーリストを更新
function updateUsers(users) {
  usersDisplay.textContent = `Users in room: ${users.join(', ')}`;
}
