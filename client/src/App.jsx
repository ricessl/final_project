import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ItemAdd from './pages/ItemAdd';
import ItemDetails from './pages/ItemDetails';
import AdminPanel from './pages/AdminPanel';
import MessagesPage from './pages/MessagesPage';
import { Navbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css';
import { useContext, useState, useEffect } from 'react';
import { getUnreadMessagesCount } from './services/api'; 

function AppContent() {
  const { user, logout } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchUnreadCount = async () => {
        try {
          const res = await getUnreadMessagesCount();
          setUnreadCount(res.data.count);
        } catch (err) {
          console.error(err);
        }
      };
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <Router>
      <Navbar expand="lg" className="mb-4" style={{ backgroundColor: '#EAD7BB' }}>
        <Container>
          <Navbar.Brand href="/dashboard">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3081/3081986.png"
              alt="Логотип"
              style={{ width: '30px', marginRight: '10px' }}
            />
            boxroom
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="ms-auto">
              <Nav.Link href="/dashboard">Главная</Nav.Link>
              <Nav.Link href="/item/add">Добавить товар</Nav.Link>
              <Nav.Link href="/profile">Профиль</Nav.Link>
              <Nav.Link href="/messages">
                Сообщения {unreadCount > 0 && <Badge bg="danger">{unreadCount}</Badge>}
              </Nav.Link>
              {user?.role === 'admin' && (
                <Nav.Link href="/admin">
                  <Button variant="warning" size="sm">
                    🛠️ Админ-панель
                  </Button>
                </Nav.Link>
              )}
              {user && (
                <Button variant="outline-danger" onClick={handleLogout} className="ms-2">
                  Выйти
                </Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/item/add"
            element={
              <PrivateRoute>
                <ItemAdd />
              </PrivateRoute>
            }
          />
          <Route
            path="/item/edit/:id"
            element={
              <PrivateRoute>
                <ItemAdd />
              </PrivateRoute>
            }
          />
          <Route
            path="/item/:id"
            element={
              <PrivateRoute>
                <ItemDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <PrivateRoute>
                <MessagesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminPanel />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Container>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;