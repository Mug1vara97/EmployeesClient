import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Calendar } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const EmployeeForm = ({ isOpen, onClose, employee = null, onSave, loading = false }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        middleName: employee.middleName || '',
        email: employee.email || '',
        phone: employee.phone || '',
        dateOfBirth: employee.dateOfBirth ? 
          (employee.dateOfBirth.includes('T') ? employee.dateOfBirth.split('T')[0] : employee.dateOfBirth) : '',
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        middleName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
      });
    }
    setErrors({});
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Имя обязательно';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Фамилия обязательна';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }

    if (formData.phone && !/^[+]?[0-9\s\-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Некорректный номер телефона';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const cleanedData = {
        ...formData,
        middleName: formData.middleName.trim() || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        dateOfBirth: formData.dateOfBirth || null,
      };
      
      onSave(cleanedData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-lg">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {employee ? 'Редактировать сотрудника' : 'Добавить сотрудника'}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Фамилия *
                  </label>
                  <div className="mt-1 relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`input-field pl-10 ${errors.lastName ? 'border-red-300 focus:ring-red-500' : ''}`}
                      placeholder="Введите фамилию"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    Имя *
                  </label>
                  <div className="mt-1 relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`input-field pl-10 ${errors.firstName ? 'border-red-300 focus:ring-red-500' : ''}`}
                      placeholder="Введите имя"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="middleName" className="block text-sm font-medium text-gray-700">
                    Отчество
                  </label>
                  <div className="mt-1 relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="middleName"
                      id="middleName"
                      value={formData.middleName}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="Введите отчество"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1 relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`input-field pl-10 ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
                      placeholder="example@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Телефон
                  </label>
                  <div className="mt-1 relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`input-field pl-10 ${errors.phone ? 'border-red-300 focus:ring-red-500' : ''}`}
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                    Дата рождения
                  </label>
                  <div className="mt-1 relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      name="dateOfBirth"
                      id="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="input-field pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-3 flex flex-row-reverse gap-3">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <LoadingSpinner size="sm" />}
                {employee ? 'Сохранить изменения' : 'Добавить сотрудника'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;