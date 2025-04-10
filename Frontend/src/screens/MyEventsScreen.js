import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { colors, baseStyles } from '../utils/styles';
import EventCard from '../components/EventCard';
import { fetchUserEvents, logoutUser } from '../api/api';

const MyEventsScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Dummy user ID for demonstration
  const userId = '123';

  useEffect(() => {
    loadEvents();
    
    // Add listener for navigation focus to refresh events when coming back to this screen
    const unsubscribe = navigation.addListener('focus', () => {
      loadEvents();
    });

    return unsubscribe;
  }, [navigation]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchUserEvents(userId);
      
      // Sort events by date (newest first)
      const sortedEvents = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setEvents(sortedEvents);
    } catch (err) {
      setError('Failed to load your events. Please try again.');
      console.error('Error loading user events:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              // Call logout API
              await logoutUser();
              
              // Clear local storage
              await AsyncStorage.removeItem('isLoggedIn');
              await AsyncStorage.removeItem('userEmail');
              
              // Navigate to Auth screen
              navigation.navigate('Auth');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderEventItem = ({ item }) => (
    <EventCard
      event={item}
      onPress={() => navigation.navigate('EventDetails', { eventId: item.ourId })}
    />
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={64} color={colors.text.disabled} />
      <Text style={styles.emptyTitle}>No Events Yet</Text>
      <Text style={styles.emptyMessage}>
        You haven't created any events yet. Create your first event to see it here.
      </Text>
      <TouchableOpacity 
        style={styles.createEventButton}
        onPress={() => navigation.navigate('Create')}
      >
        <Text style={styles.createEventButtonText}>Create Event</Text>
      </TouchableOpacity>
    </View>
  );

  // Add a renderHeader function that includes a logout button
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>My Events</Text>
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your events...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadEvents}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {renderHeader()}
      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={(item) => item.ourId || item.id || item._id || String(Math.random())}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh} 
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 12,
    marginBottom: 24,
    fontSize: 16,
    color: colors.text.primary,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  createEventButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createEventButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
});

export default MyEventsScreen; 