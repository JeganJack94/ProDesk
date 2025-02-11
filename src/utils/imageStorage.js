export const imageStorage = {
  // Get image data from localStorage
  getImage(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  },

  // Delete image from localStorage
  deleteImage(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  },

  // Clear all app images for a user
  clearUserImages(userId) {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`app_image_${userId}_`)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Error clearing images:', error);
      return false;
    }
  }
}; 