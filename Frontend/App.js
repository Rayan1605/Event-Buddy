import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Alert, Platform } from 'react-native';
import { colors } from './src/utils/styles';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import CreateEventScreen from './src/screens/CreateEventScreen';
import MyEventsScreen from './src/screens/MyEventsScreen';
import EventDetailsScreen from './src/screens/EventDetailsScreen';
import UpdateEventScreen from './src/screens/UpdateEventScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';

// Navigation stacks
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator();

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowAlert: true,
  }),
});

// Exported notification functions
export const scheduleEventCreationNotification = async (eventTitle) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Event Created!',
      body: `You've successfully created "${eventTitle}"`,
      data: { screen: 'MyEvents', eventName: eventTitle },
    },
    trigger: { seconds: 1 },
  });
};

export const scheduleEventJoinedNotification = async (eventTitle) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Event Joined!',
      body: `You've successfully joined "${eventTitle}"`,
      data: { screen: 'MyEvents', eventName: eventTitle },
    },
    trigger: { seconds: 1 },
  });
};

// Main tab navigator
function MainTabNavigator() {
  return (
      <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
              else if (route.name === 'Create') iconName = focused ? 'add-circle' : 'add-circle-outline';
              else if (route.name === 'MyEvents') iconName = focused ? 'calendar' : 'calendar-outline';
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
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
        <Tab.Screen name="Create" component={CreateEventScreen} options={{ title: 'Create' }} />
        <Tab.Screen name="MyEvents" component={MyEventsScreen} options={{ title: 'My Events' }} />
      </Tab.Navigator>
  );
}

// Auth navigator
function AuthNavigator() {
  return (
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="Register" component={RegisterScreen} />
      </AuthStack.Navigator>
  );
}

// App component
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigationRef = useRef(null);

  useEffect(() => {
    const configurePushNotifications = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      if (finalStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
            'Permission required',
            'Push notifications need the appropriate permissions.'
        );
        return;
      }

      const projectId = '5bf477e8-879d-482d-80a6-bed006373484';
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
        console.log('Expo push token:', tokenData.data);
      } catch (error) {
        console.error('Error getting push token:', error);
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }

      const sub1 = Notifications.addNotificationReceivedListener((notification) => {
        console.log('NOTIFICATION RECEIVED');
        const eventName = notification.request.content.data.eventName;
        console.log('Event:', eventName);
      });

      const sub2 = Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('NOTIFICATION RESPONSE RECEIVED');
        const screen = response.notification.request.content.data.screen;
        if (screen && navigationRef.current) {
          navigationRef.current.navigate(screen);
        }
      });

      return () => {
        sub1.remove();
        sub2.remove();
      };
    };

    const checkAuthStatus = async () => {
      try {
        setIsAuthenticated(false);
        await AsyncStorage.removeItem('isLoggedIn');
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    configurePushNotifications();
    checkAuthStatus();
  }, []);

  if (isLoading) return null;

  return (
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef}>
          <StatusBar style="auto" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="Auth" component={AuthNavigator} />
            <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
            <Stack.Screen name="UpdateEvent" component={UpdateEventScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
  );
}
