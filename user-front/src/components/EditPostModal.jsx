'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { BsPencil } from 'react-icons/bs';

const EditPostModal = ({ 
  show, 
  onSave, 
  onCancel, 
  postData = null,
  isEditing = false
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (postData) {
      setTitle(postData.title || '');
      setContent(postData.content || '');
    }
  }, [postData]);

  const handleSave = () => {
    if (onSave) {
      onSave({
        title: title.trim(),
        content: content.trim()
      });
    }
  };

  const handleCancel = () => {
    // Reset form
    setTitle('');
    setContent('');
    if (onCancel) {
      onCancel();
    }
  };

  const isFormValid = title.trim() && content.trim();

  return (
    <Modal 
      show={show} 
      onHide={handleCancel}
      size="lg"
      centered
      className="edit-post-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <BsPencil size={20} className="me-2 text-primary" />
          Gönderiyi Düzenle
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Başlık</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Gönderi başlığını girin..."
              maxLength={100}
            />
            <Form.Text className="text-muted">
              {title.length}/100 karakter
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>İçerik</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Gönderi içeriğini girin..."
              maxLength={1000}
            />
            <Form.Text className="text-muted">
              {content.length}/1000 karakter
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleCancel}>
          İptal
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSave}
          disabled={!isFormValid || isEditing}
        >
          {isEditing ? 'Güncelleniyor...' : 'Güncelle'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditPostModal;
