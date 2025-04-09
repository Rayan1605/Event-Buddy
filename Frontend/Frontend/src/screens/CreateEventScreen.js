import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  TouchableOpacity
} from 'react-native';
import { colors, baseStyles } from '../utils/styles';
import EventForm from '../components/EventForm';
import { createEvent } from '../api/api';
import { Ionicons } from '@expo/vector-icons';

const CreateEventScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (eventData) => {
    try {
      setLoading(true);
      const newEvent = await createEvent(eventData);
      
      // Show success message
      Alert.alert(
        'Success',
        'Event created successfully!',
        [
          {
            text: 'View Event',
            onPress: () => navigation.navigate('EventDetails', { eventId: newEvent.id }),
          },
          {
            text: 'Create Another',
            onPress: () => navigation.setParams({ refresh: Date.now() }),
            style: 'cancel',
          },
          { 
            text: 'Go to Home',
            onPress: () => navigation.navigate('Home')
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create event. Please try again.');
      console.error('Error creating event:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Event</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="time-outline" size={48} color={colors.primary} />
          <Text style={styles.loadingText}>Creating your event...</Text>
          <Text style={styles.loadingSubtext}>Please wait, this might take a moment.</Text>
        </View>
      ) : (
        <EventForm onSubmit={handleSubmit} />
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
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
});

export default CreateEventScreen; 