/**
 * Image optimization utilities
 */

import { projectId } from './supabase/info';

/**
 * Get optimized image URL with Supabase transforms
 */
export function getOptimizedImageUrl(
  imageUrl: string | null | undefined,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}
): string {
  if (!imageUrl) {
    return '/Bonded_transparent_icon.png';
  }

  // If it's already a Supabase storage URL, add transform params
  if (imageUrl.includes('supabase.co/storage')) {
    const params = new URLSearchParams();
    if (options.width) params.append('width', options.width.toString());
    if (options.height) params.append('height', options.height.toString());
    if (options.quality) params.append('quality', options.quality.toString());
    if (options.format) params.append('format', options.format);

    const separator = imageUrl.includes('?') ? '&' : '?';
    return `${imageUrl}${separator}${params.toString()}`;
  }

  // If it's a data URL or external URL, return as-is
  if (imageUrl.startsWith('data:') || imageUrl.startsWith('http')) {
    return imageUrl;
  }

  // Default fallback
  return imageUrl;
}

/**
 * Get profile picture with optimization
 */
export function getProfilePictureUrl(
  profilePicture: string | null | undefined,
  size: 'small' | 'medium' | 'large' = 'medium'
): string {
  const sizes = {
    small: { width: 100, height: 100 },
    medium: { width: 400, height: 400 },
    large: { width: 800, height: 800 },
  };

  return getOptimizedImageUrl(profilePicture, {
    ...sizes[size],
    quality: 80,
    format: 'webp',
  });
}

/**
 * Get photo URL with optimization
 */
export function getPhotoUrl(
  photoUrl: string | null | undefined,
  size: 'thumbnail' | 'medium' | 'large' = 'medium'
): string {
  const sizes = {
    thumbnail: { width: 200, height: 200 },
    medium: { width: 600, height: 600 },
    large: { width: 1200, height: 1200 },
  };

  return getOptimizedImageUrl(photoUrl, {
    ...sizes[size],
    quality: 85,
    format: 'webp',
  });
}

/**
 * Lazy load image component props
 */
export function getLazyImageProps(src: string, alt: string = '') {
  return {
    src,
    alt,
    loading: 'lazy' as const,
    decoding: 'async' as const,
    onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
      (e.target as HTMLImageElement).src = '/Bonded_transparent_icon.png';
    },
  };
}







