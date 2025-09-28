import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import Notification from './Notification';
import { useNotification } from '../hooks/useNotification';

const AuthPage = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const { notifications, removeNotification } = useNotification();

  const handleAuthSuccess = () => {
    onAuthSuccess();
  };

  const handleModeChange = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-md mx-auto w-full px-4 py-8">
        <div className="w-full">
          <div className="card mb-4">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  isLogin
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Вход
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  !isLogin
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Регистрация
              </button>
            </div>
          </div>

          {isLogin ? (
            <LoginForm onLoginSuccess={handleAuthSuccess} />
          ) : (
            <RegisterForm onRegisterSuccess={handleAuthSuccess} />
          )}
        </div>
      </div>

      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

export default AuthPage;
