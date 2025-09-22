import { Users, FileText } from 'lucide-react';

const Navigation = ({ activeTab, onTabChange }) => {
  const navigationItems = [
    {
      id: 'employees',
      name: 'Сотрудники',
      icon: Users,
      description: 'Управление сотрудниками'
    },
    {
      id: 'documents',
      name: 'Документы',
      icon: FileText,
      description: 'Управление документами'
    }
  ];

  return (
    <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
      <div className="flex h-16 items-center px-4">
        <h1 className="text-xl font-bold text-gray-900">EmployeeApp</h1>
      </div>
      <div className="flex-1 px-4 py-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div>{item.name}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Navigation;
