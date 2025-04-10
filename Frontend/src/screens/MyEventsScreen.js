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
  Alert,
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { colors, baseStyles } from '../utils/styles';
import EventCard from '../components/EventCard';
import { fetchUserEvents, fetchJoinedEvents, logoutUser, deleteEvent } from '../api/api';

const MyEventsScreen = ({ navigation, route }) => {
  const [createdEvents, setCreatedEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('created'); // 'created' or 'joined'
  const [showEventOptions, setShowEventOptions] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Watch for refresh params from navigation
  useEffect(() => {
    if (route.params?.refresh) {
      console.log('Refresh param detected in MyEventsScreen:', route.params.refresh);
      setRefreshing(true);
      loadEvents();
      // Clear the parameter after use to prevent unnecessary refreshes
      navigation.setParams({ refresh: undefined });
    }
  }, [route.params?.refresh]);

  useEffect(() => {
    loadEvents();
    
    // Add listener for navigation focus to refresh events when coming back to this screen
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('MyEventsScreen focused - refreshing events');
      setRefreshing(true);
      loadEvents();
    });

    return unsubscribe;
  }, [navigation]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch created events
      const createdData = await fetchUserEvents();
      
      // Fetch joined events
      const joinedData = await fetchJoinedEvents();
      
      // Sort events by date (newest first)
      const sortedCreatedEvents = createdData.sort((a, b) => new Date(b.date) - new Date(a.date));
      const sortedJoinedEvents = joinedData.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setCreatedEvents(sortedCreatedEvents);
      setJoinedEvents(sortedJoinedEvents);
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

  const handleEventOptions = (event) => {
    setSelectedEvent(event);
    setShowEventOptions(true);
  };

  const handleEditEvent = () => {
    setShowEventOptions(false);
    navigation.navigate('UpdateEvent', { eventId: selectedEvent.ourId, event: selectedEvent });
  };

  const handleDeleteEvent = () => {
    setShowEventOptions(false);
    
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEvent(selectedEvent.ourId);
              
              // Remove the event from the local state
              setCreatedEvents(createdEvents.filter(event => event.ourId !== selectedEvent.ourId));
              
              // Refresh Home screen silently
              navigation.navigate('MainTabs', { 
                screen: 'Home',
                params: { refresh: Date.now() }  
              });
              
              // Navigate back to MyEvents
              navigation.navigate('MainTabs', { screen: 'MyEvents' });
              
              Alert.alert('Success', 'Event deleted successfully');
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert('Error', 'Failed to delete event. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderEventItem = ({ item }) => {
    // Check if this is a created event
    const isCreatedEvent = activeTab === 'created';
    
    return (
      <View style={styles.eventItemContainer}>
        <EventCard
          event={item}
          onPress={() => navigation.navigate('EventDetails', { eventId: item.ourId })}
        />
        
        {isCreatedEvent && (
          <TouchableOpacity 
            style={styles.eventOptionsButton}
            onPress={() => handleEventOptions(item)}
          >
            <Ionicons name="ellipsis-vertical" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderEmptyList = () => {
    const message = activeTab === 'created'
      ? "You haven't created any events yet. Create your first event to see it here."
      : "You haven't joined any events yet. Browse events to find ones you'd like to join.";
    
    const buttonText = activeTab === 'created'
      ? "Create Event"
      : "Browse Events";
    
    const buttonAction = activeTab === 'created'
      ? () => navigation.navigate('Create')
      : () => navigation.navigate('Home');
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={64} color={colors.text.disabled} />
        <Text style={styles.emptyTitle}>No Events Yet</Text>
        <Text style={styles.emptyMessage}>{message}</Text>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={buttonAction}
        >
          <Text style={styles.actionButtonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity 
        style={[
          styles.tab, 
          activeTab === 'created' ? styles.activeTab : null
        ]}
        onPress={() => setActiveTab('created')}
      >
        <Text style={[
          styles.tabText,
          activeTab === 'created' ? styles.activeTabText : null
        ]}>Created</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.tab, 
          activeTab === 'joined' ? styles.activeTab : null
        ]}
        onPress={() => setActiveTab('joined')}
      >
        <Text style={[
          styles.tabText,
          activeTab === 'joined' ? styles.activeTabText : null
        ]}>Joined</Text>
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

  const renderOptionsModal = () => (
    <Modal
      visible={showEventOptions}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowEventOptions(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowEventOptions(false)}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.modalOption}
            onPress={handleEditEvent}
          >
            <Ionicons name="create-outline" size={24} color={colors.text.primary} style={styles.modalIcon} />
            <Text style={styles.modalOptionText}>Edit Event</Text>
          </TouchableOpacity>
          
          <View style={styles.modalDivider} />
          
          <TouchableOpacity 
            style={styles.modalOption}
            onPress={handleDeleteEvent}
          >
            <Ionicons name="trash-outline" size={24} color={colors.error} style={styles.modalIcon} />
            <Text style={[styles.modalOptionText, { color: colors.error }]}>Delete Event</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
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

  const currentEvents = activeTab === 'created' ? createdEvents : joinedEvents;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {renderHeader()}
      {renderTabs()}
      <FlatList
        data={currentEvents}
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
      {renderOptionsModal()}
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  eventItemContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  eventOptionsButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
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
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  actionButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  modalIcon: {
    marginRight: 16,
  },
  modalOptionText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  modalDivider: {
    height: 1,
    backgroundColor: colors.border.default,
  },
});

export default MyEventsScreen; 