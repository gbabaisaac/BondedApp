import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { Upload, X, Camera, Image as ImageIcon } from 'lucide-react';
import { ScreenHeader } from '../shared/ScreenHeader';
import { ContentHeader } from '../shared/ContentHeader';
import { Button } from '../shared/Button';
import styles from './PhotoUploadScreen.module.css';

interface PhotoUploadScreenProps {
  onNext: () => void;
  onBack?: () => void;
  currentStep: number;
  totalSteps: number;
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
}

const MAX_PHOTOS = 6;

export const PhotoUploadScreen: React.FC<PhotoUploadScreenProps> = ({
  onNext,
  onBack,
  currentStep,
  totalSteps,
  photos,
  onPhotosChange,
}) => {
  const [uploading, setUploading] = useState(false);

  const compressImage = async (file: File): Promise<string> => {
    try {
      const options = {
        maxSizeMB: 2,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(compressedFile);
      });
    } catch (error) {
      console.error('Error compressing image:', error);
      throw error;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    
    try {
      const remainingSlots = MAX_PHOTOS - photos.length;
      const filesToProcess = acceptedFiles.slice(0, remainingSlots);
      
      const compressedImages = await Promise.all(
        filesToProcess.map(file => compressImage(file))
      );
      
      onPhotosChange([...photos, ...compressedImages]);
    } catch (error) {
      console.error('Error processing images:', error);
      alert('Failed to process images. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [photos, onPhotosChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: MAX_PHOTOS - photos.length,
    disabled: photos.length >= MAX_PHOTOS || uploading,
  });

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  const canProceed = photos.length >= 1;

  return (
    <div 
      className={styles.container}
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <ScreenHeader 
        onBack={onBack}
        currentStep={currentStep}
        totalSteps={totalSteps}
      />

      <div 
        className={styles.content}
        style={{
          position: 'absolute',
          top: '80px',
          left: 0,
          right: 0,
          bottom: '120px',
          overflowY: 'scroll',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          padding: '24px 20px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ContentHeader
            stepLabel="YOUR PHOTOS"
            title="Show your best self"
            description="Add 1-6 photos to help others get to know you"
          />

          {/* Helper Text */}
          <div className={styles.helperBadge}>
            <Camera size={16} />
            <span>Your first photo will be your main profile photo</span>
          </div>

          {/* Photo Grid */}
          <div className={styles.photoGrid}>
            <AnimatePresence>
              {photos.map((photo, index) => (
                <motion.div
                  key={index}
                  className={styles.photoSlot}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                >
                  <img src={photo} alt={`Photo ${index + 1}`} className={styles.photo} />
                  
                  {/* Profile Badge */}
                  {index === 0 && (
                    <div className={styles.profileBadge}>
                      Profile
                    </div>
                  )}
                  
                  {/* Remove Button */}
                  <button
                    className={styles.removeButton}
                    onClick={() => removePhoto(index)}
                  >
                    <X size={16} />
                  </button>
                  
                  {/* Gradient Overlay */}
                  <div className={styles.photoOverlay} />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Empty Slots */}
            {photos.length < MAX_PHOTOS && (
              <motion.div
                {...(() => {
                  const { onAnimationStart, onDragStart, onDrag, onDragEnd, ...rest } = getRootProps();
                  return rest;
                })()}
                className={`${styles.uploadSlot} ${isDragActive ? styles.uploadSlotActive : ''}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: photos.length * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <input {...getInputProps()} />
                
                {uploading ? (
                  <div className={styles.uploadingState}>
                    <div className={styles.spinner} />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    <div className={styles.uploadIcon}>
                      {photos.length === 0 ? (
                        <Camera size={32} />
                      ) : (
                        <ImageIcon size={32} />
                      )}
                    </div>
                    <span className={styles.uploadText}>
                      {photos.length === 0 ? 'Add Profile Photo' : 'Add Photo'}
                    </span>
                    {isDragActive && (
                      <span className={styles.dropText}>Drop here!</span>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </div>

          {/* Tips */}
          <div className={styles.tips}>
            <p className={styles.tipTitle}>Tips for great photos:</p>
            <ul className={styles.tipList}>
              <li>✨ Use clear, well-lit photos</li>
              <li>😊 Show your face clearly</li>
              <li>🎯 Add variety - mix of portraits and activities</li>
              <li>📸 Recent photos work best</li>
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <div className={styles.bottomCta}>
        <Button 
          variant="primary" 
          size="lg" 
          fullWidth 
          onClick={onNext}
          disabled={!canProceed}
        >
          Continue
        </Button>
        {!canProceed ? (
          <p className={styles.helperText}>
            Add at least 1 photo to continue
          </p>
        ) : (
          <p className={styles.helperText}>
            {photos.length} / {MAX_PHOTOS} photos added
          </p>
        )}
      </div>
    </div>
  );
};


