import React, { useState, useRef } from 'react';
import { uploadImage } from '../services/imageUpload';
import { Box, Button, IconButton } from '@mui/material';

interface MultiImageUploaderProps {
  onImagesUploaded: (urls: string) => void;
  currentImageUrls?: string; // Semicolon-separated URLs
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({ 
  onImagesUploaded, 
  currentImageUrls = ''
}) => {
  const [imageUrls, setImageUrls] = useState<string[]>(
    currentImageUrls ? currentImageUrls.split(';').filter(url => url.trim() !== '') : []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadImageFile(file);
    }
  };

  const uploadImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    if (file.size > 32 * 1024 * 1024) {
      setError('Image size should be less than 32MB');
      return;
    }

    setError(null);
    setLoading(true);
    
    try {
      const url = await uploadImage(file);
      const newImageUrls = [...imageUrls, url];
      setImageUrls(newImageUrls);
      onImagesUploaded(newImageUrls.join(';'));
    } catch (err) {
      console.error(err);
      setError('Image upload failed. Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    await uploadImageFile(files[0]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newImageUrls = imageUrls.filter((_, index) => index !== indexToRemove);
    setImageUrls(newImageUrls);
    onImagesUploaded(newImageUrls.join(';'));
  };

  return (
    <Box>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        style={{ display: 'none' }}
      />
      
      {/* Thumbnail gallery */}
      {imageUrls.length > 0 && (
        <Box className="mb-4 flex flex-wrap gap-2">
          {imageUrls.map((url, index) => (
            <Box key={index} className="relative group">
              <img
                src={url}
                alt={`Uploaded ${index + 1}`}
                className="h-16 w-16 object-cover rounded border border-gray-300"
                style={{ height: '70px', width : '50px' }}
              />
              <IconButton
                onClick={() => removeImage(index)}
                className="absolute top-0 right-0 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity p-1"
                size="small"
                style={{ 
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  backgroundColor: 'rgba(239, 68, 68, 0.9)',
                  padding: '2px',
                  color: 'white',
                  width: '20px',
                  height: '20px',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
      
      {/* Upload area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
        onClick={triggerFileInput}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {loading && (
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500 mb-2"></div>
        )}
        
        {!loading && (
          <>
            <p className="text-sm text-gray-500 mb-2">
              {imageUrls.length > 0 
                ? 'Add another image' 
                : 'Drag and drop an image, or click to select'}
            </p>
            <Button 
              variant="outlined" 
              size="small"
              className="mt-2"
              style={{ textTransform: 'none' }}
            >
              Add Image
            </Button>
          </>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </Box>
  );
};