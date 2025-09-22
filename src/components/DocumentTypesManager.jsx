import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, FileText } from 'lucide-react';
import { documentTypesAPI } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import LoadingSpinner from './LoadingSpinner';
import ConfirmDialog from './ConfirmDialog';

const DocumentTypesManager = ({ isOpen, onClose }) => {
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, type: null });
  
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (isOpen) {
      loadDocumentTypes();
    }
  }, [isOpen]);

  const loadDocumentTypes = async () => {
    try {
      setLoading(true);
      const response = await documentTypesAPI.getAll();
      setDocumentTypes(response.data);
    } catch (error) {
      console.error('Ошибка загрузки типов документов:', error);
      showError('Ошибка загрузки типов документов');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveType = async (typeData) => {
    try {
      if (editingType) {
        await documentTypesAPI.update(editingType.id, typeData);
        setEditingType(null);
        showSuccess('Тип документа обновлен');
      } else {
        await documentTypesAPI.create(typeData);
        showSuccess('Тип документа добавлен');
      }
      await loadDocumentTypes();
      setShowAddModal(false);
    } catch (error) {
      console.error('Ошибка сохранения типа документа:', error);
      showError('Ошибка сохранения типа документа');
    }
  };

  const handleEditType = (type) => {
    setEditingType(type);
    setShowAddModal(true);
  };

  const handleDeleteType = (type) => {
    setDeleteConfirm({ isOpen: true, type });
  };

  const confirmDelete = async () => {
    try {
      await documentTypesAPI.delete(deleteConfirm.type.id);
      await loadDocumentTypes();
      showSuccess('Тип документа удален');
    } catch (error) {
      console.error('Ошибка удаления типа документа:', error);
      showError('Ошибка удаления типа документа');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-2xl max-h-[90vh] flex flex-col">
          <div className="bg-white px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Управление типами документов
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Добавляйте и редактируйте типы документов для сотрудников
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Добавить тип
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <LoadingSpinner size="lg" />
              </div>
            ) : documentTypes.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <FileText className="h-12 w-12" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Нет типов документов</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Добавьте первый тип документа для начала работы
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary flex items-center gap-2 mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Добавить первый тип
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {documentTypes.map((type) => (
                  <div
                    key={type.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {type.typeName}
                        </p>
                        <p className="text-sm text-gray-500">
                          Документов: {type.documentsCount}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditType(type)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Редактировать"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteType(type)}
                        className="p-2 text-red-400 hover:text-red-600"
                        title="Удалить"
                        disabled={type.documentsCount > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <DocumentTypeForm
          type={editingType}
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setEditingType(null);
          }}
          onSave={handleSaveType}
        />
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, type: null })}
        onConfirm={confirmDelete}
        title="Удалить тип документа"
        message={`Вы уверены, что хотите удалить тип документа "${deleteConfirm.type?.typeName}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
        type="danger"
      />
    </div>
  );
};

const DocumentTypeForm = ({ type, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    typeName: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (type) {
      setFormData({
        typeName: type.typeName || ''
      });
    } else {
      setFormData({
        typeName: ''
      });
    }
    setErrors({});
  }, [type]);

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

    if (!formData.typeName.trim()) {
      newErrors.typeName = 'Название типа документа обязательно';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-md">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {type ? 'Редактировать тип документа' : 'Добавить тип документа'}
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
                  <label htmlFor="typeName" className="block text-sm font-medium text-gray-700">
                    Название типа документа *
                  </label>
                  <input
                    type="text"
                    name="typeName"
                    id="typeName"
                    value={formData.typeName}
                    onChange={handleChange}
                    className={`input-field ${errors.typeName ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="Например: Паспорт, Трудовая книжка, Диплом"
                  />
                  {errors.typeName && (
                    <p className="mt-1 text-sm text-red-600">{errors.typeName}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-3 flex flex-row-reverse gap-3">
              <button
                type="submit"
                className="btn-primary"
              >
                {type ? 'Сохранить изменения' : 'Добавить тип'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
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

export default DocumentTypesManager;

