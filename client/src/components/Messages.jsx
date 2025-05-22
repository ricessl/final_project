import { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { Card, ListGroup, Form, Button, Badge } from 'react-bootstrap';
import { getMessages, sendMessage } from '../services/api.jsx';
import { AuthContext } from '../context/AuthContext.jsx';

const Messages = ({ itemId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);
  const messagesEndRef = useRef(null);

  const fetchMessages = useCallback(async () => {
    try {
      if (!itemId) {
        setError('ID товара не указан');
        return;
      }
      console.log(`Fetching messages for itemId: ${itemId}`); // Отладка
      const res = await getMessages(itemId);
      setMessages(res.data || []);
      setError('');
    } catch (err) {
      console.error('Ошибка загрузки сообщений:', err);
      setError('Не удалось загрузить сообщения: ' + (err.response?.data?.message || err.message));
    }
  }, [itemId]); // Зависимость от itemId

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]); // Зависимость от fetchMessages


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) {
      setError('Сообщение не может быть пустым');
      return;
    }
    try {
      const receiverId = replyTo || (user.id === userId ? null : userId);
      await sendMessage({ item_id: itemId, receiver_id: receiverId, content: newMessage });
      setNewMessage('');
      setReplyTo(null);
      setError('');
      fetchMessages();
    } catch (err) {
      console.error('Ошибка отправки сообщения:', err);
      setError('Не удалось отправить сообщение: ' + (err.response?.data?.message || err.message));
    }
  };

  if (!itemId || !userId) return <p>Ошибка: Не указан товар или пользователь</p>;

  return (
    <Card className="mt-4" style={{ backgroundColor: '#F5F5DC' }}>
      <Card.Body>
        <h4>Чат</h4>
        {error && <p className="text-danger">{error}</p>}
        <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '10px' }}>
          {messages.length === 0 ? (
            <p>Нет сообщений</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  marginBottom: '10px',
                  textAlign: msg.sender_id === user?.id ? 'right' : 'left',
                }}
              >
                <div
                  style={{
                    display: 'inline-block',
                    backgroundColor: msg.sender_id === user?.id ? '#DCF8C6' : '#E8E8E8',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    maxWidth: '70%',
                  }}
                >
                  <small style={{ color: '#555' }}>
                    {msg.sender_username} ({msg.sender_id === user?.id ? 'Вы' : 'Другой'})
                  </small>
                  <p style={{ margin: 0 }}>{msg.content}</p>
                  <small style={{ color: '#777' }}>
                    {new Date(msg.created_at).toLocaleTimeString('ru-RU')}
                  </small>
                </div>
                {user?.id === userId && msg.sender_id !== user?.id && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setReplyTo(msg.sender_id)}
                    style={{ display: 'block', marginTop: '5px' }}
                  >
                    Ответить
                  </Button>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        {user && (
          <div className="mt-3">
            {replyTo && (
              <Badge bg="info" className="mb-2">
                Ответ пользователю {messages.find((m) => m.sender_id === replyTo)?.sender_username}{' '}
                <Button variant="link" size="sm" onClick={() => setReplyTo(null)}>
                  Отмена
                </Button>
              </Badge>
            )}
            {error && <p className="text-danger">{error}</p>}
            <Form onSubmit={handleSendMessage} className="d-flex align-items-center">
              <Form.Control
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Введите сообщение..."
                style={{ flex: 1, marginRight: '10px' }}
              />
              <Button variant="primary" type="submit">
                ➤
              </Button>
            </Form>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default Messages;