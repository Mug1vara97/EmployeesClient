import { useState, useEffect } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import { employeeDocumentsAPI } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import LoadingSpinner from './LoadingSpinner';

const QuickDocumentUpload = ({ employee, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    file: null
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (isOpen) {
      setFormData({
        file: null
      });
      setErrors({});
    }
  }, [isOpen]);


  const handleFileChange = (file) => {
    if (file) {
      setFormData(prev => ({
        ...prev,
        file: file
      }));
      
      if (errors.file) {
        setErrors(prev => ({ ...prev, file: '' }));
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.file) {
      newErrors.file = 'Выберите файл';
    }

    if (formData.file && formData.file.size > 10 * 1024 * 1024) {
      newErrors.file = 'Размер файла не должен превышать 10MB';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      await employeeDocumentsAPI.upload(employee.id, formData.file);
      showSuccess('Документ успешно загружен');
      onSuccess();
      onClose();
      
    } catch (error) {
      console.error('Ошибка загрузки документа:', error);
      showError('Ошибка загрузки документа');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-md">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Добавить документ
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {employee?.lastName} {employee?.firstName} {employee?.middleName || ''}
                  </p>
                </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Файл *
                  </label>
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                      dragActive
                        ? 'border-primary-400 bg-primary-50'
                        : errors.file
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.xlsx,.xls"
                    />
                    
                    <div className="space-y-2">
                      <Upload className="mx-auto h-6 w-6 text-gray-400" />
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-primary-600 hover:text-primary-500">
                          Нажмите для выбора файла
                        </span>
                        {' '}или перетащите сюда
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, JPG, PNG (макс. 10MB)
                      </p>
                    </div>
                  </div>
                  
                  {formData.file && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {formData.file.name}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatFileSize(formData.file.size)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {errors.file && (
                    <div className="mt-2 flex items-center space-x-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.file}</span>
                    </div>
                  )}
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
                Загрузить документ
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

export default QuickDocumentUpload;

