function Toast({ toast }) {
  if (!toast.show) return null;

  const getToastStyles = () => {
    const baseStyles = "fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300";
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-green-500 text-white`;
      case 'error':
        return `${baseStyles} bg-red-500 text-white`;
      case 'warning':
        return `${baseStyles} bg-yellow-500 text-white`;
      default:
        return `${baseStyles} bg-blue-500 text-white`;
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-center gap-2">
        <span>{getIcon()}</span>
        <span>{toast.message}</span>
      </div>
    </div>
  );
}

export default Toast;