import axios from 'axios';

const API_BASE_URL = 'http://localhost:5055/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.title || 'Произошла ошибка сервера';
      
      switch (status) {
        case 400:
          console.error('Ошибка валидации:', message);
          break;
        case 404:
          console.error('Ресурс не найден:', message);
          break;
        case 500:
          console.error('Внутренняя ошибка сервера:', message);
          break;
        default:
          console.error(`Ошибка ${status}:`, message);
      }
    } else if (error.request) {
      console.error('Ошибка сети:', 'Не удалось подключиться к серверу');
    } else {
      console.error('Ошибка запроса:', error.message);
    }
    
    return Promise.reject(error);
  }
);

const adaptEmployeeFromAPI = (apiEmployee) => ({
  id: apiEmployee.id,
  firstName: apiEmployee.firstName,
  lastName: apiEmployee.lastName,
  middleName: apiEmployee.patronymic,
  username: apiEmployee.username,
  dateOfBirth: apiEmployee.birthday
});

const adaptEmployeeToAPI = (employee) => ({
  username: employee.username || '',
  firstName: employee.firstName,
  lastName: employee.lastName,
  patronymic: employee.middleName || '',
  birthday: employee.dateOfBirth
});

export const employeesAPI = {
  getAll: () => api.get('/employees').then(response => ({
    data: response.data.map(adaptEmployeeFromAPI)
  })),
  
  getById: (id) => api.get(`/employees/${id}`).then(response => ({
    data: {
      ...adaptEmployeeFromAPI(response.data),
      files: response.data.files || []
    }
  })),
  
  create: (data) => api.post('/employees', adaptEmployeeToAPI(data)).then(response => ({
    data: adaptEmployeeFromAPI(response.data)
  })),
  
  update: (id, data) => api.put(`/employees/${id}`, adaptEmployeeToAPI(data)).then(response => ({
    data: adaptEmployeeFromAPI(response.data)
  })),
  
  delete: (id) => api.delete(`/employees/${id}`),
};

export const documentTypesAPI = {
  getAll: () => Promise.resolve({ data: [
    { id: 1, typeName: 'Паспорт' },
    { id: 2, typeName: 'Трудовая книжка' },
    { id: 3, typeName: 'Диплом' },
    { id: 4, typeName: 'Справка' },
    { id: 5, typeName: 'Другое' }
  ]}),
  
  create: (data) => Promise.resolve({ data: { id: Date.now(), ...data } }),
  
  update: (id, data) => Promise.resolve({ data: { id, ...data } }),
  
  delete: (id) => Promise.resolve({ data: { id } }),
};

const adaptFileFromAPI = (apiFile, employee) => ({
  id: apiFile.id,
  documentName: apiFile.path.split('/').pop() || 'Файл',
  fileSize: 0,
  mimeType: 'application/octet-stream',
  createdAt: apiFile.created,
  employee: employee,
  documentType: { id: 1, typeName: 'Документ' }
});

export const employeeDocumentsAPI = {
  getByEmployee: (employeeId) => api.get(`/employees/${employeeId}`).then(response => {
    const employee = adaptEmployeeFromAPI(response.data);
    const files = (response.data.files || []).map(file => adaptFileFromAPI(file, employee));
    return { data: files };
  }),
  
  download: (fileId) => api.get(`/employees/files/${fileId}`, {
    responseType: 'blob'
  }),
  
  preview: (fileId) => api.get(`/employees/files/${fileId}/preview`, {
    responseType: 'blob'
  }),
  
  upload: (employeeId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/employees/${employeeId}/link-file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  delete: (fileId) => api.delete(`/employees/files/${fileId}`),
};

export default api;
