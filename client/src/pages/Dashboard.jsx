import { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import ItemCard from '../components/ItemCard.jsx';
import { getItems } from '../services/api.jsx';

const Dashboard = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getItems()
      .then((res) => {
        setItems(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Не удалось загрузить товары');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Container className="my-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p>Загрузка товаров...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-4 text-center">
        <p className="text-danger">{error}</p>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <h2 className="mb-4" style={{ color: '#8B4513' }}>Товары</h2>
      <Row>
        {items.length === 0 ? (
          <p>Товары отсутствуют.</p>
        ) : (
          items.map((item) => (
            <Col md={4} key={item.id} className="mb-4">
              <ItemCard item={item} />
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
};

export default Dashboard;