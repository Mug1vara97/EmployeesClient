import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import AuthPage from './components/AuthPage';
import EmployeesPage from './pages/EmployeesPage';
import DocumentsPage from './pages/DocumentsPage';
import { authAPI } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('employees');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Проверяем, авторизован ли пользователь при загрузке приложения
    const checkAuth = () => {
      const authenticated = authAPI.isAuthenticated();
      setIsAuthenticated(authenticated);
      setIsLoading(false);
      
      // Если пользователь не авторизован и не на странице аутентификации, перенаправляем
      if (!authenticated && location.pathname !== '/authentication') {
        navigate('/authentication');
      }
      // Если пользователь авторизован и на странице аутентификации, перенаправляем на главную
      else if (authenticated && location.pathname === '/authentication') {
        navigate('/');
      }
    };

    checkAuth();
  }, [navigate, location.pathname]);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    navigate('/');
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    } finally {
      setIsAuthenticated(false);
      navigate('/authentication');
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'employees':
        return 'Сотрудники';
      case 'documents':
        return 'Документы';
      default:
        return 'EmployeeApp';
    }
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'employees':
        return <EmployeesPage />;
      case 'documents':
        return <DocumentsPage />;
      default:
        return <EmployeesPage />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/authentication" 
        element={
          !isAuthenticated ? (
            <AuthPage onAuthSuccess={handleAuthSuccess} />
          ) : (
            <Navigate to="/" replace />
          )
        } 
      />
      <Route 
        path="/*" 
        element={
          isAuthenticated ? (
            <Layout 
              activeTab={activeTab} 
              onTabChange={handleTabChange}
              pageTitle={getPageTitle()}
              onLogout={handleLogout}
            >
              {renderPage()}
            </Layout>
          ) : (
            <Navigate to="/authentication" replace />
          )
        } 
      />
    </Routes>
  );
}

export default App;
