import { useContext } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) return <div>Загрузка...</div>;

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '400px', backgroundColor: '#F5F5DC' }}>
        <Card.Body>
          <h2 className="text-center mb-4">Профиль</h2>
          <p><strong>Имя пользователя:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Роль:</strong> {user.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
          <Button variant="primary" onClick={() => navigate('/dashboard')} className="w-100">
            Назад к товарам
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile;