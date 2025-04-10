import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Share,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, baseStyles } from '../utils/styles';
import { fetchEventById, joinEvent, leaveEvent } from '../api/api';
import { scheduleEventJoinedNotification } from '../../App';
import { getValidImageUrl } from '../utils/imageUtils';

const DEFAULT_IMAGE = 'https://placehold.co/600x400?text=Event+Image';

const EventDetailsScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!eventId) {
        setError('Event ID is missing');
        return;
      }

      const data = await fetchEventById(eventId);
      const eventData = data.event || data;

      if (eventData) {
        setEvent(eventData);
        setIsRegistered(eventData.isUserRegistered || false);
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

  const handleRegister = async () => {
    if (!event) return;
    try {
      setRegistering(true);
      if (isRegistered) {
        await leaveEvent(eventId);
        Alert.alert('Success', 'You have successfully unregistered from this event.');
        setIsRegistered(false);
      } else {
        await joinEvent(eventId);
        await scheduleEventJoinedNotification(event.title);
        Alert.alert('Success', 'You have successfully registered for this event!');
        setIsRegistered(true);
      }
    } catch (error) {
      Alert.alert(
          'Error',
          `Failed to ${isRegistered ? 'unregister from' : 'register for'} the event. ${error.message || ''}`
      );
    } finally {
      setRegistering(false);
    }
  };

  const handleShare = async () => {
    if (!event) return;
    try {
      await Share.share({
        message: `Check out this event: ${event.title} on ${formatDate(event.date)} at ${event.location}`,
        title: event.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleOpenMaps = () => {
    if (!event?.location) return;
    const query = encodeURIComponent(event.location);
    const mapsUrl = `https://maps.google.com/?q=${query}`;
    Linking.canOpenURL(mapsUrl)
        .then(supported => supported && Linking.openURL(mapsUrl))
        .catch(err => console.error('Error opening maps:', err));
  };

  const formatDate = (dateString) =>
      new Date(dateString).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  const formatTime = (dateString) =>
      new Date(dateString).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });

  if (loading) {
    return (
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading event details...</Text>
          </View>
        </SafeAreaView>
    );
  }

  if (error || !event) {
    return (
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
            <Text style={styles.errorText}>{error || 'Event not found'}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadEvent}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
    );
  }

  return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <Image
              source={{ uri: getValidImageUrl(event.image || event.imageUrl) || DEFAULT_IMAGE }}
              style={styles.coverImage}
              resizeMode="cover"
          />

          <View style={styles.contentContainer}>
            <Text style={styles.title}>{event.title}</Text>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Date</Text>
                  <Text style={styles.infoText}>{formatDate(event.date)}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="time-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Time</Text>
                  <Text style={styles.infoText}>{formatTime(event.date)}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.infoRow} onPress={handleOpenMaps}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="location-outline" size={24} color={colors.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoText}>{event.location}</Text>
                </View>
                <Ionicons name="open-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About this event</Text>
              <Text style={styles.description}>{event.description}</Text>
            </View>

            {event.organizer && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Organizer</Text>
                  <View style={styles.organizerRow}>
                    <Image
                        source={{ uri: getValidImageUrl(event.organizerImage) || DEFAULT_IMAGE }}
                        style={styles.organizerImage}
                        resizeMode="cover"
                    />
                    <View style={styles.organizerInfo}>
                      <Text style={styles.organizerName}>{event.organizer.name || event.organizer}</Text>
                      <Text style={styles.organizerRole}>{event.organizerEmail || 'Event Host'}</Text>
                    </View>
                  </View>
                </View>
            )}

            {event.tags?.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Tags</Text>
                  <View style={styles.tagsContainer}>
                    {event.tags.map((tag, i) => (
                        <View key={i} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                  </View>
                </View>
            )}

            <TouchableOpacity
                style={[
                  styles.registerButton,
                  isRegistered && styles.unregisterButton,
                  registering && styles.disabledButton,
                ]}
                onPress={handleRegister}
                disabled={registering}
            >
              {registering ? (
                  <ActivityIndicator color={colors.text.inverse} size="small" />
              ) : (
                  <Text style={styles.registerButtonText}>
                    {isRegistered ? 'Unregister from Event' : 'Register for Event'}
                  </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // === Container & Layout ===
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  // === Header ===
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // === Images ===
  coverImage: {
    width: '100%',
    height: 240,
  },
  organizerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },

  // === Titles & Text ===
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text.secondary,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  organizerRole: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  tagText: {
    fontSize: 14,
    color: colors.primaryDark,
  },
  registerButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text.secondary,
  },
  errorText: {
    marginTop: 12,
    marginBottom: 24,
    fontSize: 16,
    color: colors.text.primary,
    textAlign: 'center',
  },
  retryButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },

  // === Cards & Info Rows ===
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // === Buttons ===
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  unregisterButton: {
    backgroundColor: colors.error,
  },
  disabledButton: {
    opacity: 0.7,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  tag: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },

  // === State Screens ===
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});
export default EventDetailsScreen;
