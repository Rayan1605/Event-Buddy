import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/styles';
import { getValidImageUrl } from '../utils/imageUtils';

// Default placeholder image URL
const DEFAULT_IMAGE = 'https://placehold.co/600x400?text=Event+Image';

const EventCard = ({ event, onPress }) => {
  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { 
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={styles.card}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: getValidImageUrl(event.image || event.imageUrl) || DEFAULT_IMAGE }} 
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.dateTag}>
        <Text style={styles.dateDay}>
          {new Date(event.date).getDate()}
        </Text>
        <Text style={styles.dateMonth}>
          {new Date(event.date).toLocaleString('default', { month: 'short' })}
        </Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {event.title}
        </Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color={colors.text.secondary} />
          <Text style={styles.infoText}>
            {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color={colors.text.secondary} />
          <Text style={styles.infoText} numberOfLines={1}>
            {event.location}
          </Text>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {event.description}
        </Text>
        
        {event.tags && event.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {event.tags.slice(0, 2).map((tag, index) => (
              <View key={`${tag}-${index}`} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {event.tags.length > 2 && (
              <Text style={styles.moreTags}>+{event.tags.length - 2}</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    height: 150,
    width: '100%',
  },
  dateTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    minWidth: 45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  dateDay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
  },
  dateMonth: {
    fontSize: 12,
    color: colors.text.secondary,
    textTransform: 'uppercase',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 6,
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 8,
    marginBottom: 12,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    fontSize: 12,
    color: colors.primaryDark,
  },
  moreTags: {
    fontSize: 12,
    color: colors.text.secondary,
    alignSelf: 'center',
  }
});

export default EventCard; 