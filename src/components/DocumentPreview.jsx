import { useState, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw, FileText, Image, File } from 'lucide-react';
import { employeeDocumentsAPI } from '../services/api';
import { useNotification } from '../hooks/useNotification';
import LoadingSpinner from './LoadingSpinner';

const DocumentPreview = ({ document, isOpen, onClose }) => {
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  
  const { showError } = useNotification();

  useEffect(() => {
    if (isOpen && document) {
      loadPreview();
    } else {
      if (previewData && previewData.url) {
        URL.revokeObjectURL(previewData.url);
      }
      setPreviewData(null);
      setError(null);
      setZoom(1);
      setRotation(0);
    }
  }, [isOpen, document]);

  const loadPreview = async () => {
    if (!document) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await employeeDocumentsAPI.download(document.id);
      const blob = new Blob([response.data], { type: document.mimeType });
      const url = URL.createObjectURL(blob);
      
      setPreviewData({
        url,
        blob,
        type: document.mimeType
      });
    } catch (error) {
      console.error('Ошибка загрузки документа для предварительного просмотра:', error);
      setError('Не удалось загрузить документ для предварительного просмотра');
      showError('Ошибка загрузки документа');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (previewData) {
      const link = document.createElement('a');
      link.href = previewData.url;
      link.download = document.documentName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const resetView = () => {
    setZoom(1);
    setRotation(0);
  };

  const isImage = () => {
    return document && document.mimeType && document.mimeType.startsWith('image/');
  };

  const isPDF = () => {
    return document && document.mimeType && document.mimeType === 'application/pdf';
  };

  const isText = () => {
    return document && document.mimeType && (
      document.mimeType.startsWith('text/') || 
      document.mimeType === 'application/json' ||
      document.documentName.endsWith('.txt') ||
      document.documentName.endsWith('.json')
    );
  };

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <FileText className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ошибка загрузки</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={loadPreview}
            className="btn-primary"
          >
            Попробовать снова
          </button>
        </div>
      );
    }

    if (!previewData) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Документ не загружен</p>
          </div>
        </div>
      );
    }

    if (isImage()) {
      return (
        <div className="flex items-center justify-center h-full overflow-auto">
          <img
            src={previewData.url}
            alt={document.documentName}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: 'center'
            }}
          />
        </div>
      );
    }

    if (isPDF()) {
      return (
        <div className="h-full">
          <iframe
            src={previewData.url}
            className="w-full h-full border-0"
            title={document.documentName}
          />
        </div>
      );
    }

    if (isText()) {
      return (
        <div className="h-full overflow-auto p-4">
          <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
            {previewData.textContent || 'Загрузка текста...'}
          </pre>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <File className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Предварительный просмотр недоступен</h3>
        <p className="text-gray-500 mb-4">
          Для файлов типа "{document.mimeType}" предварительный просмотр не поддерживается
        </p>
        <button
          onClick={handleDownload}
          className="btn-primary flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Скачать файл
        </button>
      </div>
    );
  };

  useEffect(() => {
    if (previewData && document && document.mimeType && isText() && !previewData.textContent) {
      previewData.blob.text().then(text => {
        setPreviewData(prev => ({ ...prev, textContent: text }));
      }).catch(error => {
        console.error('Ошибка чтения текстового файла:', error);
        setError('Не удалось прочитать текстовый файл');
      });
    }
  }, [previewData, document]);

  useEffect(() => {
    return () => {
      if (previewData && previewData.url) {
        URL.revokeObjectURL(previewData.url);
      }
    };
  }, [previewData]);

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-6xl max-h-[90vh] flex flex-col">
          <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {isImage() && <Image className="h-5 w-5 text-blue-500" />}
                {isPDF() && <FileText className="h-5 w-5 text-red-500" />}
                {isText() && <FileText className="h-5 w-5 text-green-500" />}
                {!isImage() && !isPDF() && !isText() && <File className="h-5 w-5 text-gray-500" />}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {document.documentName}
                </h3>
                <p className="text-sm text-gray-500">
                  {document.employee.lastName} {document.employee.firstName} • {document.documentType.typeName}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {isImage() && (
                <div className="flex items-center space-x-1 mr-4">
                  <button
                    onClick={handleZoomOut}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Уменьшить"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-500 min-w-[3rem] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Увеличить"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleRotate}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Повернуть"
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={resetView}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Сбросить вид"
                  >
                    <span className="text-xs">1:1</span>
                  </button>
                </div>
              )}
              
              <button
                onClick={handleDownload}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Скачать"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Закрыть"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {renderPreview()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;