import React, { useState } from 'react';
import { 
  View, 
  Text,
  TextInput,
  ScrollView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { colors, baseStyles } from '../utils/styles';
import * as ImagePicker from 'expo-image-picker';

const EventForm = ({ onSubmit, initialValues = {} }) => {
  const [title, setTitle] = useState(initialValues.title || '');
  const [description, setDescription] = useState(initialValues.description || '');
  const [location, setLocation] = useState(initialValues.location || '');
  const [date, setDate] = useState(initialValues.date ? new Date(initialValues.date) : new Date());
  const [imageUri, setImageUri] = useState(initialValues.imageUrl || initialValues.image || null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Form validation states
  const [titleError, setTitleError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [locationError, setLocationError] = useState('');
  
  // Track if the image is from a remote URL
  const [isRemoteImage, setIsRemoteImage] = useState(
    !!initialValues.image || !!initialValues.imageUrl
  );
  
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
    
    // Handle image differently based on whether it's from a remote URL or local uri
    if (imageUri) {
      if (isRemoteImage && imageUri === (initialValues.image || initialValues.imageUrl)) {
        // If using the original remote image, preserve it
        if (initialValues.image) {
          eventData.image = initialValues.image;
        } else {
          eventData.imageUrl = initialValues.imageUrl;
        }
        // Also preserve the filename if available
        if (initialValues.imageFilename) {
          eventData.imageFilename = initialValues.imageFilename;
        }
      } else {
        // If using a newly selected image
        eventData.imageUri = imageUri;
      }
    } else {
      // No image selected
      eventData.imageUrl = 'https://placehold.co/600x400?text=No+Image';
    }
    
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

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permission to upload an image.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setIsRemoteImage(false); // New image selected is not remote
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera permission to take a photo.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
        setIsRemoteImage(false); // New photo taken is not remote
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
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
          <View style={[
            styles.inputContainer, 
            styles.textAreaContainer,
            descriptionError ? styles.inputContainerError : null
          ]}>
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

        <View style={styles.formGroup}>
          <Text style={styles.label}>Event Image</Text>
          
          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => setImageUri(null)}
              >
                <Ionicons name="close-circle" size={24} color={colors.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={48} color={colors.text.secondary} />
              <Text style={styles.imagePlaceholderText}>No image selected</Text>
            </View>
          )}
          
          <View style={styles.imageButtonsContainer}>
            <TouchableOpacity 
              style={[styles.imageButton, { marginRight: 8 }]} 
              onPress={pickImage}
            >
              <Ionicons name="images-outline" size={20} color={colors.text.inverse} style={{ marginRight: 8 }} />
              <Text style={styles.imageButtonText}>Pick from Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.imageButton} 
              onPress={takePhoto}
            >
              <Ionicons name="camera-outline" size={20} color={colors.text.inverse} style={{ marginRight: 8 }} />
              <Text style={styles.imageButtonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>
            {initialValues._id || initialValues.id || initialValues.ourId ? 'Update Event' : 'Create Event'}
          </Text>
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
  textAreaContainer: {
    height: 120,
    alignItems: 'flex-start',
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
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
  },
  imagePlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePlaceholderText: {
    color: colors.text.secondary,
    marginTop: 8,
    fontSize: 14,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageButtonText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: '500',
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