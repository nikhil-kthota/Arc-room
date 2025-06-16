import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileIcon } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
}

export function FileUpload({ 
  onUpload, 
  accept, 
  maxFiles = 10, 
  maxSize = 10485760 // 10MB
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
    onDropRejected: (rejections) => {
      const errors: string[] = [];
      
      rejections.forEach(rejection => {
        rejection.errors.forEach(error => {
          if (error.code === 'file-too-large') {
            errors.push(`File ${rejection.file.name} is too large. Max size is ${maxSize / 1048576}MB.`);
          } else if (error.code === 'file-invalid-type') {
            errors.push(`File ${rejection.file.name} has an invalid type.`);
          } else if (error.code === 'too-many-files') {
            errors.push(`Too many files. Max is ${maxFiles}.`);
          } else {
            errors.push(`Error with file ${rejection.file.name}: ${error.message}`);
          }
        });
      });
      
      setError(errors.join(' '));
    }
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file to upload.');
      return;
    }

    try {
      setUploading(true);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onUpload(files);
      setFiles([]);
    } catch (err) {
      setError((err as Error).message || 'Failed to upload files.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors',
          {
            'border-primary-400 bg-primary-50': isDragActive,
            'border-gray-300 hover:border-primary-400 bg-gray-50 hover:bg-gray-100': !isDragActive,
            'opacity-50 pointer-events-none': uploading,
          }
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center text-center">
          <Upload className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-lg font-medium text-gray-700">
            {isDragActive ? 'Drop files here' : 'Drag files here or click to browse'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Upload up to {maxFiles} files (max {maxSize / 1048576}MB each)
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
          {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Selected files ({files.length})
          </h4>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between bg-white p-2 rounded-md border border-gray-200">
                <div className="flex items-center">
                  <FileIcon className="w-5 h-5 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700 truncate">{file.name}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <button 
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-gray-500 hover:text-red-600 focus:outline-none"
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
          
          <div className="mt-4">
            <Button 
              onClick={handleUpload} 
              isLoading={uploading}
              className="w-full sm:w-auto"
            >
              Upload {files.length} {files.length === 1 ? 'file' : 'files'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}