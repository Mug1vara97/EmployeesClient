import { useState } from 'react';
import { authAPI } from '../services/api';
import { useNotification } from '../hooks/useNotification';

const LoginForm = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authAPI.login(formData.email, formData.password);
      showSuccess('Успешный вход в систему');
      onLoginSuccess();
    } catch (error) {
      let message = 'Ошибка входа в систему';
      
      if (error.response?.data) {
        if (Array.isArray(error.response.data)) {
          message = error.response.data.map(err => err.description || err.message || err).join(', ');
        } else {
          message = error.response.data.message || error.response.data.title || message;
        }
      }
      
      showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Вход в систему
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Введите свои учетные данные для входа
            </p>
          </div>
          
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input-field"
                placeholder="Введите email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input-field"
                placeholder="Введите пароль"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Вход...' : 'Войти'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
