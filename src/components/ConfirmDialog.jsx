import { X, AlertTriangle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Удалить", cancelText = "Отмена", type = "danger", loading = false }) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-red-600',
          iconBg: 'bg-red-100',
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        };
      case 'warning':
        return {
          icon: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        };
      default:
        return {
          icon: 'text-blue-600',
          iconBg: 'bg-blue-100',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
        };
    }
  };

  const styles = getTypeStyles();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-md">
          <div className="bg-white px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center`}>
                  <AlertTriangle className={`h-6 w-6 ${styles.icon}`} />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    {title}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                {message}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-3 flex flex-row-reverse gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className={`inline-flex justify-center items-center gap-2 rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.confirmButton} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading && <LoadingSpinner size="sm" />}
              {confirmText}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
