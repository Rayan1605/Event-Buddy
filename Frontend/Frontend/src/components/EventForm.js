import React, { useState } from 'react';
import { 
  View, 
  Text,
  TextInput,
  ScrollView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { colors, baseStyles } from '../utils/styles';

const EventForm = ({ onSubmit, initialValues = {} }) => {
  const [title, setTitle] = useState(initialValues.title || '');
  const [description, setDescription] = useState(initialValues.description || '');
  const [location, setLocation] = useState(initialValues.location || '');
  const [date, setDate] = useState(initialValues.date ? new Date(initialValues.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Form validation states
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [locationError, setLocationError] = useState('');
  
  const validateForm = () => {
    let isValid = true;
    
    if (!title.trim()) {
      setTitleError('Please enter an event title');
      isValid = false;
    } else {
      setTitleError('');
    }
    
    if (!description.trim()) {
      setDescriptionError('Please enter an event description');
      isValid = false;
    } else {
      setDescriptionError('');
    }
    
    if (!location.trim()) {
      setLocationError('Please enter an event location');
      isValid = false;
    } else {
      setLocationError('');
    }
    
    return isValid;
  };

  const handleSubmit = () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    // Create event object and pass to parent component
    const eventData = {
      title,
      description,
      location,
      date: date.toISOString(),
    };
    
    onSubmit(eventData);
  };

  const formatDate = (date) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString(undefined, options);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Event Title</Text>
          <View style={[styles.inputContainer, titleError ? styles.inputContainerError : null]}>
            <Ionicons name="create-outline" size={22} color={colors.text.secondary} style={styles.inputIcon} />
            <TextInput
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (text.trim()) setTitleError('');
              }}
              style={styles.input}
              placeholder="Enter event title"
              placeholderTextColor={colors.text.disabled}
            />
          </View>
          {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <View style={[styles.inputContainer, descriptionError ? styles.inputContainerError : null]}>
            <Ionicons 
              name="document-text-outline" 
              size={22} 
              color={colors.text.secondary} 
              style={[styles.inputIcon, { alignSelf: 'flex-start', marginTop: 12 }]} 
            />
            <TextInput
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (text.trim()) setDescriptionError('');
              }}
              style={[styles.input, styles.textArea]}
              placeholder="Enter event description"
              placeholderTextColor={colors.text.disabled}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>
          {descriptionError ? <Text style={styles.errorText}>{descriptionError}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Location</Text>
          <View style={[styles.inputContainer, locationError ? styles.inputContainerError : null]}>
            <Ionicons name="location-outline" size={22} color={colors.text.secondary} style={styles.inputIcon} />
            <TextInput
              value={location}
              onChangeText={(text) => {
                setLocation(text);
                if (text.trim()) setLocationError('');
              }}
              style={styles.input}
              placeholder="Enter location"
              placeholderTextColor={colors.text.disabled}
            />
          </View>
          {locationError ? <Text style={styles.errorText}>{locationError}</Text> : null}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Date & Time</Text>
          <TouchableOpacity 
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={22} color={colors.text.secondary} />
            <Text style={styles.dateText}>{formatDate(date)}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.text.secondary} />
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="datetime"
              display="default"
              onChange={onDateChange}
            />
          )}
        </View>

        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Create Event</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    height: 50,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  inputIcon: {
    marginHorizontal: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: colors.text.primary,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    marginLeft: 12,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  submitButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  }
});

export default EventForm; 