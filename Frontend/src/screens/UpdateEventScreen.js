import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { colors, baseStyles } from '../utils/styles';
import EventForm from '../components/EventForm';
import { updateEvent, fetchEventById } from '../api/api';
import { Ionicons } from '@expo/vector-icons';

const UpdateEventScreen = ({ route, navigation }) => {
  const { eventId, event: initialEventData } = route.params;
  const [event, setEvent] = useState(initialEventData || null);
  const [loading, setLoading] = useState(!initialEventData);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!initialEventData) {
      loadEvent();
    }
  }, [initialEventData, eventId]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const eventData = await fetchEventById(eventId);
      if (eventData) {
        setEvent(eventData.event || eventData);
      } else {
        setError('Event not found');
      }
    } catch (err) {
      console.error('Error loading event:', err);
      setError('Failed to load event details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (eventData) => {
    try {
      setUpdating(true);
      
      // If no new image is selected, preserve the existing image
      if (!eventData.imageUri && event) {
        // Keep the existing image information
        eventData.imageUrl = event.image || event.imageUrl;
        eventData.imageFilename = event.imageFilename;
      }
      
      await updateEvent(eventId, eventData);
      
      // Show success message
      Alert.alert(
        'Success',
        'Event updated successfully!',
        [
          {
            text: 'View Event',
            onPress: () => {
              // Refresh Home screen first
              navigation.navigate('MainTabs', { 
                screen: 'Home',
                params: { refresh: Date.now() }  
              });
              
              // Small delay to allow refresh
              setTimeout(() => {
                navigation.navigate('EventDetails', { eventId });
              }, 100);
            },
          },
          { 
            text: 'Back to My Events',
            onPress: () => {
              // Refresh Home screen silently
              navigation.navigate('MainTabs', { 
                screen: 'Home',
                params: { refresh: Date.now() }  
              });
              
              // Then go to MyEvents
              navigation.navigate('MainTabs', { screen: 'MyEvents' });
            }
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update event. Please try again.');
      console.error('Error updating event:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Event</Text>
        <View style={styles.placeholder} />
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadEvent}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : updating ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="time-outline" size={48} color={colors.primary} />
          <Text style={styles.loadingText}>Updating your event...</Text>
          <Text style={styles.loadingSubtext}>Please wait, this might take a moment.</Text>
        </View>
      ) : (
        <EventForm 
          onSubmit={handleSubmit}
          initialValues={event}
        />
      )}
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
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  backButton: {
    padding: 4,
  },
  placeholder: {
    width: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
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
});

export default UpdateEventScreen; 