import Navigation from './Navigation';

const Layout = ({ children, activeTab, onTabChange, pageTitle }) => {

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