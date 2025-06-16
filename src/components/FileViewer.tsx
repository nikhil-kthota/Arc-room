import { useState, useEffect } from 'react';
import { FileItem } from '../types';
import { FileIcon, AlertCircle, Download, ExternalLink } from 'lucide-react';
import { Button } from './ui/Button';

interface FileViewerProps {
  file: FileItem;
}

export function FileViewer({ file }: FileViewerProps) {
  const [viewerError, setViewerError] = useState<string | null>(null);
  
  useEffect(() => {
    // Reset error when file changes
    setViewerError(null);
  }, [file]);

  const downloadFile = async (url: string, filename: string) => {
    try {
      // Fetch the file as a blob
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch file');
      }
      
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      a.style.display = 'none';
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl);
      
      console.log(`Downloaded: ${filename}`);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(url, '_blank');
    }
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };
  
  const renderFilePreview = () => {
    const type = file.type.toLowerCase();
    
    // Image files
    if (type.includes('image')) {
      return (
        <div className="w-full">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 truncate flex-1 mr-4">{file.name}</h3>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openInNewTab(file.url)}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => downloadFile(file.url, file.name)}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-black" />
                Download
              </Button>
            </div>
          </div>
          <div className="p-4 flex justify-center">
            <img 
              src={file.url} 
              alt={file.name} 
              className="max-w-full max-h-[600px] object-contain" 
              onError={() => setViewerError('Failed to load image')}
            />
          </div>
        </div>
      );
    }
    
    // PDF files - Show unavailable card directly
    else if (type.includes('pdf')) {
      return (
        <div className="w-full">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 truncate flex-1 mr-4">{file.name}</h3>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openInNewTab(file.url)}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open in New Tab
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => downloadFile(file.url, file.name)}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-black" />
                Download
              </Button>
            </div>
          </div>
          <div className="p-8 text-center bg-gray-50">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <FileIcon className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">PDF Preview Unavailable</h3>
              <p className="text-gray-600 mb-4">
                PDF files cannot be previewed directly in the browser viewer.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Use the options above to open the PDF in a new tab or download it to your device for viewing.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => openInNewTab(file.url)}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </Button>
                <Button
                  variant="primary"
                  onClick={() => downloadFile(file.url, file.name)}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-black" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Office documents and other files
    else {
      return (
        <div className="text-center py-12">
          <FileIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Preview not available</h3>
          <p className="text-gray-500 mb-4">
            This file type cannot be previewed in the browser.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            File type: {file.type}
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => openInNewTab(file.url)}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open in New Tab
            </Button>
            <Button
              variant="primary"
              onClick={() => downloadFile(file.url, file.name)}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-black" />
              Download File
            </Button>
          </div>
        </div>
      );
    }
  };
  
  return (
    <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden">
      {viewerError ? (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Error Loading Preview</h3>
          <p className="text-gray-500 mb-4">{viewerError}</p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => openInNewTab(file.url)}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open in New Tab
            </Button>
            <Button
              variant="primary"
              onClick={() => downloadFile(file.url, file.name)}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-black" />
              Download Instead
            </Button>
          </div>
        </div>
      ) : (
        renderFilePreview()
      )}
    </div>
  );
}