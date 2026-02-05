'use client';

import { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { BsDownload, BsX, BsFullscreen, BsFullscreenExit } from 'react-icons/bs';
import { useLanguage } from '@/context/useLanguageContext';

const PdfViewer = ({ show, onHide, pdfUrl, title }) => {
  const { t, loading: langLoading } = useLanguage();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Safe translation function with fallback
  const translate = (key, fallback) => {
    if (langLoading) return fallback;
    try {
      return t(key) || fallback;
    } catch {
      return fallback;
    }
  };

  useEffect(() => {
    // Modal açıldığında fullscreen'i sıfırla
    if (show) {
      setIsFullscreen(false);
    }
  }, [show]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const downloadPdf = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size={isFullscreen ? 'xl' : 'lg'}
      fullscreen={isFullscreen}
      centered={!isFullscreen}
      className="pdf-viewer-modal"
    >
      <Modal.Header className="bg-gradient text-white border-0" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Modal.Title className="d-flex align-items-center w-100">
          <span className="flex-grow-1">{title || translate('books.pdfViewer.title', 'PDF Viewer')}</span>
          <div className="d-flex gap-2 align-items-center">
            <Button
              variant="light"
              size="sm"
              onClick={toggleFullscreen}
              className="d-flex align-items-center"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <BsFullscreenExit /> : <BsFullscreen />}
            </Button>
            <Button
              variant="light"
              size="sm"
              onClick={downloadPdf}
              className="d-flex align-items-center"
              title="Download"
            >
              <BsDownload />
            </Button>
            <Button
              variant="light"
              size="sm"
              onClick={onHide}
              className="d-flex align-items-center"
            >
              <BsX size={24} />
            </Button>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0 bg-light" style={{ height: isFullscreen ? 'calc(100vh - 80px)' : '75vh' }}>
        <div className="w-100 h-100">
          {pdfUrl ? (
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: '#525659'
              }}
              title={title || 'PDF Document'}
            />
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">{translate('books.pdfViewer.error', 'PDF URL not found')}</p>
            </div>
          )}
        </div>
      </Modal.Body>

      <style jsx global>{`
        /* Modal Styles */
        .pdf-viewer-modal .modal-content {
          border: none;
          border-radius: 12px;
          overflow: hidden;
        }

        .pdf-viewer-modal .modal-header {
          padding: 1rem 1.5rem;
          border-bottom: none;
        }

        .pdf-viewer-modal.modal-fullscreen .modal-content {
          border-radius: 0;
        }

        @media (max-width: 768px) {
          .pdf-viewer-modal .modal-header {
            padding: 0.75rem 1rem;
          }
          
          .pdf-viewer-modal .modal-header .btn {
            padding: 0.25rem 0.5rem;
          }
        }
      `}</style>
    </Modal>
  );
};

export default PdfViewer;
