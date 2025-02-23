export const colors = {
  // Primary colors
  primary: {
    main: '#2563EB', // Modern blue
    light: '#60A5FA',
    dark: '#1E40AF',
    contrast: '#FFFFFF',
  },

  // Secondary colors
  secondary: {
    main: '#10B981', // Fresh mint
    light: '#34D399',
    dark: '#059669',
    contrast: '#FFFFFF',
  },

  // Semantic colors
  success: {
    main: '#22C55E',
    light: '#4ADE80',
    dark: '#16A34A',
    contrast: '#FFFFFF',
  },
  error: {
    main: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
    contrast: '#FFFFFF',
  },
  warning: {
    main: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
    contrast: '#FFFFFF',
  },
  info: {
    main: '#3B82F6',
    light: '#60A5FA',
    dark: '#2563EB',
    contrast: '#FFFFFF',
  },

  // Neutral colors
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // Background colors
  background: {
    default: '#FFFFFF',
    paper: '#F8FAFC',
    dark: '#0F172A',
  },

  // Text colors
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    disabled: '#94A3B8',
    hint: '#64748B',
    contrast: '#FFFFFF',
  },

  // Border colors
  border: {
    light: '#E2E8F0',
    main: '#CBD5E1',
    dark: '#94A3B8',
  },

  // Action colors
  action: {
    active: '#2563EB',
    hover: 'rgba(37, 99, 235, 0.04)',
    selected: 'rgba(37, 99, 235, 0.08)',
    disabled: 'rgba(37, 99, 235, 0.26)',
    disabledBackground: 'rgba(37, 99, 235, 0.12)',
  },

  // Gradient definitions
  gradients: {
    primary: ['#2563EB', '#60A5FA'],
    secondary: ['#10B981', '#34D399'],
    success: ['#22C55E', '#4ADE80'],
    error: ['#EF4444', '#F87171'],
    warning: ['#F59E0B', '#FBBF24'],
    info: ['#3B82F6', '#60A5FA'],
  },
} as const;

export type Colors = typeof colors;
