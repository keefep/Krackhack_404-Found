# IIT Mandi Marketplace App

A mobile application for IIT Mandi students to buy and sell items within the campus community.

## Project Structure

```
src/
├── assets/         # Images, fonts, and other static assets
├── components/     # Reusable UI components
├── contexts/       # React Context providers
├── navigation/     # Navigation configuration
├── providers/      # App-wide providers and configuration
├── screens/        # Screen components
├── services/       # API and other services
├── theme/          # Theme configuration
├── types/          # TypeScript type definitions
└── utils/         # Utility functions
```

## Key Features

### Authentication
- User registration with email
- Login with email and password
- Password reset functionality
- Persistent authentication state

### Main Features
- Browse products in a grid view
- View detailed product information
- User profile management
- Settings configuration

### UI/UX
- Custom theme with consistent styling
- Loading states and animations
- Error handling and user feedback
- Responsive layout design

### Components
- Custom Button component with variants
- Input fields with validation
- Product cards
- Loading screen with animation
- Card component for layout

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on your device or simulator:
```bash
npm run ios     # for iOS
npm run android # for Android
```

## Technology Stack

- React Native with Expo
- TypeScript for type safety
- React Navigation for routing
- React Native Paper for UI components
- Custom theming system
- Context API for state management

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## Project Status

Currently in development with the following features completed:
- [x] Authentication screens and logic
- [x] Product listing and details
- [x] User profile screen
- [x] Settings screen
- [ ] Search functionality
- [ ] Chat system
- [ ] Product creation
- [ ] Categories implementation
