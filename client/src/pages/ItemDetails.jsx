import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Image, Button, Form, Alert } from 'react-bootstrap';
import { getItems, deleteItem, sendMessage } from '../services/api.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import Messages from '../components/Messages.jsx';

const ItemDetails = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const baseUrl = 'http://localhost:5000';

  useEffect(() => {
    getItems()
      .then((res) => {
        const foundItem = res.data.find((i) => i.id === parseInt(id));
        setItem(foundItem);
      })
      .catch((err) => {
        console.error('Ошибка загрузки товара:', err);
        setError('Не удалось загрузить товар: ' + (err.response?.data?.message || err.message));
      });
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) return;
    try {
      await deleteItem(id);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Не удалось удалить товар');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Сообщение не может быть пустым');
      return;
    }
    try {
      const receiverId = user.id === item.user_id ? null : item.user_id;
      await sendMessage({ item_id: id, receiver_id: receiverId, content: message });
      setMessage('');
      setSuccess('Сообщение отправлено!');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Не удалось отправить сообщение');
    }
  };

  if (!item) return <div>{error || 'Загрузка...'}</div>;

  const imageUrl = item.images && item.images.length > 0
    ? `${baseUrl}${item.images[0].url}?t=${Date.now()}`
    : '/placeholder.jpg';

  return (
    <Container className="my-4">
      <Row>
        {}
        <Col md={4}>
          <Card>
            <Image
              src={imageUrl}
              alt={item.title}
              fluid
              style={{ width: '450px', height: 'auto', objectFit: 'scale-down' }}
            />
          </Card>
        </Col>
        {}
        <Col md={8}>
          <Card style={{ backgroundColor: '#EAD7BB' }}>
            <Card.Body>
              <h3 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{item.title}</h3>
              <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                <strong>Цена:</strong> {item.price} ₽
              </h4>
              <small>
                <p style={{ marginBottom: '0.5rem' }}>{item.description}</p>
                <p><strong>Категория:</strong> {item.category}</p>
                <p><strong>Продавец:</strong> {item.username}</p>
                {user?.id === item.user_id && (
                  <div className="mt-3">
                    <Button variant="danger" onClick={handleDelete} className="me-2">
                      Удалить товар
                    </Button>
                    <Button variant="warning" onClick={() => navigate(`/item/edit/${id}`)}>
                      Редактировать
                    </Button>
                  </div>
                )}
              </small>
            </Card.Body>
          </Card>
          {user && (
            <Card className="mt-4" style={{ backgroundColor: '#F5F5DC' }}>
              <Card.Body>
                <h4>Отправить сообщение</h4>
                {success && <Alert variant="success">{success}</Alert>}
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSendMessage}>
                  <Form.Group className="mb-3">
                    <Form.Control
                      as="textarea"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Введите ваше сообщение..."
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit">
                    Отправить
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}
          <Messages itemId={id} userId={user?.id} />
        </Col>
      </Row>
    </Container>
  );
};

export default ItemDetails;