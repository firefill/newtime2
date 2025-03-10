// server.js

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const http = require('http');

const app = express();
const serverHttp = http.createServer(app);

// Настройка Socket.IO с передачей credentials: true
const { Server } = require('socket.io');
const io = new Server(serverHttp, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Настройка CORS для Express
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Настройка сессии с использованием SQLiteStore
app.use(session({
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: './' }),
  secret: 'YOUR_SECRET_KEY', // замените на свой секрет
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 86400000, sameSite: 'lax' }
}));

// Подключаемся к базе данных SQLite
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error("Ошибка подключения к базе данных:", err.message);
  } else {
    console.log("Подключились к базе данных SQLite");
  }
});

// Создаем таблицу пользователей, если её еще нет
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      nickname TEXT UNIQUE,
      password TEXT,
      source TEXT,
      age INTEGER,
      rpParticipation INTEGER,
      codeWord TEXT,
      role TEXT DEFAULT 'Игрок',
      status TEXT DEFAULT 'pending',
      guild TEXT DEFAULT '',
      playTime INTEGER DEFAULT 0,
      skin TEXT DEFAULT '',
      ar INTEGER DEFAULT 0,
      eventMoney INTEGER DEFAULT 0,
      donateMoney INTEGER DEFAULT 0,
      muteUntil INTEGER DEFAULT 0,
      banUntil INTEGER DEFAULT 0
    )
  `, (err) => {
    if (err) {
      console.error("Ошибка создания таблицы users:", err.message);
    } else {
      console.log("Таблица users готова");

      // Автосоздание пользователя "dustyluvv" с ролью "Создатель"
      db.get(`SELECT * FROM users WHERE nickname = ?`, ['dustyluvv'], (err, user) => {
        if (err) {
          console.error("Ошибка проверки наличия dustyluvv:", err.message);
        } else if (!user) {
          bcrypt.hash('123123', 10, (err, hashedPassword) => {
            if (err) {
              console.error("Ошибка хеширования пароля для dustyluvv:", err.message);
            } else {
              const query = `
                INSERT INTO users 
                (name, nickname, password, source, age, rpParticipation, codeWord, role, status, guild, playTime, skin, ar, eventMoney, donateMoney)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `;
              db.run(query, [
                'Administrator',
                'dustyluvv',
                hashedPassword,
                'auto',
                0,
                0,
                'auto',
                'Создатель',
                'approved',
                '',
                0,
                '',
                0,
                0,
                0
              ], function(err) {
                if (err) {
                  console.error("Ошибка создания dustyluvv:", err.message);
                } else {
                  console.log("Пользователь 'dustyluvv' успешно создан с ролью 'Создатель'.");
                }
              });
            }
          });
        } else {
          if (user.role !== 'Создатель') {
            db.run(`UPDATE users SET role = ? WHERE id = ?`, ['Создатель', user.id], function(err) {
              if (err) {
                console.error("Ошибка обновления роли для dustyluvv:", err.message);
              } else {
                console.log("Роль пользователя 'dustyluvv' обновлена до 'Создатель'.");
              }
            });
          } else {
            console.log("Пользователь 'dustyluvv' уже существует с ролью 'Создатель'.");
          }
        }
      });

      // Автосоздание тестового аккаунта "Nikita" с ролью "Игрок"
      db.get(`SELECT * FROM users WHERE nickname = ?`, ['Nikita'], (err, user) => {
        if (err) {
          console.error("Ошибка проверки наличия Nikita:", err.message);
        } else if (!user) {
          bcrypt.hash('password', 10, (err, hashedPassword) => {
            if (err) {
              console.error("Ошибка хеширования пароля для Nikita:", err.message);
            } else {
              const query = `
                INSERT INTO users (name, nickname, password, source, age, rpParticipation, codeWord, role, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
              `;
              db.run(query, [
                'Test User',
                'Nikita',
                hashedPassword,
                'auto',
                0,
                0,
                'auto',
                'Игрок',
                'approved'
              ], function(err) {
                if (err) {
                  console.error("Ошибка создания Nikita:", err.message);
                } else {
                  console.log("Тестовый аккаунт 'Nikita' успешно создан с ролью 'Игрок'.");
                }
              });
            }
          });
        } else {
          console.log("Тестовый аккаунт 'Nikita' уже существует.");
        }
      });
    }
  });
});

// Создаем таблицу для заявок поддержки, если её нет
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS support_tickets (
      ticketId TEXT PRIMARY KEY,
      topic TEXT,
      urgency TEXT,
      description TEXT,
      userNickname TEXT,
      admin TEXT,
      messages TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error("Ошибка создания таблицы support_tickets:", err.message);
    } else {
      console.log("Таблица support_tickets готова");
    }
  });
});

// Эндпоинт регистрации
app.post('/api/register', (req, res) => {
  const { name, nickname, password, source, age, rpParticipation, codeWord } = req.body;
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ message: "Ошибка хеширования пароля" });
    }
    const query = `
      INSERT INTO users (name, nickname, password, source, age, rpParticipation, codeWord)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(query, [name, nickname, hashedPassword, source, age, rpParticipation ? 1 : 0, codeWord], function(err) {
      if (err) {
        console.error("Ошибка регистрации:", err.message);
        return res.status(500).json({ message: "Ошибка при регистрации" });
      }
      res.status(201).json({ message: "Заявка отправлена. Ожидайте одобрения модератора." });
    });
  });
});

