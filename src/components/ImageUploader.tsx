import React, { useState, useRef, ChangeEvent } from 'react';
import { uploadImage } from '../services/imageUpload';
import { Box } from '@mui/material';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUploaded, currentImageUrl }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLoading(true);
      setError(null);
      try {
        const url = await uploadImage(file);
        onImageUploaded(url);
      } catch (err) {
        setError('Image upload failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    if (!file.type.startsWith('image/')) {
      setError('Please drop an image file');
      return;
    }
    
    if (file.size > 32 * 1024 * 1024) {
      setError('Image size should be less than 32MB');
      return;
    }

    setError(null);

    try {
      setLoading(true);
      const imageUrl = await uploadImage(file);
      onImageUploaded(imageUrl);
    } catch (error) {
      setError('Failed to upload image. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Box>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      <div
        className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
        onClick={triggerFileInput}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {loading && (
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
        )}
        {currentImageUrl && (
          <img
            src={currentImageUrl}
            alt="Uploaded"
            className="max-h-16 max-w-full mb-4 rounded"
          />
        )}
        {!currentImageUrl && !loading && (
          <p className="mt-1 text-sm text-gray-500">
            Drag and drop an image, or click to select
          </p>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </Box>
  );
}; 
