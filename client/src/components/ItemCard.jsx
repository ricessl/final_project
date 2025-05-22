import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ItemCard = ({ item }) => {
  const navigate = useNavigate();
  const baseUrl = 'http://localhost:5000';
  const imageUrl = item.images && item.images.length > 0
    ? `${baseUrl}${item.images[0].url}?t=${Date.now()}`
    : '/placeholder.jpg';

  const handleViewDetails = () => {
    navigate(`/item/${item.id}`);
  };

  return (
    <Card style={{ backgroundColor: '#EAD7BB', minHeight: '350px' }}>
      <div style={{ width: '100%', paddingTop: '100%', position: 'relative' }}>
        <Card.Img
          src={imageUrl}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
      <Card.Body className="d-flex flex-column justify-content-between">
        <div>
          <Card.Title>{item.title}</Card.Title>
          <Card.Text>{item.description.substring(0, 100)}{item.description.length > 100 ? '...' : ''}</Card.Text>
          <Card.Text><strong>Цена:</strong> ₽{item.price}</Card.Text>
          <Card.Text><strong>Категория:</strong> {item.category}</Card.Text>
        </div>
        <Button variant="primary" onClick={handleViewDetails} className="mt-3">
          Подробнее
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ItemCard;