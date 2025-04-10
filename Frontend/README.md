# Event Buddy

A React Native mobile application for managing events, built with Expo and Material UI.

## Features

- View a list of upcoming events
- Create new events with details (title, description, location, date)
- View all events created by the user
- See detailed information about each event
- Modern, polished UI with Material Design components

## Tech Stack

- **React Native** with **Expo** for cross-platform mobile development
- **React Native Paper** for Material Design components
- Custom styling with StyleSheet
- **React Navigation** for navigation management
- **Axios** for API requests
- Reusable components for events display and form handling

## Project Structure

```
src/
├── api/
│   └── api.js          # API service and mock data
├── components/
│   ├── EventCard.js    # Reusable card component for events
│   └── EventForm.js    # Form component for creating/editing events
├── screens/
│   ├── HomeScreen.js          # List of all events
│   ├── CreateEventScreen.js   # Form to create a new event
│   ├── MyEventsScreen.js      # Events created by the user
│   └── EventDetailsScreen.js  # Detailed view of a specific event
└── utils/
    └── styles.js       # Shared styles and theme colors
```

## Setup and Installation

1. Make sure you have Node.js and npm installed
2. Install Expo CLI: `npm install -g expo-cli`
3. Clone this repository
4. Navigate to the project directory and run: `npm install`
5. Start the development server: `npm start`

## Usage

The app has a bottom tab navigation with three main screens:

1. **Home** - Displays all upcoming events
2. **Create** - Form to add a new event
3. **My Events** - Shows events created by the current user

Tapping on any event card will navigate to the event details screen.

## Design System

The app uses a combination of:

- Material Design principles through React Native Paper components
- Custom styling utilities and theme configuration
- Consistent color palette and spacing
- Responsive layouts with flexbox

## Backend Connection

The app is configured to connect to a backend API at `http://localhost:4000/api`.
Currently using mock data for development, but can be easily switched to use real API by uncommenting the relevant code in `src/api/api.js`.

## License

MIT 