// Эндпоинт входа: сохраняем id пользователя в сессии
app.post('/api/login', (req, res) => {
  const { nickname, password } = req.body;
  const query = `SELECT * FROM users WHERE nickname = ?`;
  db.get(query, [nickname], (err, user) => {
    if (err) {
      console.error("Ошибка при поиске пользователя:", err.message);
      return res.status(500).json({ message: "Ошибка сервера" });
    }
    if (!user) {
      return res.status(400).json({ message: "Пользователь не найден" });
    }
    if (user.status !== 'approved') {
      return res.status(403).json({ message: "Пользователь не одобрен" });
    }
    bcrypt.compare(password, user.password, (err, valid) => {
      if (err || !valid) {
        return res.status(400).json({ message: "Неверный пароль" });
      }
      req.session.userId = user.id;
      console.log(`Пользователь ${user.nickname} успешно вошёл в систему.`);
      res.json({ message: "Успешный вход" });
    });
  });
});

// Эндпоинт выхода: уничтожаем сессию
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: "Ошибка выхода" });
    }
    console.log("Пользователь вышел из системы.");
    res.json({ message: "Вы вышли" });
  });
});

// Middleware для проверки сессии
function authMiddleware(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Неавторизован" });
  }
  next();
}

// Эндпоинт получения данных пользователя
app.get('/api/me', authMiddleware, (req, res) => {
  const query = `
    SELECT id, name, nickname, role, guild, playTime, skin, ar, eventMoney, donateMoney 
    FROM users 
    WHERE id = ?
  `;
  db.get(query, [req.session.userId], (err, user) => {
    if (err) {
      console.error("Ошибка получения данных пользователя:", err.message);
      return res.status(500).json({ message: "Ошибка сервера" });
    }
    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    res.json(user);
  });
});

// Эндпоинт для получения списка всех пользователей (для админ-поддержки)
app.get('/api/users', authMiddleware, (req, res) => {
  db.get(`SELECT role FROM users WHERE id = ?`, [req.session.userId], (err, currentUser) => {
    if (err) {
      return res.status(500).json({ message: "Ошибка сервера" });
    }
    if (!currentUser || !["Поддержка", "Администратор", "Создатель"].includes(currentUser.role)) {
      return res.status(403).json({ message: "Нет доступа" });
    }
    db.all(`SELECT id, name, nickname, role, status, guild, playTime, muteUntil, banUntil FROM users`, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ message: "Ошибка получения пользователей" });
      }
      res.json(rows);
    });
  });
});

