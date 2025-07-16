import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { 
  shareContent, 
  getTwitterShareUrl, 
  getLinkedInShareUrl, 
  getFacebookShareUrl,
  openSharePopup
} from '../services/shareService';

const { FiShare2, FiTwitter, FiLinkedin, FiFacebook, FiMail, FiCopy, FiCheck } = FiIcons;

const ShareButtons = ({ title, text, url = window.location.href }) => {
  const [copied, setCopied] = React.useState(false);
  
  const handleNativeShare = async () => {
    const shared = await shareContent(title, text, url);
    if (!shared) {
      // Fallback to copy to clipboard
      handleCopyLink();
    }
  };
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };
  
  const handleTwitterShare = () => {
    const twitterUrl = getTwitterShareUrl(`${title}\n\n${text.slice(0, 100)}...`, url);
    openSharePopup(twitterUrl);
  };
  
  const handleLinkedInShare = () => {
    const linkedInUrl = getLinkedInShareUrl(title, text.slice(0, 250), url);
    openSharePopup(linkedInUrl);
  };
  
  const handleFacebookShare = () => {
    const facebookUrl = getFacebookShareUrl(url);
    openSharePopup(facebookUrl);
  };
  
  const handleEmailShare = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${text}\n\n${url}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };
  
  return (
    <div className="inline-flex space-x-2">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleNativeShare}
        className="p-2 bg-purple-600 rounded-full text-white"
        title="Share"
      >
        <SafeIcon icon={FiShare2} />
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleTwitterShare}
        className="p-2 bg-blue-400 rounded-full text-white"
        title="Share on Twitter"
      >
        <SafeIcon icon={FiTwitter} />
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleLinkedInShare}
        className="p-2 bg-blue-700 rounded-full text-white"
        title="Share on LinkedIn"
      >
        <SafeIcon icon={FiLinkedin} />
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleFacebookShare}
        className="p-2 bg-blue-600 rounded-full text-white"
        title="Share on Facebook"
      >
        <SafeIcon icon={FiFacebook} />
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleEmailShare}
        className="p-2 bg-gray-600 rounded-full text-white"
        title="Share via Email"
      >
        <SafeIcon icon={FiMail} />
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleCopyLink}
        className="p-2 bg-gray-700 rounded-full text-white"
        title={copied ? "Copied!" : "Copy Link"}
      >
        <SafeIcon icon={copied ? FiCheck : FiCopy} />
      </motion.button>
    </div>
  );
};

export default ShareButtons;