/**
 * Service for sharing and exporting content
 */

// Share content via Web Share API (if available)
export const shareContent = async (title, text, url = window.location.href) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url
      });
      return true;
    } catch (error) {
      console.error('Error sharing content:', error);
      return false;
    }
  }
  return false;
};

// Create a social sharing URL for Twitter
export const getTwitterShareUrl = (text, url = window.location.href) => {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);
  return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
};

// Create a social sharing URL for LinkedIn
export const getLinkedInShareUrl = (title, summary, url = window.location.href) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedSummary = encodeURIComponent(summary);
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedSummary}`;
};

// Create a social sharing URL for Facebook
export const getFacebookShareUrl = (url = window.location.href) => {
  const encodedUrl = encodeURIComponent(url);
  return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
};

// Open a popup window for sharing
export const openSharePopup = (url, width = 600, height = 400) => {
  // Prevent errors in environments where window is not available
  if (typeof window === 'undefined') return;
  
  try {
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    const options = `width=${width},height=${height},left=${left},top=${top},location=0,menubar=0,toolbar=0,status=0,scrollbars=1,resizable=1`;
    
    window.open(url, 'share', options);
  } catch (error) {
    console.error('Error opening share popup:', error);
  }
};