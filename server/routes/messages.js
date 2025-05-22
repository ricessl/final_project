const express = require('express');
const pool = require('../config/db');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Получение сообщений
router.get('/:itemId', auth, async (req, res) => {
  try {
    const [item] = await pool.query('SELECT user_id FROM items WHERE id = ?', [req.params.itemId]);
    if (!item.length) return res.status(404).json({ message: 'Товар не найден' });

    const isSeller = req.user.id === item[0].user_id;
    let messages;
    if (isSeller) {
      [messages] = await pool.query(
        `SELECT messages.*, users.username as sender_username 
         FROM messages 
         JOIN users ON messages.sender_id = users.id 
         WHERE item_id = ? 
         ORDER BY created_at`,
        [req.params.itemId]
      );
    } else {
      [messages] = await pool.query(
        `SELECT messages.*, users.username as sender_username 
         FROM messages 
         JOIN users ON messages.sender_id = users.id 
         WHERE item_id = ? AND (sender_id = ? OR receiver_id = ?) 
         ORDER BY created_at`,
        [req.params.itemId, req.user.id, req.user.id]
      );
    }
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Отправка сообщения
router.post('/', auth, async (req, res) => {
  const { item_id, receiver_id, content } = req.body;
  try {
    const [item] = await pool.query('SELECT user_id FROM items WHERE id = ?', [item_id]);
    if (!item.length) return res.status(404).json({ message: 'Товар не найден' });

    const finalReceiverId = receiver_id || item[0].user_id;
    await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, item_id, content) VALUES (?, ?, ?, ?)',
      [req.user.id, finalReceiverId, item_id, content]
    );
    res.json({ message: 'Сообщение отправлено' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.get('/unread/count', auth, async (req, res) => {
  try {
    const [items] = await pool.query('SELECT id FROM items WHERE user_id = ?', [req.user.id]);
    const itemIds = items.map((item) => item.id);

    if (itemIds.length === 0) {
      return res.json({ count: 0 });
    }

    const [unread] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM messages 
       WHERE item_id IN (?) AND sender_id != ? AND receiver_id = ?`,
      [itemIds, req.user.id, req.user.id]
    );
    res.json({ count: unread[0].count });
  } catch (error) {
    console.error('Error fetching unread messages count:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;