// Эндпоинт для обновления данных пользователя (без gameRole)
app.put('/api/users/:id', authMiddleware, (req, res) => {
  db.get(`SELECT role FROM users WHERE id = ?`, [req.session.userId], (err, currentUser) => {
    if (err) {
      return res.status(500).json({ message: "Ошибка сервера" });
    }
    if (!currentUser || !["Поддержка", "Администратор", "Создатель"].includes(currentUser.role)) {
      return res.status(403).json({ message: "Нет доступа" });
    }
    const { role, guild, muteUntil, banUntil, status, playTime, skin, ar, eventMoney, donateMoney } = req.body;
    const query = `
      UPDATE users SET 
        role = COALESCE(?, role),
        guild = COALESCE(?, guild),
        muteUntil = COALESCE(?, muteUntil),
        banUntil = COALESCE(?, banUntil),
        status = COALESCE(?, status),
        playTime = COALESCE(?, playTime),
        skin = COALESCE(?, skin),
        ar = COALESCE(?, ar),
        eventMoney = COALESCE(?, eventMoney),
        donateMoney = COALESCE(?, donateMoney)
      WHERE id = ?
    `;
    db.run(query, [role, guild, muteUntil, banUntil, status, playTime, skin, ar, eventMoney, donateMoney, req.params.id], function(err) {
      if (err) {
        return res.status(500).json({ message: "Ошибка обновления пользователя" });
      }
      res.json({ message: "Пользователь обновлён" });
    });
  });
});

/* ===========================================
   Реализация поддержки с чатом через Socket.IO
   =========================================== */

