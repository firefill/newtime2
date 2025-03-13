// routes/users.js
const express = require('express');
const db = require('../config/db');

const router = express.Router();

router.get('/', (req, res) => {
  db.get(`SELECT roles FROM users WHERE id = ?`, [req.session.userId], (err, currentUser) => {
    if (err) return res.status(500).json({ message: "Ошибка сервера" });
    let roles = [];
    try {
      roles = JSON.parse(currentUser.roles);
    } catch (e) {
      roles = [];
    }
    if (!roles.some(role => ["Поддержка", "Администратор", "Создатель"].includes(role))) {
      return res.status(403).json({ message: "Нет доступа" });
    }
    db.all(`SELECT id, name, nickname, roles, status, guild, playTime, muteUntil, banUntil FROM users`, [], (err, rows) => {
      if (err) return res.status(500).json({ message: "Ошибка получения пользователей" });
      res.json(rows);
    });
  });
});

router.put('/:id', (req, res) => {
  db.get(`SELECT roles FROM users WHERE id = ?`, [req.session.userId], (err, currentUser) => {
    if (err) return res.status(500).json({ message: "Ошибка сервера" });
    let roles = [];
    try {
      roles = JSON.parse(currentUser.roles);
    } catch (e) {
      roles = [];
    }
    if (!roles.some(role => ["Поддержка", "Администратор", "Создатель"].includes(role))) {
      return res.status(403).json({ message: "Нет доступа" });
    }
    const { roles: newRoles, guild, muteUntil, banUntil, status, playTime, skin, ar, eventMoney, donateMoney } = req.body;
    const query = `
      UPDATE users SET 
        roles = ?,
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
    db.run(query, [newRoles, guild, muteUntil, banUntil, status, playTime, skin, ar, eventMoney, donateMoney, req.params.id], function(err) {
      if (err) {
        console.error("Ошибка обновления пользователя:", err.message);
        return res.status(500).json({ message: "Ошибка обновления пользователя" });
      }
      res.json({ message: "Пользователь обновлён" });
    });
  });
});

module.exports = router;