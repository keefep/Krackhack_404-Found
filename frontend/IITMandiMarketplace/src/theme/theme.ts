import { ExtendedTheme } from '@react-navigation/native';

export const lightTheme: ExtendedTheme = {
  dark: false,
  colors: {
    primary: '#007AFF',
    background: '#F2F2F7',
    card: '#FFFFFF',
    text: '#000000',
    border: '#C6C6C8',
    notification: '#FF3B30',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
  },
};

export const darkTheme: ExtendedTheme = {
  dark: true,
  colors: {
    primary: '#0A84FF',
    background: '#000000',
    card: '#1C1C1E',
    text: '#FFFFFF',
    border: '#38383A',
    notification: '#FF453A',
    error: '#FF453A',
    success: '#32D74B',
    warning: '#FF9F0A',
  },
};

// Function to get theme based on system preference
export const getTheme = (isDark: boolean): ExtendedTheme => {
  return isDark ? darkTheme : lightTheme;
};
