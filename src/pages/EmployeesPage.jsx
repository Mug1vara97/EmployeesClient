import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Phone,
  Mail,
  Calendar,
  Users,
  Upload
} from 'lucide-react';
import EmployeeForm from '../components/EmployeeForm';
import ConfirmDialog from '../components/ConfirmDialog';
import Notification from '../components/Notification';
import LoadingSpinner from '../components/LoadingSpinner';
import QuickDocumentUpload from '../components/QuickDocumentUpload';
import { useNotification } from '../hooks/useNotification';
import { employeesAPI } from '../services/api';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, employee: null });
  const [operationLoading, setOperationLoading] = useState(false);
  const [uploadModal, setUploadModal] = useState({ isOpen: false, employee: null });
  
  const { notifications, removeNotification, showSuccess, showError } = useNotification();

  useEffect(() => {
    loadEmployees();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeesAPI.getAll();
      setEmployees(response.data);
    } catch (error) {
      console.error('Ошибка загрузки сотрудников:', error);
      showError('Ошибка загрузки сотрудников');
      setEmployees([
        {
          id: 1,
          firstName: 'Иван',
          lastName: 'Иванов',
          middleName: 'Иванович',
          email: 'ivan.ivanov@example.com',
          phone: '+7 (999) 123-45-67',
          dateOfBirth: '2000-09-05',
          createdAt: '2024-01-15'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };


  const handleSearch = async (query) => {
    if (query.trim()) {
      try {
        const response = await employeesAPI.search(query);
        setEmployees(response.data);
      } catch (error) {
        console.error('Ошибка поиска:', error);
        showError('Ошибка поиска сотрудников');
      }
    } else {
      loadEmployees();
    }
  };


  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleSaveEmployee = async (employeeData) => {
    try {
      setOperationLoading(true);
      if (editingEmployee) {
        const updateData = { ...employeeData, id: editingEmployee.id };
        await employeesAPI.update(editingEmployee.id, updateData);
        setEditingEmployee(null);
        showSuccess('Сотрудник успешно обновлен');
      } else {
        await employeesAPI.create(employeeData);
        showSuccess('Сотрудник успешно добавлен');
      }
      await loadEmployees();
      setShowAddModal(false);
    } catch (error) {
      console.error('Ошибка сохранения сотрудника:', error);
      console.error('Данные запроса:', employeeData);
      showError('Ошибка сохранения сотрудника');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setShowAddModal(true);
  };

  const handleUploadDocument = (employee) => {
    setUploadModal({ isOpen: true, employee });
  };

  const handleDeleteEmployee = (employee) => {
    setDeleteConfirm({ isOpen: true, employee });
  };

  const confirmDelete = async () => {
    try {
      setOperationLoading(true);
      await employeesAPI.delete(deleteConfirm.employee.id);
      await loadEmployees();
      showSuccess('Сотрудник успешно удален');
    } catch (error) {
      console.error('Ошибка удаления сотрудника:', error);
      showError('Ошибка удаления сотрудника');
    } finally {
      setOperationLoading(false);
    }
  };

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
          <p className="text-sm text-gray-500">
            Управление данными сотрудников
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-x-2"
        >
          <Plus className="h-4 w-4" />
          Добавить сотрудника
        </button>
      </div>

      <div className="flex items-center gap-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по имени или email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              handleSearch(e.target.value);
            }}
            className="input-field pl-10"
          />
        </div>
      </div>

      <div className="card">
        <div className="px-6 py-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Список сотрудников</h3>
          
          {employees.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <Users className="h-12 w-12" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Нет сотрудников</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Попробуйте изменить поисковый запрос' : 'Начните с добавления нового сотрудника'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold text-sm">
                          {getInitials(employee.firstName, employee.lastName)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {employee.lastName} {employee.firstName} {employee.middleName || ''}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        {employee.email && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail className="h-4 w-4 mr-1" />
                            {employee.email}
                          </div>
                        )}
                        {employee.phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="h-4 w-4 mr-1" />
                            {employee.phone}
                          </div>
                        )}
                        {employee.dateOfBirth && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(employee.dateOfBirth).toLocaleDateString('ru-RU')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleUploadDocument(employee)}
                      className="p-2 text-blue-400 hover:text-blue-600"
                      title="Добавить документ"
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleEditEmployee(employee)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Редактировать"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteEmployee(employee)}
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

      <EmployeeForm
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingEmployee(null);
        }}
        employee={editingEmployee}
        onSave={handleSaveEmployee}
        loading={operationLoading}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, employee: null })}
        onConfirm={confirmDelete}
        title="Удалить сотрудника"
        message={`Вы уверены, что хотите удалить сотрудника ${deleteConfirm.employee?.lastName} ${deleteConfirm.employee?.firstName}? Это действие нельзя отменить.`}
        confirmText={operationLoading ? "Удаление..." : "Удалить"}
        cancelText="Отмена"
        type="danger"
        loading={operationLoading}
      />

      <QuickDocumentUpload
        employee={uploadModal.employee}
        isOpen={uploadModal.isOpen}
        onClose={() => setUploadModal({ isOpen: false, employee: null })}
        onSuccess={() => {
        }}
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

export default EmployeesPage;