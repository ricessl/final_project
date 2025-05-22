const express = require('express');
const pool = require('../config/db');
const { auth } = require('../middleware/auth');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
      console.log('Created uploads directory');
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + path.extname(file.originalname);
    console.log('Saving file as:', filename);
    cb(null, filename);
  },
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
  try {
    const [items] = await pool.query(`
      SELECT items.*, users.username, categories.name as category, images.url
      FROM items
      JOIN users ON items.user_id = users.id
      JOIN categories ON items.category_id = categories.id
      LEFT JOIN images ON items.id = images.item_id
    `);
    const itemsWithImages = items.reduce((acc, item) => {
      const existing = acc.find(i => i.id === item.id);
      if (existing) {
        existing.images = existing.images || [];
        existing.images.push({ url: item.url });
      } else {
        acc.push({ ...item, images: item.url ? [{ url: item.url }] : [] });
      }
      return acc;
    }, []);
    res.json(itemsWithImages);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.post('/', [auth, upload.single('image')], async (req, res) => {
  const { title, description, price, category_id } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO items (title, description, price, user_id, category_id) VALUES (?, ?, ?, ?, ?)',
      [title, description, price, req.user.id, category_id]
    );
    if (req.file) {
      const filePath = `/uploads/${req.file.filename}`;
      console.log('File uploaded:', filePath);
      await pool.query(
        'INSERT INTO images (item_id, url) VALUES (?, ?)',
        [result.insertId, filePath]
      );
    } else {
      console.log('No file uploaded');
    }
    res.json({ id: result.insertId });
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const [item] = await pool.query('SELECT * FROM items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!item.length) return res.status(403).json({ message: 'Нет доступа' });

    await pool.query('DELETE FROM messages WHERE item_id = ?', [req.params.id]);
    await pool.query('DELETE FROM images WHERE item_id = ?', [req.params.id]);

    await pool.query('DELETE FROM items WHERE id = ?', [req.params.id]);
    res.json({ message: 'Товар удалён' });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Маршрут для редактирования
router.put('/:id', [auth, upload.single('image')], async (req, res) => {
  const { title, description, price, category_id } = req.body;
  try {
    const [item] = await pool.query('SELECT * FROM items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!item.length) return res.status(403).json({ message: 'Нет доступа' });

    await pool.query(
      'UPDATE items SET title = ?, description = ?, price = ?, category_id = ? WHERE id = ?',
      [title, description, price, category_id, req.params.id]
    );

    if (req.file) {
      const filePath = `/uploads/${req.file.filename}`;
      await pool.query('DELETE FROM images WHERE item_id = ?', [req.params.id]);
      await pool.query('INSERT INTO images (item_id, url) VALUES (?, ?)', [req.params.id, filePath]);
    }

    res.json({ message: 'Товар обновлён' });
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;