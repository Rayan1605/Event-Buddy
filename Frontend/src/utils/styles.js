import { StyleSheet, Platform } from 'react-native';

// Basic color palette
export const colors = {
  primary: '#6750A4', // Main primary color
  primaryLight: '#D0BCFF',
  primaryDark: '#381E72',
  secondary: '#E8DEF8',
  background: '#F6F5FA',
  surface: '#FFFFFF',
  error: '#B3261E',
  success: '#4CAF50',
  warning: '#FB8C00',
  text: {
    primary: '#1D1B20',
    secondary: '#49454F',
    disabled: '#9E9E9E',
    inverse: '#FFFFFF',
  },
  border: {
    default: '#E0E0E0',
    focused: '#6750A4',
  }
};

// Minimal common styles
export const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: 'row',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border.default,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  textSm: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    fontSize: 16,
    color: colors.text.primary,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.secondary,
    marginBottom: 8,
  },
  inputError: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  formGroup: {
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginVertical: 20,
  },
  spacer: {
    height: 20,
  }
});

// Helper function to combine styles
export const combineStyles = (...styles) => {
  return styles.filter(Boolean);
}; 