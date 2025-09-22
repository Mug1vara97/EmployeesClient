import { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Trash2, 
  Plus, 
  Calendar, 
  File,
  AlertCircle,
  X,
  Eye,
  FileImage,
  FileSpreadsheet,
  FileType
} from 'lucide-react';
import { employeeDocumentsAPI, documentTypesAPI } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import LoadingSpinner from './LoadingSpinner';
import ConfirmDialog from './ConfirmDialog';
import DocumentPreview from './DocumentPreview';

const EmployeeDocuments = ({ employee, isOpen, onClose }) => {
  const [documents, setDocuments] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, document: null });
  const [previewModal, setPreviewModal] = useState({ isOpen: false, document: null });
  
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (isOpen && employee) {
      loadDocuments();
      loadDocumentTypes();
    }
  }, [isOpen, employee]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await employeeDocumentsAPI.getByEmployee(employee.id);
      setDocuments(response.data);
    } catch (error) {
      console.error('Ошибка загрузки документов:', error);
      showError('Ошибка загрузки документов');
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentTypes = async () => {
    try {
      const response = await documentTypesAPI.getAll();
      setDocumentTypes(response.data);
    } catch (error) {
      console.error('Ошибка загрузки типов документов:', error);
      showError('Ошибка загрузки типов документов');
    }
  };

  const handleDownload = async (doc) => {
    try {
      const response = await employeeDocumentsAPI.download(doc.id);
      
      const blob = new Blob([response.data], { type: doc.mimeType });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.documentName;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showSuccess('Документ скачан');
    } catch (error) {
      console.error('Ошибка скачивания документа:', error);
      showError('Ошибка скачивания документа');
    }
  };

  const handleDeleteDocument = (doc) => {
    setDeleteConfirm({ isOpen: true, document: doc });
  };

  const handlePreviewDocument = (doc) => {
    setPreviewModal({ isOpen: true, document: doc });
  };

  const confirmDelete = async () => {
    try {
      await employeeDocumentsAPI.delete(deleteConfirm.document.id);
      await loadDocuments();
      showSuccess('Документ удален');
    } catch (error) {
      console.error('Ошибка удаления документа:', error);
      showError('Ошибка удаления документа');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (mimeType.includes('image')) return <FileImage className="h-5 w-5 text-blue-500" />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <FileType className="h-5 w-5 text-blue-600" />;
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="bg-white px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Документы сотрудника
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {employee?.lastName} {employee?.firstName} {employee?.middleName || ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Добавить документ
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
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <FileText className="h-12 w-12" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Нет документов</h3>
                <p className="mt-1 text-sm text-gray-500">
                  У этого сотрудника пока нет загруженных документов
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="btn-primary flex items-center gap-2 mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Добавить первый документ
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {getFileIcon(doc.mimeType)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {doc.documentName}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-sm text-gray-500">
                            <File className="h-4 w-4 mr-1" />
                            {doc.documentType.typeName}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <span>{formatFileSize(doc.fileSize)}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(doc.createdAt).toLocaleDateString('ru-RU')}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePreviewDocument(doc)}
                        className="p-2 text-green-400 hover:text-green-600"
                        title="Предварительный просмотр"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="p-2 text-blue-400 hover:text-blue-600"
                        title="Скачать"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc)}
                        className="p-2 text-red-400 hover:text-red-600"
                        title="Удалить"
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

      {showUploadModal && (
        <DocumentUploadModal
          employee={employee}
          documentTypes={documentTypes}
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            loadDocuments();
            setShowUploadModal(false);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, document: null })}
        onConfirm={confirmDelete}
        title="Удалить документ"
        message={`Вы уверены, что хотите удалить документ "${deleteConfirm.document?.documentName}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        cancelText="Отмена"
        type="danger"
      />

      <DocumentPreview
        document={previewModal.document}
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false, document: null })}
      />
    </div>
  );
};

const DocumentUploadModal = ({ employee, documentTypes, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    documentTypeId: '',
    documentName: '',
    file: null
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { showSuccess, showError } = useNotification();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file: file,
        documentName: prev.documentName || file.name
      }));
      
      if (errors.file) {
        setErrors(prev => ({ ...prev, file: '' }));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.documentTypeId) {
      newErrors.documentTypeId = 'Выберите тип документа';
    }

    if (!formData.file) {
      newErrors.file = 'Выберите файл';
    }

    if (!formData.documentName.trim()) {
      newErrors.documentName = 'Введите название документа';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const uploadData = new FormData();
      uploadData.append('employeeId', employee.id);
      uploadData.append('documentTypeId', formData.documentTypeId);
      uploadData.append('documentName', formData.documentName);
      uploadData.append('file', formData.file);

      await employeeDocumentsAPI.upload(uploadData);
      showSuccess('Документ успешно загружен');
      onSuccess();
      
      setFormData({
        documentTypeId: '',
        documentName: '',
        file: null
      });
    } catch (error) {
      console.error('Ошибка загрузки документа:', error);
      showError('Ошибка загрузки документа');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-lg">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Загрузить документ
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
                  <label htmlFor="documentTypeId" className="block text-sm font-medium text-gray-700">
                    Тип документа *
                  </label>
                  <select
                    name="documentTypeId"
                    id="documentTypeId"
                    value={formData.documentTypeId}
                    onChange={handleChange}
                    className={`input-field ${errors.documentTypeId ? 'border-red-300 focus:ring-red-500' : ''}`}
                  >
                    <option value="">Выберите тип документа</option>
                    {documentTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.typeName}
                      </option>
                    ))}
                  </select>
                  {errors.documentTypeId && (
                    <p className="mt-1 text-sm text-red-600">{errors.documentTypeId}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="documentName" className="block text-sm font-medium text-gray-700">
                    Название документа *
                  </label>
                  <input
                    type="text"
                    name="documentName"
                    id="documentName"
                    value={formData.documentName}
                    onChange={handleChange}
                    className={`input-field ${errors.documentName ? 'border-red-300 focus:ring-red-500' : ''}`}
                    placeholder="Введите название документа"
                  />
                  {errors.documentName && (
                    <p className="mt-1 text-sm text-red-600">{errors.documentName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="file" className="block text-sm font-medium text-gray-700">
                    Файл *
                  </label>
                  <input
                    type="file"
                    name="file"
                    id="file"
                    onChange={handleFileChange}
                    className={`input-field ${errors.file ? 'border-red-300 focus:ring-red-500' : ''}`}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                  />
                  {errors.file && (
                    <p className="mt-1 text-sm text-red-600">{errors.file}</p>
                  )}
                  {formData.file && (
                    <p className="mt-1 text-sm text-gray-500">
                      Выбран файл: {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
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

export default EmployeeDocuments;
