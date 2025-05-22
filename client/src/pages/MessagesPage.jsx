import { useState, useEffect, useContext } from 'react';
import { Container, Card, ListGroup, Badge } from 'react-bootstrap';
import { getItems} from '../services/api.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import Messages from '../components/Messages.jsx';

const MessagesPage = () => {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        if (!user) {
          setError('Пользователь не авторизован');
          return;
        }
        const res = await getItems();
        const userItems = res.data.filter((item) => item.user_id === user.id);
        console.log('Товары пользователя:', userItems); // Отладка
        setItems(userItems);
        if (userItems.length > 0) setSelectedItem(userItems[0]);
        else setError('У вас нет товаров');
      } catch (err) {
        console.error('Ошибка загрузки товаров:', err);
        setError('Не удалось загрузить товары: ' + (err.response?.data?.message || err.message));
      }
    };
    fetchItems();
  }, [user]);

  if (!user) return <div>Загрузка пользователя...</div>;

  return (
    <Container className="my-4">
      <h2>Сообщения по вашим товарам</h2>
      {error && <p className="text-danger">{error}</p>}
      <div className="d-flex">
        <Card style={{ width: '30%', marginRight: '20px', backgroundColor: '#F5F5DC' }}>
          <Card.Body>
            <ListGroup>
              {items.length === 0 ? (
                <ListGroup.Item>У вас нет товаров</ListGroup.Item>
              ) : (
                items.map((item) => (
                  <ListGroup.Item
                    key={item.id}
                    active={selectedItem?.id === item.id}
                    onClick={() => setSelectedItem(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    {item.title}
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card.Body>
        </Card>
        <div style={{ flex: 1 }}>
          {selectedItem && user ? (
            <Messages itemId={selectedItem.id} userId={user.id} />
          ) : (
            <p>Выберите товар для просмотра сообщений</p>
          )}
        </div>
      </div>
    </Container>
  );
};

export default MessagesPage;