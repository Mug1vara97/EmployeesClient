import Navigation from './Navigation';

const Layout = ({ children, activeTab, onTabChange, pageTitle, onLogout }) => {

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <Navigation activeTab={activeTab} onTabChange={onTabChange} />
      </div>

      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-6 border-b border-gray-200 bg-white px-8 shadow-sm">
          <div className="flex flex-1 items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              {pageTitle}
            </h1>
          </div>
          {onLogout && (
            <div className="flex items-center">
              <button
                onClick={onLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Выйти
              </button>
            </div>
          )}
        </div>

        <main className="py-6">
          <div className="mx-auto max-w-7xl px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;