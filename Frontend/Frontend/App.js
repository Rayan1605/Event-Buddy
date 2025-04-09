import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './src/utils/styles';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import CreateEventScreen from './src/screens/CreateEventScreen';
import MyEventsScreen from './src/screens/MyEventsScreen';
import EventDetailsScreen from './src/screens/EventDetailsScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

// Create navigation stacks
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Create') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'MyEvents') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border.default,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Create" 
        component={CreateEventScreen} 
        options={{ title: 'Create' }}
      />
      <Tab.Screen 
        name="MyEvents" 
        component={MyEventsScreen} 
        options={{ title: 'My Events' }}
      />
    </Tab.Navigator>
  );
}

// Auth navigator
function AuthNavigator() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// Main app component
export default function App() {
  // For demo purposes, we're setting isAuthenticated to true
  // In a real app, this would be determined by checking if a valid token exists
  const isAuthenticated = true;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator 
          screenOptions={{ 
            headerShown: false
          }}
        >
          {isAuthenticated ? (
            // App screens
            <>
              <Stack.Screen name="MainTabs" component={MainTabNavigator} />
              <Stack.Screen 
                name="EventDetails" 
                component={EventDetailsScreen}
                options={{ 
                  headerShown: false
                }}
              />
            </>
          ) : (
            // Auth screens
            <Stack.Screen name="Auth" component={AuthNavigator} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}