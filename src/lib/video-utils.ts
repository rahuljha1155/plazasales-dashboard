export const isYouTubeUrl = (url: string): boolean => {
  const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
  return pattern.test(url);
};

export const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!isYouTubeUrl(url)) return null;
  
  // Handle youtu.be short URLs
  const shortUrlMatch = url.match(/youtu\.be\/([^\s&]+)/);
  if (shortUrlMatch) {
    return `https://www.youtube.com/embed/${shortUrlMatch[1]}`;
  }
  
  // Handle regular YouTube URLs with v parameter
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  return match && match[2].length === 11 
    ? `https://www.youtube.com/embed/${match[2]}`
    : null;
};
