import { createContext, use, useState } from 'react';
import { ToastBody, ToastHeader } from 'react-bootstrap';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import { BsCheckCircleFill, BsExclamationTriangleFill, BsInfoCircleFill, BsXCircleFill } from 'react-icons/bs';

const NotificationContext = createContext(undefined);

function Toastr({
  show,
  title,
  message,
  onClose,
  variant = 'light',
  delay
}) {
  // Get icon based on variant
  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <BsCheckCircleFill className="text-success me-2" />;
      case 'danger':
        return <BsXCircleFill className="text-danger me-2" />;
      case 'warning':
        return <BsExclamationTriangleFill className="text-warning me-2" />;
      case 'info':
        return <BsInfoCircleFill className="text-info me-2" />;
      default:
        return null;
    }
  };

  // Get toast styling based on variant
  const getToastStyle = () => {
    switch (variant) {
      case 'success':
        return 'border-success border-start border-5';
      case 'danger':
        return 'border-danger border-start border-5';
      case 'warning':
        return 'border-warning border-start border-5';
      case 'info':
        return 'border-info border-start border-5';
      default:
        return '';
    }
  };

  return (
    <ToastContainer 
      className="m-3 position-fixed" 
      position="top-end"
      style={{ zIndex: 9999 }}
    >
      <Toast 
        className={`${getToastStyle()} shadow-lg`}
        delay={delay} 
        show={show} 
        onClose={onClose} 
        autohide
        style={{ minWidth: '300px' }}
      >
        {title && (
          <ToastHeader className="bg-transparent border-0 pb-1">
            <div className="d-flex align-items-center w-100">
              {getIcon()}
              <strong className="me-auto">{title}</strong>
            </div>
          </ToastHeader>
        )}
        <ToastBody className="pt-0">
          <div className="d-flex align-items-start">
            {!title && getIcon()}
            <span className={!title ? 'ms-2' : ''}>{message}</span>
          </div>
        </ToastBody>
      </Toast>
    </ToastContainer>
  );
}

export function useNotificationContext() {
  const context = use(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within an NotificationProvider');
  }
  return context;
}

export function NotificationProvider({
  children
}) {
  const defaultConfig = {
    show: false,
    message: '',
    title: '',
    delay: 3000
  };
  
  const [config, setConfig] = useState(defaultConfig);
  
  const hideNotification = () => {
    setConfig({
      show: false,
      message: '',
      title: ''
    });
  };
  
  const showNotification = ({
    title,
    message,
    variant,
    delay = 3000
  }) => {
    setConfig({
      show: true,
      title,
      message,
      variant: variant ?? 'light',
      onClose: hideNotification,
      delay
    });
    
    // Auto-hide after delay
    setTimeout(() => {
      setConfig(defaultConfig);
    }, delay);
  };

  return (
    <NotificationContext.Provider value={{
      showNotification
    }}>
      <Toastr {...config} />
      {children}
    </NotificationContext.Provider>
  );
}