import { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { createItem, getItems, getCategories, updateItem } from '../services/api.jsx';
import { Form, Button, Container, Card, Alert } from 'react-bootstrap';

const ItemAdd = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();

    if (id) {
      // Режим редактирования
      getItems().then((res) => {
        const item = res.data.find((i) => i.id === parseInt(id));
        if (item) {
          setTitle(item.title);
          setDescription(item.description);
          setPrice(item.price);
          setCategory(item.category_id);
        }
      });
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Вы должны войти, чтобы добавить товар');
      return;
    }
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', parseFloat(price));
    formData.append('category_id', parseInt(category));
    if (image) {
      formData.append('image', image);
      console.log('Image appended:', image.name);
    } else if (!id) {
      console.log('No image selected');
      setError('Изображение обязательно при добавлении товара');
      return;
    }

    try {
      if (id) {
        await updateItem(id, formData);
      } else {
        await createItem(formData);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving item:', err);
      setError(err.response?.data?.message || 'Не удалось сохранить товар');
    }
  };

  return (
    <Container className="my-4">
      <Card style={{ backgroundColor: '#F5F5DC', maxWidth: '600px', margin: '0 auto' }}>
        <Card.Body>
          <h2 className="text-center mb-4" style={{ color: '#8B4513' }}>
            {id ? 'Редактировать товар' : 'Добавить новый товар'}
          </h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit} encType="multipart/form-data">
            <Form.Group className="mb-3">
              <Form.Label>Название</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Описание</Form.Label>
              <Form.Control
                as="textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Цена (₽)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Категория</Form.Label>
              <Form.Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Выберите категорию</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Изображение</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                required={!id}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              {id ? 'Сохранить изменения' : 'Добавить товар'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ItemAdd;