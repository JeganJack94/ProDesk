export const fileStorage = {
  // Save file to localStorage
  saveFile: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        try {
          const fileName = `file_${Date.now()}_${file.name}`;
          localStorage.setItem(fileName, reader.result);
          resolve({
            name: file.name,
            url: fileName,
            type: file.type,
            size: file.size
          });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
    });
  },

  // Get file from localStorage
  getFile: (fileName) => {
    const fileData = localStorage.getItem(fileName);
    return fileData || null;
  },

  // Delete file from localStorage
  deleteFile: (fileName) => {
    localStorage.removeItem(fileName);
  }
}; 