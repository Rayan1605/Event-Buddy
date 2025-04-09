import axios from 'axios';

// Create an axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Mock data for events
const mockEvents = [
  {
    id: '1',
    title: 'Tech Conference 2023',
    description: 'Join us for the biggest tech conference of the year featuring talks from industry leaders and workshops on the latest technologies.',
    location: 'San Francisco Convention Center',
    date: new Date(2023, 11, 15, 9, 0).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop',
    organizer: {
      id: '123',
      name: 'Tech Innovators Inc.',
      imageUrl: 'https://randomuser.me/api/portraits/men/42.jpg'
    },
    attendees: 342,
    tags: ['Technology', 'Conference', 'Networking']
  },
  {
    id: '2',
    title: 'Startup Pitch Night',
    description: 'An evening where innovative startups pitch their ideas to potential investors and receive valuable feedback.',
    location: 'Downtown Business Hub',
    date: new Date(2023, 11, 20, 18, 30).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1519834022362-8c5d13254d67?w=800&auto=format&fit=crop',
    organizer: {
      id: '123',
      name: 'Tech Innovators Inc.',
      imageUrl: 'https://randomuser.me/api/portraits/men/42.jpg'
    },
    attendees: 89,
    tags: ['Startups', 'Business', 'Networking']
  },
  {
    id: '3',
    title: 'AI Workshop Series',
    description: 'A hands-on workshop series exploring practical applications of artificial intelligence and machine learning.',
    location: 'Tech Campus Building B',
    date: new Date(2023, 11, 10, 10, 0).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop',
    organizer: {
      id: '456',
      name: 'AI Research Group',
      imageUrl: 'https://randomuser.me/api/portraits/women/32.jpg'
    },
    attendees: 75,
    tags: ['AI', 'Machine Learning', 'Workshop']
  },
  {
    id: '4',
    title: 'Design Systems Meetup',
    description: 'Monthly meetup for designers and developers interested in creating scalable design systems.',
    location: 'Creative Studio Loft',
    date: new Date(2023, 11, 5, 17, 0).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop',
    organizer: {
      id: '789',
      name: 'Design Collective',
      imageUrl: 'https://randomuser.me/api/portraits/women/51.jpg'
    },
    attendees: 42,
    tags: ['Design', 'UX', 'Development']
  },
  {
    id: '5',
    title: 'Mobile App Development Bootcamp',
    description: 'Two-day intensive bootcamp covering the essentials of building mobile applications with modern frameworks.',
    location: 'Developer Academy',
    date: new Date(2023, 11, 18, 9, 0).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop',
    organizer: {
      id: '123',
      name: 'Tech Innovators Inc.',
      imageUrl: 'https://randomuser.me/api/portraits/men/42.jpg'
    },
    attendees: 118,
    tags: ['Mobile', 'Development', 'Bootcamp']
  }
];

// Mock user ID
const MOCK_USER_ID = '123';

// Function to fetch all events
export const fetchEvents = async () => {
  try {
    // In a real app, this would be: const response = await api.get('/events');
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockEvents;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Function to fetch a single event by ID
export const fetchEventById = async (eventId) => {
  try {
    // In a real app, this would be: const response = await api.get(`/events/${eventId}`);
    await new Promise(resolve => setTimeout(resolve, 500));
    const event = mockEvents.find(event => event.id === eventId);
    if (!event) {
      throw new Error('Event not found');
    }
    return event;
  } catch (error) {
    console.error(`Error fetching event with ID ${eventId}:`, error);
    throw error;
  }
};

// Function to fetch events created by a specific user
export const fetchUserEvents = async (userId = MOCK_USER_ID) => {
  try {
    // In a real app, this would be: const response = await api.get(`/events?userId=${userId}`);
    await new Promise(resolve => setTimeout(resolve, 600));
    const userEvents = mockEvents.filter(event => event.organizer.id === userId);
    return userEvents;
  } catch (error) {
    console.error(`Error fetching events for user ${userId}:`, error);
    throw error;
  }
};

// Function to create a new event
export const createEvent = async (eventData) => {
  try {
    // In a real app, this would be: const response = await api.post('/events', eventData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create a new mock event with the provided data
    const newEvent = {
      id: String(mockEvents.length + 1),
      ...eventData,
      organizer: {
        id: MOCK_USER_ID,
        name: 'Tech Innovators Inc.',
        imageUrl: 'https://randomuser.me/api/portraits/men/42.jpg'
      },
      attendees: 0,
      tags: eventData.tags || [],
      imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop'
    };
    
    // In a real app, the new event would be returned from the server
    return newEvent;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Function to fetch popular categories
export const fetchPopularCategories = async () => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return [
      { id: 1, name: 'Technology', icon: 'laptop', color: '#4A90E2', eventCount: 42 },
      { id: 2, name: 'Business', icon: 'briefcase', color: '#50C878', eventCount: 28 },
      { id: 3, name: 'Design', icon: 'palette', color: '#F86624', eventCount: 19 },
      { id: 4, name: 'Marketing', icon: 'chart-line', color: '#8E44AD', eventCount: 15 },
      { id: 5, name: 'Health', icon: 'heart-pulse', color: '#E74C3C', eventCount: 12 }
    ];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Function to login a user (mock implementation)
export const loginUser = async (credentials) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (credentials.email === 'user@example.com' && credentials.password === 'password') {
      return {
        id: MOCK_USER_ID,
        name: 'John Doe',
        email: 'user@example.com',
        token: 'mock-jwt-token'
      };
    } else {
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Function to register a new user (mock implementation)
export const registerUser = async (userData) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Just return a successful response with mock user data
    return {
      id: MOCK_USER_ID,
      name: userData.name,
      email: userData.email,
      token: 'mock-jwt-token'
    };
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export default api; 