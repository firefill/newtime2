// server.js
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const http = require('http');
const path = require('path');

const app = express();
const serverHttp = http.createServer(app);

// Middleware и статические файлы
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(session({
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: './' }),
  secret: 'YOUR_SECRET_KEY',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 86400000, sameSite: 'lax' },
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Подключаемся к базе данных через config/db.js
const db = require('./config/db');

// Импорт маршрутов
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const postsRoutes = require('./routes/posts');
// Здесь можно импортировать и другие маршруты (банки, новости, и т.д.)

// Применяем маршруты
app.use('/api', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);

// Инициализируем Socket.IO через config/socket.js
const initSocket = require('./config/socket');
const io = initSocket(serverHttp);

// Пример Socket.IO событий (можно вынести в отдельный файл)
io.on('connection', (socket) => {
  console.log('Socket connected: ' + socket.id);
  // Здесь обработка событий, например, для поддержки (tickets) и т.д.
  socket.on('disconnect', () => {
    console.log('Socket disconnected: ' + socket.id);
  });
});

// Запуск сервера
const PORT = process.env.PORT || 5002;
serverHttp.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));