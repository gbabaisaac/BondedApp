import { useState, useEffect, useRef } from 'react';
import { X, Image as ImageIcon, Smile, Send, XCircle } from 'lucide-react';
import { useAccessToken } from '../store/useAppStore';
import { uploadMedia } from '../utils/api-client';
import { toast } from 'sonner';
import imageCompression from 'browser-image-compression';

interface PostComposerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPost?: (content: string, isAnonymous: boolean, mediaUrls?: string[]) => void;
}

export function PostComposerDialog({ isOpen, onClose, onPost }: PostComposerDialogProps) {
  const accessToken = useAccessToken();
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ file: File; preview: string; type: 'image' | 'video' } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setContent('');
      setIsAnonymous(false);
      setSelectedMedia(null);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      toast.error('Please select an image or video file');
      return;
    }

    // Validate file size (before compression)
    const maxSize = isImage ? 10 * 1024 * 1024 : 50 * 1024 * 1024; // 10MB images, 50MB videos
    if (file.size > maxSize) {
      toast.error(`File is too large. Max size: ${isImage ? '10MB' : '50MB'}`);
      return;
    }

    let processedFile = file;

    // Compress images before upload
    if (isImage) {
      try {
        const options = {
          maxSizeMB: 2, // Compress to max 2MB
          maxWidthOrHeight: 1920, // Max dimension
          useWebWorker: true,
          fileType: file.type,
        };
        processedFile = await imageCompression(file, options);
        toast.success(`Image compressed from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(processedFile.size / 1024 / 1024).toFixed(2)}MB`);
      } catch (error) {
        logger.error('Image compression error:', error);
        toast.warning('Could not compress image, uploading original');
        processedFile = file;
      }
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedMedia({
        file: processedFile,
        preview: reader.result as string,
        type: isImage ? 'image' : 'video',
      });
    };
    reader.readAsDataURL(processedFile);
  };

  const handleRemoveMedia = () => {
    setSelectedMedia(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePost = async () => {
    if (!content.trim() && !selectedMedia) {
      toast.error('Please add some content or media to your post');
      return;
    }

    let mediaUrls: string[] = [];

    // Upload media if selected
    if (selectedMedia && accessToken) {
      try {
        setUploading(true);
        const result = await uploadMedia(selectedMedia.file, accessToken);
        mediaUrls = [result.url];
      } catch (error: unknown) {
        const err = error as Error;
        logger.error('Failed to upload media:', err);
        toast.error(err.message || 'Failed to upload media');
        setUploading(false);
        return;
      }
    }

    onPost?.(content, isAnonymous, mediaUrls.length > 0 ? mediaUrls : undefined);
    // Don't close here - let parent handle it
    setContent('');
    setIsAnonymous(false);
    setSelectedMedia(null);
    setUploading(false);
  };

  return (
    <div 
      className="fixed inset-0 flex items-end"
      style={{ 
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 10000,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
      onClick={onClose}
    >
      <div 
        className="w-full bg-white shadow-2xl"
        style={{ 
          maxHeight: '75vh',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between border-b"
          style={{ 
            borderColor: '#E8E8F0',
            padding: '16px 20px',
          }}
        >
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" style={{ color: '#2D2D2D' }} />
          </button>
          <h2 
            className="text-base font-bold"
            style={{ 
              fontFamily: "'Inter', sans-serif",
              fontSize: '16px',
              fontWeight: 700,
              color: '#2D2D2D',
            }}
          >
            Create Post
          </h2>
          <button
            onClick={handlePost}
            disabled={(!content.trim() && !selectedMedia) || uploading}
            className="px-4 py-1.5 rounded-lg font-semibold transition-all disabled:cursor-not-allowed"
            style={{ 
              background: (content.trim() || selectedMedia) && !uploading
                ? 'linear-gradient(135deg, #FF6B6B, #A78BFA)' 
                : '#E8E8F0',
              color: (content.trim() || selectedMedia) && !uploading ? 'white' : '#9B9B9B',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '8px',
              opacity: (content.trim() || selectedMedia) && !uploading ? 1 : 0.6,
            }}
          >
            {uploading ? 'Uploading...' : 'Post'}
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full resize-none focus:outline-none"
            style={{ 
              color: '#2D2D2D',
              fontFamily: "'Inter', sans-serif",
              fontSize: '15px',
              lineHeight: '1.6',
              minHeight: '200px',
              background: 'transparent',
            }}
            autoFocus
          />
          <style>{`
            textarea::placeholder {
              color: #9B9B9B;
              font-family: 'Inter', sans-serif;
              font-size: 15px;
            }
          `}</style>

          {/* Media Preview */}
          {selectedMedia && (
            <div className="mt-4 relative rounded-xl overflow-hidden" style={{ borderRadius: '12px' }}>
              {selectedMedia.type === 'image' ? (
                <img 
                  src={selectedMedia.preview} 
                  alt="Preview" 
                  className="w-full max-h-64 object-cover"
                />
              ) : (
                <video 
                  src={selectedMedia.preview} 
                  controls
                  className="w-full max-h-64"
                />
              )}
              <button
                onClick={handleRemoveMedia}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
                style={{ borderRadius: '50%' }}
              >
                <XCircle className="w-5 h-5 text-white" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="flex items-center justify-between border-t"
          style={{ 
            borderColor: '#E8E8F0',
            padding: '12px 20px',
          }}
        >
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaSelect}
              className="hidden"
              id="post-media-upload"
            />
            <label
              htmlFor="post-media-upload"
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
              style={{ 
                borderRadius: '8px',
              }}
            >
              <ImageIcon className="w-5 h-5" style={{ color: '#6B6B6B' }} />
            </label>
            <button 
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              style={{ 
                borderRadius: '8px',
              }}
            >
              <Smile className="w-5 h-5" style={{ color: '#6B6B6B' }} />
            </button>
          </div>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer"
              style={{ 
                accentColor: '#FF6B6B',
              }}
            />
            <span 
              className="text-sm font-semibold"
              style={{ 
                color: '#6B6B6B',
                fontFamily: "'Inter', sans-serif",
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              Post Anonymously
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}


