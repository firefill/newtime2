// routes/posts.js
const express = require('express');
const db = require('../config/db');
const upload = require('../config/multer');
const router = express.Router();

// GET /api/posts
router.get('/', (req, res) => {
  const query = `
    SELECT 
      p.id, 
      p.userId, 
      p.content, 
      p.imagePath, 
      p.created_at,
      u.nickname AS authorNickname,
      (SELECT COUNT(*) FROM post_likes pl WHERE pl.postId = p.id) AS likesCount,
      (SELECT COUNT(*) FROM post_comments pc WHERE pc.postId = p.id) AS commentsCount
    FROM posts p
    LEFT JOIN users u ON p.userId = u.id
    ORDER BY p.created_at DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Ошибка получения постов:", err.message);
      return res.status(500).json({ message: "Ошибка сервера" });
    }
    res.json(rows);
  });
});

// POST /api/posts, с загрузкой файла
router.post('/', upload.single('image'), (req, res) => {
  const userId = req.session.userId;
  const { content } = req.body;
  let imagePath = '';
  if (req.file) {
    imagePath = '/uploads/' + req.file.filename;
  }
  const query = `
    INSERT INTO posts (userId, content, imagePath) VALUES (?, ?, ?)
  `;
  db.run(query, [userId, content || '', imagePath], function(err) {
    if (err) {
      console.error("Ошибка создания поста:", err.message);
      return res.status(500).json({ message: "Ошибка при создании поста" });
    }
    const createdPostId = this.lastID;
    db.get(`
      SELECT 
        p.id, 
        p.userId, 
        p.content, 
        p.imagePath, 
        p.created_at,
        u.nickname AS authorNickname,
        0 AS likesCount,
        0 AS commentsCount
      FROM posts p
      LEFT JOIN users u ON p.userId = u.id
      WHERE p.id = ?
    `, [createdPostId], (err, post) => {
      if (err) {
        console.error("Ошибка получения созданного поста:", err.message);
        return res.status(500).json({ message: "Ошибка при создании поста" });
      }
      res.status(201).json(post);
    });
  });
});

// DELETE /api/posts/:id
router.delete('/:id', (req, res) => {
  const postId = req.params.id;
  const currentUserId = req.session.userId;
  const getPostQuery = `SELECT userId FROM posts WHERE id = ?`;
  db.get(getPostQuery, [postId], (err, post) => {
    if (err) {
      console.error("Ошибка при получении поста:", err.message);
      return res.status(500).json({ message: "Ошибка сервера" });
    }
    if (!post) {
      return res.status(404).json({ message: "Пост не найден" });
    }
    const getUserQuery = `SELECT role, roles FROM users WHERE id = ?`;
    db.get(getUserQuery, [currentUserId], (err, userData) => {
      if (err) {
        console.error("Ошибка при получении данных пользователя:", err.message);
        return res.status(500).json({ message: "Ошибка сервера" });
      }
      if (!userData) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }
      const hasAdminAccess = () => {
        if (userData.roles) {
          try {
            const rolesArray = JSON.parse(userData.roles);
            return rolesArray.includes("Администратор");
          } catch (e) {
            console.error("Ошибка парсинга ролей:", e);
            return false;
          }
        }
        return userData.role === "Администратор";
      };
      if (post.userId === currentUserId || hasAdminAccess()) {
        const deleteQuery = `DELETE FROM posts WHERE id = ?`;
        db.run(deleteQuery, [postId], function(err) {
          if (err) {
            console.error("Ошибка при удалении поста:", err.message);
            return res.status(500).json({ message: "Ошибка при удалении поста" });
          }
          return res.json({ message: "Пост удалён" });
        });
      } else {
        return res.status(403).json({ message: "Нет прав для удаления этого поста" });
      }
    });
  });
});

// POST /api/posts/:postId/like
router.post('/:postId/like', (req, res) => {
  const userId = req.session.userId;
  const postId = req.params.postId;
  db.get(`
    SELECT id FROM post_likes WHERE postId = ? AND userId = ?
  `, [postId, userId], (err, row) => {
    if (err) {
      console.error("Ошибка проверки лайка:", err.message);
      return res.status(500).json({ message: "Ошибка сервера" });
    }
    if (row) {
      db.run(`DELETE FROM post_likes WHERE id = ?`, [row.id], function(err2) {
        if (err2) {
          console.error("Ошибка удаления лайка:", err2.message);
          return res.status(500).json({ message: "Ошибка сервера" });
        }
        return res.json({ liked: false });
      });
    } else {
      db.run(`INSERT INTO post_likes (postId, userId) VALUES (?, ?)`, [postId, userId], function(err3) {
        if (err3) {
          console.error("Ошибка добавления лайка:", err3.message);
          return res.status(500).json({ message: "Ошибка сервера" });
        }
        return res.json({ liked: true });
      });
    }
  });
});

// GET /api/posts/:postId/comments
router.get('/:postId/comments', (req, res) => {
  const postId = req.params.postId;
  const query = `
    SELECT c.id, c.postId, c.userId, c.content, c.created_at,
           u.nickname AS authorNickname
    FROM post_comments c
    LEFT JOIN users u ON c.userId = u.id
    WHERE c.postId = ?
    ORDER BY c.created_at ASC
  `;
  db.all(query, [postId], (err, rows) => {
    if (err) {
      console.error("Ошибка получения комментариев:", err.message);
      return res.status(500).json({ message: "Ошибка сервера" });
    }
    res.json(rows);
  });
});

// POST /api/posts/:postId/comments
router.post('/:postId/comments', (req, res) => {
  const userId = req.session.userId;
  const postId = req.params.postId;
  const { content } = req.body;
  if (!content || content.trim() === '') {
    return res.status(400).json({ message: "Комментарий не может быть пустым" });
  }
  const query = `
    INSERT INTO post_comments (postId, userId, content) VALUES (?, ?, ?)
  `;
  db.run(query, [postId, userId, content], function(err) {
    if (err) {
      console.error("Ошибка при создании комментария:", err.message);
      return res.status(500).json({ message: "Ошибка при создании комментария" });
    }
    const createdCommentId = this.lastID;
    db.get(`
      SELECT c.id, c.postId, c.userId, c.content, c.created_at,
             u.nickname AS authorNickname
      FROM post_comments c
      LEFT JOIN users u ON c.userId = u.id
      WHERE c.id = ?
    `, [createdCommentId], (err, comment) => {
      if (err) {
        console.error("Ошибка получения комментария:", err.message);
        return res.status(500).json({ message: "Ошибка при создании комментария" });
      }
      res.status(201).json(comment);
    });
  });
});

module.exports = router;