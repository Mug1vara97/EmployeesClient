import { useState } from 'react';
import Layout from './components/Layout';
import EmployeesPage from './pages/EmployeesPage';
import DocumentsPage from './pages/DocumentsPage';

function App() {
  const [activeTab, setActiveTab] = useState('employees');

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'employees':
        return 'Сотрудники';
      case 'documents':
        return 'Документы';
      default:
        return 'EmployeeApp';
    }
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'employees':
        return <EmployeesPage />;
      case 'documents':
        return <DocumentsPage />;
      default:
        return <EmployeesPage />;
    }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={handleTabChange}
      pageTitle={getPageTitle()}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
