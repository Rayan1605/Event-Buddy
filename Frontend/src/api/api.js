// Define the API base URL
const API_BASE_URL = 'http://54.158.84.177:3010';  // Make sure this matches your backend port (was 3010 in app.js)

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

// Function to create a new event
export const createEvent = async (eventData) => {
  try {
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
  logoutUser
}; 