io.on('connection', (socket) => {
  console.log('Socket connected: ' + socket.id);

  // Обработка создания заявки поддержки
  socket.on('createTicket', (ticketData) => {
    const ticketId = Date.now().toString();
    const messages = JSON.stringify([]);
    const query = `
      INSERT INTO support_tickets (ticketId, topic, urgency, description, userNickname, admin, messages)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(query, [ticketId, ticketData.topic, ticketData.urgency, ticketData.description, ticketData.userNickname, null, messages], function(err) {
      if (err) {
        console.error("Ошибка создания тикета:", err.message);
      } else {
        const ticket = {
          ticketId,
          topic: ticketData.topic,
          urgency: ticketData.urgency,
          description: ticketData.description,
          userNickname: ticketData.userNickname,
          admin: null,
          messages: []
        };
        socket.join(ticketId);
        // Отправляем событие новым тикетом создателю и в комнату "admins"
        socket.emit('newTicket', ticket);
        io.to('admins').emit('newTicket', ticket);
        console.log('Новая заявка создана, ticketId: ' + ticketId);
      }
    });
  });

  // Получение тикетов для пользователя (для клиентов)
  socket.on('getUserTickets', (userNickname) => {
    db.all(`SELECT * FROM support_tickets WHERE userNickname = ?`, [userNickname], (err, rows) => {
      if (err) {
        console.error("Ошибка получения тикетов для пользователя:", err.message);
        socket.emit('userTickets', []);
      } else {
        const tickets = rows.map(ticket => {
          try {
            ticket.messages = JSON.parse(ticket.messages);
          } catch (e) {
            ticket.messages = [];
          }
          return ticket;
        });
        socket.emit('userTickets', tickets);
        console.log(`Отправлены тикеты для пользователя ${userNickname}`);
      }
    });
  });

  // Администратор присоединяется как админ
  socket.on('joinAsAdmin', (adminNickname) => {
    socket.join('admins');
    socket.adminNickname = adminNickname;
    console.log(`Админ ${adminNickname} присоединился к комнате admins`);
    // Отправляем администратору все текущие тикеты из БД
    db.all(`SELECT * FROM support_tickets`, [], (err, rows) => {
      if (err) {
        console.error("Ошибка получения всех тикетов:", err.message);
      } else {
        const tickets = rows.map(ticket => {
          try {
            ticket.messages = JSON.parse(ticket.messages);
          } catch (e) {
            ticket.messages = [];
          }
          return ticket;
        });
        socket.emit('allTickets', tickets);
        console.log("Отправлены все тикеты администратору");
      }
    });
  });

  // Обработка взятия тикета администратором
  socket.on('takeTicket', (ticketId) => {
    const query = `UPDATE support_tickets SET admin = ? WHERE ticketId = ? AND admin IS NULL`;
    db.run(query, [socket.adminNickname, ticketId], function(err) {
      if (err) {
        console.error("Ошибка взятия тикета:", err.message);
        return;
      }
      db.get(`SELECT * FROM support_tickets WHERE ticketId = ?`, [ticketId], (err, ticket) => {
        if (err) {
          console.error("Ошибка получения обновленного тикета:", err.message);
          return;
        }
        try {
          ticket.messages = JSON.parse(ticket.messages);
        } catch (e) {
          ticket.messages = [];
        }
        io.to(ticketId).emit('ticketTaken', ticket);
        io.to('admins').emit('ticketUpdated', ticket);
        console.log(`Тикет ${ticketId} взят админом ${socket.adminNickname}`);
      });
    });
  });

  // Обработка сообщений в чате тикета
  socket.on('ticketMessage', (data) => {
    const query = `SELECT messages FROM support_tickets WHERE ticketId = ?`;
    db.get(query, [data.ticketId], (err, row) => {
      if (err) {
        console.error("Ошибка получения сообщений тикета:", err.message);
        return;
      }
      let messages = [];
      if (row && row.messages) {
        try {
          messages = JSON.parse(row.messages);
        } catch (e) {
          console.error("Ошибка парсинга сообщений:", e.message);
        }
      }
      const newMessage = {
        sender: data.sender,
        message: data.message,
        timestamp: Date.now()
      };
      messages.push(newMessage);
      const updateQuery = `UPDATE support_tickets SET messages = ? WHERE ticketId = ?`;
      db.run(updateQuery, [JSON.stringify(messages), data.ticketId], function(err) {
        if (err) {
          console.error("Ошибка обновления сообщений:", err.message);
          return;
        }
        // Сразу считываем обновленные сообщения для отладки
        db.get(`SELECT messages FROM support_tickets WHERE ticketId = ?`, [data.ticketId], (err, row) => {
          if (err) {
            console.error("Ошибка проверки обновленных сообщений:", err.message);
          } else {
            console.log("Обновленные сообщения в базе:", row.messages);
          }
        });
        io.to(data.ticketId).emit('ticketMessage', messages);
        console.log(`Сообщение добавлено в тикет ${data.ticketId}: ${data.message}`);
      });
    });
  });

  // Обработка присоединения к комнате тикета
  socket.on('joinTicket', (ticketId) => {
    socket.join(ticketId);
    console.log(`Socket ${socket.id} присоединился к тикету ${ticketId}`);
    // Получаем историю сообщений из базы для данного тикета и отправляем сокету
    const query = `SELECT messages FROM support_tickets WHERE ticketId = ?`;
    db.get(query, [ticketId], (err, row) => {
      if (err) {
        console.error("Ошибка получения истории сообщений для тикета:", err.message);
        return;
      }
      let messages = [];
      if (row && row.messages) {
        try {
          messages = JSON.parse(row.messages);
        } catch (e) {
          console.error("Ошибка парсинга сообщений для тикета:", e.message);
        }
      }
      socket.emit('ticketMessage', messages);
      console.log(`Отправлена история сообщений для тикета ${ticketId}: ${JSON.stringify(messages)}`);
    });
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected: ' + socket.id);
  });
});

const PORT = process.env.PORT || 5002;
serverHttp.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));