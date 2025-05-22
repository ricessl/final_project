import { useState, useEffect } from 'react';
import { Container, Table, Button, Alert } from 'react-bootstrap';
import { getItems, deleteUser, deleteItemAdmin } from '../services/api.jsx';

const AdminPanel = () => {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getItems().then((res) => setItems(res.data));
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) return;
    try {
      await deleteUser(userId);
      setItems(items.filter((item) => item.user_id !== userId));
      setError('');
    } catch (err) {
      console.error(err);
      setError('Не удалось удалить пользователя');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) return;
    try {
      await deleteItemAdmin(itemId);
      setItems(items.filter((item) => item.id !== itemId));
      setError('');
    } catch (err) {
      console.error(err);
      setError('Не удалось удалить товар');
    }
  };

  return (
    <Container className="my-4">
      <h2>Панель администратора</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Товар</th>
            <th>Продавец</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>{item.username}</td>
              <td>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteUser(item.user_id)}
                  className="me-2"
                >
                  Удалить пользователя
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  Удалить товар
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default AdminPanel;