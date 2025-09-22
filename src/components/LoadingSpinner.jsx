const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-12 w-12';
      case 'xl':
        return 'h-16 w-16';
      default:
        return 'h-8 w-8';
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${getSizeClasses()}`}></div>
    </div>
  );
};

export default LoadingSpinner;
