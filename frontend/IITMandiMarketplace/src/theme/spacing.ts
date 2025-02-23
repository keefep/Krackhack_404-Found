// Base spacing unit (in pixels)
const baseUnit = 4;

export const spacing = {
  // Core spacing values
  none: 0,
  xs: baseUnit, // 4
  sm: baseUnit * 2, // 8
  md: baseUnit * 4, // 16
  lg: baseUnit * 6, // 24
  xl: baseUnit * 8, // 32
  '2xl': baseUnit * 12, // 48
  '3xl': baseUnit * 16, // 64
  '4xl': baseUnit * 20, // 80
  '5xl': baseUnit * 24, // 96

  // Layout spacing
  layout: {
    screenPadding: baseUnit * 4, // 16
    containerPadding: baseUnit * 5, // 20
    sectionSpacing: baseUnit * 8, // 32
  },

  // Component specific spacing
  components: {
    buttonPadding: baseUnit * 3, // 12
    inputPadding: baseUnit * 4, // 16
    cardPadding: baseUnit * 4, // 16
    listItemPadding: baseUnit * 3, // 12
    iconPadding: baseUnit * 2, // 8
  },

  // Margins
  margin: {
    xs: baseUnit, // 4
    sm: baseUnit * 2, // 8
    md: baseUnit * 4, // 16
    lg: baseUnit * 6, // 24
    xl: baseUnit * 8, // 32
  },

  // Padding
  padding: {
    xs: baseUnit, // 4
    sm: baseUnit * 2, // 8
    md: baseUnit * 4, // 16
    lg: baseUnit * 6, // 24
    xl: baseUnit * 8, // 32
  },

  // Border radius
  radius: {
    none: 0,
    xs: baseUnit, // 4
    sm: baseUnit * 2, // 8
    md: baseUnit * 3, // 12
    lg: baseUnit * 4, // 16
    xl: baseUnit * 6, // 24
    full: 9999,
  },

  // Component heights
  heights: {
    input: baseUnit * 12, // 48
    button: baseUnit * 12, // 48
    listItem: baseUnit * 14, // 56
    header: baseUnit * 14, // 56
    tabBar: baseUnit * 16, // 64
  },

  // Grid system
  grid: {
    gap: baseUnit * 4, // 16
    columnGap: baseUnit * 4, // 16
    rowGap: baseUnit * 4, // 16
  },

  // Z-index levels
  zIndex: {
    base: 0,
    drawer: 100,
    modal: 200,
    snackbar: 300,
    tooltip: 400,
  },
} as const;

export type Spacing = typeof spacing;
