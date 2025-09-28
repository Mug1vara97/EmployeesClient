import axios from 'axios';

const API_BASE_URL = 'http://localhost:5055/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getToken = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');

const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const response = await api.post('/users/refresh', {
            accessToken: getToken(),
            refreshToken: refreshToken
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          setTokens(accessToken, newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          clearTokens();
          window.location.href = '/authentication';
          return Promise.reject(refreshError);
        }
      } else {
        clearTokens();
        window.location.href = '/authentication';
      }
    }
    
    console.error('API Error:', error.response?.data || error.message);
    
    if (error.response) {
      const status = error.response.status;
      let message = error.response.data?.message || error.response.data?.title || 'Произошла ошибка сервера';
      
      if (error.response.data && Array.isArray(error.response.data)) {
        message = error.response.data.map(err => err.description || err.message || err).join(', ');
      }
      
      switch (status) {
        case 400:
          console.error('Ошибка валидации:', message);
          break;
        case 401:
          console.error('Не авторизован:', message);
          break;
        case 403:
          console.error('Доступ запрещен:', message);
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

export const authAPI = {
  register: (email, password) => api.post('/users/register', { email, password }),
  
  login: (email, password) => api.post('/users/login', { email, password }).then(response => {
    const { accessToken, refreshToken } = response.data;
    setTokens(accessToken, refreshToken);
    return response;
  }),
  
  logout: () => api.get('/users/logout').then(() => {
    clearTokens();
  }),
  
  refresh: (accessToken, refreshToken) => api.post('/users/refresh', { accessToken, refreshToken }).then(response => {
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
    setTokens(newAccessToken, newRefreshToken);
    return response;
  }),
  
  isAuthenticated: () => !!getToken(),
  
  getToken: getToken,
  getRefreshToken: getRefreshToken
};

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
