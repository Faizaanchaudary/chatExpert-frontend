export const isImage = (path: string | undefined): boolean => {
  if (!path || typeof path !== 'string') return false;

  // Common image extensions
  const imageExtensions = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'bmp',
    'webp',
    'svg',
    'heic',
    'heif',
  ];

  // Extract extension from path
  const extension = path.split('.').pop()?.toLowerCase();
  if (!extension) return false;

  return imageExtensions.includes(extension);
};

export const isVideo = (path: string | undefined): boolean => {
  if (!path || typeof path !== 'string') return false;

  // Common video extensions
  const videoExtensions = [
    'mp4',
    'mov',
    'avi',
    'wmv',
    'flv',
    'mkv',
    'webm',
    'm4v',
    '3gp',
  ];

  // Extract extension from path
  const extension = path.split('.').pop()?.toLowerCase();
  if (!extension) return false;

  return videoExtensions.includes(extension);
};

// Helper to infer MIME type from file extension
export const getMimeType = (filename: string) => {
  const extension = filename.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'mp4':
      return 'video/mp4';
    case 'mp3':
      return 'audio/mpeg';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
};
