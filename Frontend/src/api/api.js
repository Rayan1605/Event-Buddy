// Define the API base URL
const API_BASE_URL = 'http://192.168.1.100:3010';  // Make sure this matches your backend port (was 3010 in app.js)

// Helper function to handle API responses
const handleResponse = async (response) => {
  try {
    const data = await response.json();
    
    if (!response.ok) {
      const error = (data && data.message) || response.statusText;
      return Promise.reject(error);
    }
    
    return data;
  } catch (error) {
    console.error('Error parsing response:', error, 'Status:', response.status, 'Text:', await response.text());
    throw new Error(`Failed to parse response: ${error.message}`);
  }
};

// Mock user ID
const MOCK_USER_ID = '123';

// Function to fetch all events
export const fetchEvents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Function to fetch a single event by ID
export const fetchEventById = async (eventId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/getSpecificEvent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Include cookies for session-based auth
      body: JSON.stringify({ ourId: eventId })
    });
    
    const data = await handleResponse(response);
    if (!data) {
      throw new Error('Event not found');
    }
    
    return data.event || data;
  } catch (error) {
    console.error(`Error fetching event with ID ${eventId}:`, error);
    throw error;
  }
};

// Function to fetch events created by the logged-in user
export const fetchUserEvents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/myCreatedEvents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Include cookies for session-based auth
    });
    
    const data = await handleResponse(response);
    return data.createdEvents || [];
  } catch (error) {
    console.error(`Error fetching user events:`, error);
    throw error;
  }
};

// Function to fetch events joined by the logged-in user
export const fetchJoinedEvents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/myJoinedEvents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Include cookies for session-based auth
    });
    
    const data = await handleResponse(response);
    return data.joinedEvents || [];
  } catch (error) {
    console.error(`Error fetching joined events:`, error);
    throw error;
  }
};

// Function to upload an image
export const uploadImage = async (imageUri) => {
  if (!imageUri) return null;
  
  try {
    // Create FormData object
    const formData = new FormData();
    
    // Get the filename from the URI
    const filename = imageUri.split('/').pop();
    
    // Infer image mime type
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    // Prepare the image file object
    const imageFile = {
      uri: imageUri,
      name: filename,
      type: type
    };
    
    // Append the image to the form data
    formData.append('image', imageFile);
    
    // Send the request
    const response = await fetch(`${API_BASE_URL}/upload-image`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        // NOTE: Do not set Content-Type header with FormData
      },
      credentials: 'include' // Include cookies for session-based auth
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Function to create a new event
export const createEvent = async (eventData) => {
  try {
    // Check if there's an image to upload first
    if (eventData.imageUri) {
      try {
        // Upload the image and get the URL
        const uploadResult = await uploadImage(eventData.imageUri);
        
        if (uploadResult && uploadResult.success) {
          // Replace the local image URI with the server URL
          eventData.imageUrl = uploadResult.imageUrl;
          eventData.imageFilename = uploadResult.filename;
          
          // Remove the temporary imageUri field
          delete eventData.imageUri;
        }
      } catch (uploadError) {
        console.error('Failed to upload image:', uploadError);
        // Continue with event creation even if image upload fails
      }
    }
    
    const response = await fetch(`${API_BASE_URL}/addEvent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Include cookies for session-based auth
      body: JSON.stringify(eventData)
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Function to leave an event
export const leaveEvent = async (eventId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/leaveEvent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Include cookies for session-based auth
      body: JSON.stringify({ ourId: eventId })
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Error leaving event:', error);
    throw error;
  }
};

// Function to join an event
export const joinEvent = async (eventId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/joinEvent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Include cookies for session-based auth
      body: JSON.stringify({ ourId: eventId })
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Error joining event:', error);
    throw error;
  }
};

// Function to get sorted events
export const fetchSortedEvents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/sortedEvents`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await handleResponse(response);
    return data.events || [];
  } catch (error) {
    console.error('Error fetching sorted events:', error);
    throw error;
  }
};

// Function to login a user
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/signin?email=${encodeURIComponent(credentials.email)}&pass=${encodeURIComponent(credentials.password)}`, 
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include cookies for session-based auth
      }
    );
    
    const data = await handleResponse(response);
    
    if (!data.success) {
      throw new Error(data.message || 'Login failed');
    }
    
    // Return a standardized user object
    return {
      success: true,
      email: credentials.email,
      isLoggedIn: data.login
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Function to register a new user
export const registerUser = async (userData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/signup?email=${encodeURIComponent(userData.email)}&pass=${encodeURIComponent(userData.password)}`, 
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    const data = await handleResponse(response);
    
    if (!data.success) {
      throw new Error(data.message || 'Registration failed');
    }
    
    // Return a standardized user object
    return {
      success: true,
      email: userData.email
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Function to logout a user
export const logoutUser = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/signout`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // Include cookies for session-based auth
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Function to update an event
export const updateEvent = async (eventId, eventData) => {
  try {
    // First, ensure the event data has all needed fields
    if (!eventData || !eventId) {
      throw new Error('Missing event data or ID');
    }
    
    // Create a copy of the event data to avoid modifying the original
    const updatedEventData = { ...eventData };
    
    // Upload the image if there's a new one
    if (updatedEventData.imageUri) {
      try {
        const uploadResult = await uploadImage(updatedEventData.imageUri);
        if (uploadResult && uploadResult.success) {
          updatedEventData.imageUrl = uploadResult.imageUrl;
          updatedEventData.imageFilename = uploadResult.filename;
          delete updatedEventData.imageUri;
        }
      } catch (uploadError) {
        console.error('Failed to upload image:', uploadError);
        // Continue with event update even if image upload fails
      }
    } else {
      // If no imageUri is provided, ensure we keep the existing imageUrl if specified
      if (!updatedEventData.imageUrl) {
        // If neither imageUri nor imageUrl is provided, the existing image on the server
        // will be preserved due to the way the backend update function works
        console.log('No new image provided, preserving existing image');
      }
    }
    
    // Make the API call to update the event
    const response = await fetch(`${API_BASE_URL}/updateSpecificEvent?ourId=${eventId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Include cookies for session-based auth
      body: JSON.stringify(updatedEventData)
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Function to delete an event
export const deleteEvent = async (eventId) => {
  try {
    if (!eventId) {
      throw new Error('Missing event ID');
    }
    
    const response = await fetch(`${API_BASE_URL}/deleteSpecificEvent?ourId=${eventId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Include cookies for session-based auth
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Export a default object with all the functions for easier imports
export default {
  fetchEvents,
  fetchEventById,
  fetchUserEvents,
  fetchJoinedEvents,
  createEvent,
  leaveEvent,
  joinEvent,
  fetchSortedEvents,
  loginUser,
  registerUser,
  logoutUser,
  updateEvent,
  deleteEvent
}; 