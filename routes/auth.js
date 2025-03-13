// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/db');

const router = express.Router();

router.post('/register', (req, res) => {
  const { name, nickname, password, source, age, rpParticipation, codeWord } = req.body;
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ message: "Ошибка хеширования пароля" });
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

router.post('/login', (req, res) => {
  const { nickname, password } = req.body;
  const query = `SELECT * FROM users WHERE nickname = ?`;
  db.get(query, [nickname], (err, user) => {
    if (err) {
      console.error("Ошибка при поиске пользователя:", err.message);
      return res.status(500).json({ message: "Ошибка сервера" });
    }
    if (!user) return res.status(400).json({ message: "Пользователь не найден" });
    if (user.status !== 'approved') return res.status(403).json({ message: "Пользователь не одобрен" });
    bcrypt.compare(password, user.password, (err, valid) => {
      if (err || !valid) return res.status(400).json({ message: "Неверный пароль" });
      req.session.userId = user.id;
      console.log(`Пользователь ${user.nickname} успешно вошёл в систему.`);
      res.json({ message: "Успешный вход" });
    });
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: "Ошибка выхода" });
    console.log("Пользователь вышел из системы.");
    res.json({ message: "Вы вышли" });
  });
});

router.get('/me', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ message: "Неавторизован" });
  const query = `
    SELECT id, name, nickname, role, roles, guild, playTime, skin, ar, eventMoney, donateMoney 
    FROM users 
    WHERE id = ?
  `;
  db.get(query, [req.session.userId], (err, user) => {
    if (err) {
      console.error("Ошибка получения данных пользователя:", err.message);
      return res.status(500).json({ message: "Ошибка сервера" });
    }
    if (!user) {
      console.log("Пользователь не найден, req.session.userId:", req.session.userId);
      return res.status(404).json({ message: "Пользователь не найден" });
    }
    res.json(user);
  });
});

module.exports = router;