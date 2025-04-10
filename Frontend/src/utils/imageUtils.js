// Default placeholder image URL if an image is missing
export const DEFAULT_IMAGE = 'https://placehold.co/600x400?text=Event+Image';

/**
 * Returns a valid image URL or a default placeholder if the provided URL is invalid
 * @param {string} imageUrl - The image URL to validate
 * @returns {string} - A valid image URL
 */
export const getValidImageUrl = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
    return DEFAULT_IMAGE;
  }
  
  // Check if the image URL is valid (starts with http:// or https://)
  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    return DEFAULT_IMAGE;
  }
  
  return imageUrl;
};

/**
 * Prepares image data for uploading
 * @param {string} uri - The local image URI
 * @returns {Object} - Prepared image data for upload
 */
export const prepareImageForUpload = (uri) => {
  if (!uri) return null;
  
  // Extract filename from URI
  const filename = uri.split('/').pop();
  
  // Infer the type of the image from the extension
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';
  
  return {
    uri,
    name: filename,
    type
  };
};

/**
 * Uploads an image to the server
 * @param {string} imageUri - The local URI of the image to upload
 * @param {string} apiBaseUrl - The base URL of the API
 * @returns {Promise<Object>} - Promise that resolves to the uploaded image data
 */
export const uploadImageToServer = async (imageUri, apiBaseUrl) => {
  if (!imageUri) return null;
  
  try {
    // Create FormData object
    const formData = new FormData();
    
    // Prepare image file for upload
    const imageFile = prepareImageForUpload(imageUri);
    formData.append('image', imageFile);
    
    // Send the request to the server
    const response = await fetch(`${apiBaseUrl}/upload-image`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        // Don't set Content-Type header when using FormData
      },
      credentials: 'include', // Include cookies for auth
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload image');
    }
    
    return data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}; 