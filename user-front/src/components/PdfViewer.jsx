'use client';

import { useState, useCallback, useMemo } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { BsDownload, BsX, BsFullscreen, BsFullscreenExit } from 'react-icons/bs';
import { Document, Page, pdfjs } from 'react-pdf';
import { useLanguage } from '@/context/useLanguageContext';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

const MAX_PAGES_RENDER = 150;

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
}

// iOS Safari/WebKit: iframe içindeki PDF sadece ilk sayfayı gösterir, kaydırma çalışmaz.
const isIosOrMobile = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || window.innerWidth < 768;
};

// Ayrı component - useEffect yok, sadece onLoadSuccess ile state güncellemesi. Maximum update depth önlenir.
const PdfCanvasViewer = ({ pdfUrl, errorMsg }) => {
  const [numPages, setNumPages] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const fileOptions = useMemo(() => (pdfUrl ? { url: pdfUrl } : null), [pdfUrl]);

  const onLoadSuccess = useCallback(({ numPages: n }) => {
    setNumPages(n);
    setLoadError(null);
  }, []);

  const onLoadError = useCallback((err) => {
    console.error('PDF load error:', err);
    setLoadError(err?.message || 'PDF yüklenemedi');
  }, []);

  const pageWidth = typeof window !== 'undefined' ? Math.min(window.innerWidth - 32, 800) : 800;
  const pagesToRender = numPages != null ? Math.min(numPages, MAX_PAGES_RENDER) : 0;

  return (
    <div
      className="w-100 h-100 overflow-auto"
      style={{
        WebkitOverflowScrolling: 'touch',
        backgroundColor: '#525659',
        padding: '16px'
      }}
    >
      <Document
        file={fileOptions}
        onLoadSuccess={onLoadSuccess}
        onLoadError={onLoadError}
        loading={
          <div className="d-flex justify-content-center align-items-center py-5">
            <Spinner animation="border" variant="light" />
          </div>
        }
        error={
          <div className="text-center py-5 text-white">
            <p>{loadError || errorMsg}</p>
          </div>
        }
      >
        {pagesToRender > 0 &&
          Array.from(new Array(pagesToRender), (_, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              width={pageWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="mb-3 shadow"
            />
          ))}
      </Document>
      {numPages != null && numPages > MAX_PAGES_RENDER && (
        <div className="text-center text-white py-3 small">
          İlk {MAX_PAGES_RENDER} sayfa gösteriliyor. Tamamı için indirin.
        </div>
      )}
    </div>
  );
};

const PdfViewer = ({ show, onHide, pdfUrl, title }) => {
  const { t, loading: langLoading } = useLanguage();
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [useCanvasRender] = useState(() => isIosOrMobile());

  const translate = (key, fallback) => {
    if (langLoading) return fallback;
    try {
      return t(key) || fallback;
    } catch {
      return fallback;
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const downloadPdf = async () => {
    if (!pdfUrl) return;

    try {
      const safeTitle = (title || 'document').replace(/[^\w\-]+/g, '_');
      const filename = `${safeTitle}.pdf`;
      const downloadUrl = `/api/download-pdf?pdfUrl=${encodeURIComponent(pdfUrl)}&filename=${encodeURIComponent(filename)}`;
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error('PDF indirilemedi');
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('PDF download error:', error);
    }
  };

  const renderPdfContent = () => {
    if (!pdfUrl) {
      return (
        <div className="text-center py-5">
          <p className="text-muted">{translate('books.pdfViewer.error', 'PDF URL not found')}</p>
        </div>
      );
    }

    if (useCanvasRender) {
      return (
        <PdfCanvasViewer
          key={pdfUrl}
          pdfUrl={pdfUrl}
          errorMsg={translate('books.pdfViewer.error', 'PDF yüklenemedi')}
        />
      );
    }

    return (
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
    );
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
          {show && renderPdfContent()}
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
