import axios from 'axios';

const API_BASE_URL = 'http://localhost:5147/api';

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

export const employeesAPI = {
  getAll: () => api.get('/employees'),
  
  create: (data) => api.post('/employees', data),
  
  update: (id, data) => api.put(`/employees/${id}`, data),
  
  delete: (id) => api.delete(`/employees/${id}`),
  
  search: (query) => api.get(`/employees/search?q=${encodeURIComponent(query)}`),
};

export const documentTypesAPI = {
  getAll: () => api.get('/documenttypes'),
  
  create: (data) => api.post('/documenttypes', data),
  
  update: (id, data) => api.put(`/documenttypes/${id}`, data),
  
  delete: (id) => api.delete(`/documenttypes/${id}`),
};

export const employeeDocumentsAPI = {
  getByEmployee: (employeeId) => api.get(`/employeedocuments/employee/${employeeId}`),
  
  download: (documentId) => api.get(`/employeedocuments/${documentId}`, {
    responseType: 'blob'
  }),
  
  upload: (formData) => api.post('/employeedocuments', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  delete: (documentId) => api.delete(`/employeedocuments/${documentId}`),
};

export default api;
