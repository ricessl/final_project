const express = require('express');
const pool = require('../config/db');
const { auth, admin } = require('../middleware/auth');
const router = express.Router();

router.delete('/users/:id', [auth, admin], async (req, res) => {
  try {
    console.log(`Deleting user with ID: ${req.params.id}`);

    const [items] = await pool.query('SELECT id FROM items WHERE user_id = ?', [req.params.id]);
    for (const item of items) {
      await pool.query('DELETE FROM messages WHERE item_id = ?', [item.id]);
      await pool.query('DELETE FROM images WHERE item_id = ?', [item.id]);
      await pool.query('DELETE FROM items WHERE id = ?', [item.id]);
    }

    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'Пользователь удалён' });
  } catch (error) {
    console.error('Ошибка удаления пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.delete('/items/:id', [auth, admin], async (req, res) => {
  try {
    console.log(`Deleting item with ID: ${req.params.id}`);
    await pool.query('DELETE FROM messages WHERE item_id = ?', [req.params.id]);
    await pool.query('DELETE FROM images WHERE item_id = ?', [req.params.id]);
    await pool.query('DELETE FROM items WHERE id = ?', [req.params.id]);
    res.json({ message: 'Товар удалён' });
  } catch (error) {
    console.error('Ошибка удаления товара:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;