import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  FileText, 
  Download, 
  Trash2, 
  Plus, 
  Calendar,
  User,
  File,
  Eye,
  FileImage,
  FileSpreadsheet,
  FileType
} from 'lucide-react';
import { employeesAPI, employeeDocumentsAPI, documentTypesAPI } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmDialog from '../components/ConfirmDialog';
import Notification from '../components/Notification';
import DocumentUploadModal from '../components/DocumentUploadModal';
import DocumentPreview from '../components/DocumentPreview';

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, document: null });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewModal, setPreviewModal] = useState({ isOpen: false, document: null });
  
  const { notifications, removeNotification, showSuccess, showError } = useNotification();

  useEffect(() => {
    loadData();
  }, []); 

  useEffect(() => {
    if (employees.length > 0) {
      loadAllDocuments();
    }
  }, [employees]); 

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadEmployees(),
        loadDocumentTypes()
      ]);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      showError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await employeesAPI.getAll();
      setEmployees(response.data);
    } catch (error) {
      console.error('Ошибка загрузки сотрудников:', error);
    }
  };

  const loadDocumentTypes = async () => {
    try {
      const response = await documentTypesAPI.getAll();
      setDocumentTypes(response.data);
    } catch (error) {
      console.error('Ошибка загрузки типов документов:', error);
    }
  };

  const loadAllDocuments = async () => {
    try {
      const allDocuments = [];
      for (const employee of employees) {
        try {
          const response = await employeeDocumentsAPI.getByEmployee(employee.id);
          const employeeDocuments = response.data.map(doc => ({
            ...doc,
            employee: employee
          }));
          allDocuments.push(...employeeDocuments);
        } catch (error) {
          console.error(`Ошибка загрузки документов для сотрудника ${employee.id}:`, error);
        }
      }
      setDocuments(allDocuments);
    } catch (error) {
      console.error('Ошибка загрузки документов:', error);
    }
  };

  const handleSearch = (query) => {
    setSearchTerm(query);
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
      await loadAllDocuments();
      showSuccess('Документ удален');
    } catch (error) {
      console.error('Ошибка удаления документа:', error);
      showError('Ошибка удаления документа');
    }
  };

  const handleUploadSuccess = async () => {
    await loadAllDocuments();
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

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchTerm || 
      doc.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.employee.middleName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEmployee = !selectedEmployee || doc.employee.id.toString() === selectedEmployee.toString();
    
    return matchesSearch && matchesEmployee;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Документы</h1>
          <p className="text-sm text-gray-500 mt-1">
            Управление документами всех сотрудников
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary flex items-center gap-x-2"
          >
            <Plus className="h-4 w-4" />
            Добавить документ
          </button>
        </div>
      </div>

      <div className="flex items-center gap-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по названию документа или сотруднику..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="input-field min-w-[200px]"
        >
          <option value="">Все сотрудники</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.lastName} {employee.firstName} {employee.middleName || ''}
            </option>
          ))}
        </select>

      </div>

      <div className="card">
        <div className="px-6 py-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Все документы ({filteredDocuments.length})
          </h3>
          
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <FileText className="h-12 w-12" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Нет документов</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedEmployee 
                  ? 'Попробуйте изменить фильтры поиска' 
                  : 'Документы появятся здесь после загрузки'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((doc) => (
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
                          <User className="h-4 w-4 mr-1" />
                          {doc.employee.lastName} {doc.employee.firstName} {doc.employee.middleName || ''}
                        </div>
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


      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        employees={employees}
        onSuccess={handleUploadSuccess}
      />

      <DocumentPreview
        document={previewModal.document}
        isOpen={previewModal.isOpen}
        onClose={() => setPreviewModal({ isOpen: false, document: null })}
      />

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

export default DocumentsPage;
