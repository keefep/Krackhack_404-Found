# IIT Mandi Campus Marketplace 🏪

A smart and secure buying/selling platform designed specifically for IIT Mandi students and faculty. This AI-powered marketplace revolutionizes informal trading by providing a structured, transparent, and verified platform.

## 🌟 Key Features

### 🛡️ Secure Authentication & User Verification
- IIT Mandi Jwt based auth
- ID card verification system using Pixtral Vision LLM
- Secure JWT token management
- Firebase Authentication integration

### 🔍 Advanced Listing System with AI Search
- Smart category-based segmentation:
  - Books
  - Electronics
  - Services
  - Miscellaneous
- AI-powered semantic search using vector database
- Advanced filtering with price ranges
- Multi-step listing creation with image optimization

### 📢 AI-Enhanced Chat System
- End-to-end encrypted messaging (AES-256)
- AI-powered response suggestions using Mistral-7B LLM
- Secure communication without exposing personal details

### ⭐ Trust & Credibility System
- Dynamic credibility scoring algorithm:
  - Successful transactions: +10 points
  - Positive ratings (>4 stars): +5 points
  - Slow response penalty: -0.5 points
  - Cancellation penalty: -15 points
- Normalized 0-10 scale scoring
- Visual credibility badges
- Transaction history visibility

### 💰 Secure Payments
- UPI payment integration
- Secure refund process
- Transaction status tracking:
  - Pending
  - Completed
  - Refunded

### 🔔 Smart Notifications
- Firebase Cloud Messaging (FCM) for push notifications
- Twilio SMS integration for critical alerts
- Notification triggers:
  - New messages
  - Offers
  - Payment status
  - System alerts

## 🔧 Technical Architecture

### Frontend
- React Native/Flutter for cross-platform mobile app
- Clean and intuitive UI
- Multi-step forms for listings
- Real-time chat interface
- Profile management system

### Backend
FastAPI for high-performance API endpoints
- Firebase services:
  - Authentication
  - Firestore (database)
  - Storage (Image/Video Files)
  - Cloud Messaging (notifications)
- AI/ML components:
  - Pixtral-12B Vision LLM (ID verification)
  - Mistral-7B LLM (chat suggestions)

### Security
- Secure payment processing
- JWT token management
- ID verification pipeline

### Integration Points
- UPI
- Twilio SMS API
- Firebase services
- AI/ML models

## 🚀 Key Objectives

1. Eliminate trust issues in informal trading
2. Provide a secure and verified marketplace
3. Implement AI-driven features for better user experience
4. Ensure secure and convenient payments
5. Maintain user privacy and data security

## 💡 Unique Value Propositions

1. Exclusive to IIT Mandi community
2. AI-powered features for efficiency
3. Strong security measures
4. Integrated payment system
5. Trust-based trading environment

## 🛣️ Future Roadmap

1. Enhanced AI features
2. Additional payment methods
3. Community features
4. Advanced analytics
5. Extended platform integrations

## Tech Stack
1. React Native
2. Node.js
3. Python
4. Fast API
5. Firebase
