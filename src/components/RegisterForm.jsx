import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { authAPI } from '../services/api';
import { useNotification } from '../hooks/useNotification';

const RegisterForm = ({ onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useNotification();

  const getPasswordRequirements = (password) => {
    return {
      length: password.length >= 6,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      special: /[^a-zA-Z0-9]/.test(password)
    };
  };

  const passwordRequirements = getPasswordRequirements(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      showError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 6) {
      showError('Пароль должен содержать минимум 6 символов');
      return;
    }

    // Проверка требований к паролю
    const requirements = getPasswordRequirements(formData.password);
    const passwordErrors = [];
    
    if (!requirements.length) {
      passwordErrors.push('минимум 6 символов');
    }
    
    if (!requirements.lowercase) {
      passwordErrors.push('строчную букву (a-z)');
    }
    
    if (!requirements.uppercase) {
      passwordErrors.push('заглавную букву (A-Z)');
    }
    
    if (!requirements.special) {
      passwordErrors.push('специальный символ');
    }
    
    if (passwordErrors.length > 0) {
      showError(`Пароль должен содержать: ${passwordErrors.join(', ')}`);
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.register(formData.email, formData.password);
      showSuccess('Регистрация прошла успешно! Теперь вы можете войти в систему.');
      onRegisterSuccess();
    } catch (error) {
      let message = 'Ошибка регистрации';
      
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
              Регистрация
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Создайте новый аккаунт
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
                autoComplete="new-password"
                required
                className="input-field"
                placeholder="Введите пароль"
                value={formData.password}
                onChange={handleChange}
              />
              <div className="mt-1 text-xs text-gray-500">
                <p className="font-medium mb-1">Пароль должен содержать:</p>
                <div className="grid grid-cols-2 gap-1">
                  <div className={`flex items-center gap-1 ${passwordRequirements.length ? 'text-green-600' : 'text-red-500'}`}>
                    {passwordRequirements.length ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    <span className="text-xs">6+ символов</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordRequirements.lowercase ? 'text-green-600' : 'text-red-500'}`}>
                    {passwordRequirements.lowercase ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    <span className="text-xs">a-z</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordRequirements.uppercase ? 'text-green-600' : 'text-red-500'}`}>
                    {passwordRequirements.uppercase ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    <span className="text-xs">A-Z</span>
                  </div>
                  <div className={`flex items-center gap-1 ${passwordRequirements.special ? 'text-green-600' : 'text-red-500'}`}>
                    {passwordRequirements.special ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )}
                    <span className="text-xs">!@#$%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Подтверждение пароля
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="input-field"
                placeholder="Подтвердите пароль"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
