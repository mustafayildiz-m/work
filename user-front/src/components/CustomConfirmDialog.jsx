'use client';

import { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { BsExclamationTriangle, BsCheckCircle, BsXCircle } from 'react-icons/bs';

const CustomConfirmDialog = ({ 
  show, 
  onConfirm, 
  onCancel, 
  title = 'Onay Gerekli',
  message = 'Bu işlemi gerçekleştirmek istediğinizden emin misiniz?',
  confirmText = 'Evet',
  cancelText = 'Hayır',
  type = 'warning', // 'warning', 'danger', 'info'
  size = 'sm'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
    }
  }, [show]);

  const handleConfirm = () => {
    setIsVisible(false);
    onConfirm();
  };

  const handleCancel = () => {
    setIsVisible(false);
    onCancel();
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <BsExclamationTriangle size={24} className="text-danger" />;
      case 'info':
        return <BsCheckCircle size={24} className="text-info" />;
      default:
        return <BsExclamationTriangle size={24} className="text-warning" />;
    }
  };

  const getConfirmButtonVariant = () => {
    switch (type) {
      case 'danger':
        return 'danger';
      case 'info':
        return 'primary';
      default:
        return 'warning';
    }
  };

  return (
    <Modal 
      show={isVisible} 
      onHide={handleCancel}
      size={size}
      centered
      className="custom-confirm-dialog"
    >
      <Modal.Body className="text-center p-4">
        <div className="mb-3">
          {getIcon()}
        </div>
        
        <h5 className="mb-3 fw-bold">{title}</h5>
        <p className="mb-4 text-muted">{message}</p>
        
        <div className="d-flex gap-2 justify-content-center">
          <Button 
            variant="outline-secondary" 
            onClick={handleCancel}
            className="px-4"
          >
            {cancelText}
          </Button>
          <Button 
            variant={getConfirmButtonVariant()} 
            onClick={handleConfirm}
            className="px-4"
          >
            {confirmText}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default CustomConfirmDialog;
