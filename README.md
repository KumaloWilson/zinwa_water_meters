# ZINWA Water Meter System

A comprehensive prepaid water meter management system for the Zimbabwe National Water Authority (ZINWA). This system consists of a robust Express.js backend API and a Flutter mobile application that allows customers to manage their water accounts, purchase tokens, and monitor consumption.

![ZINWA Logo](https://via.placeholder.com/200x100/0066CC/FFFFFF?text=ZINWA)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Mobile App Setup](#mobile-app-setup)
- [Usage Examples](#usage-examples)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [Support](#support)
- [License](#license)

## 🌟 Overview

The ZINWA Water Meter System is a modern, scalable solution designed to digitize water meter management for Zimbabwe's water authority. The system enables customers to:

- Register and manage their water accounts
- Purchase prepaid water tokens online
- Monitor water consumption and balance
- View payment history and receipts
- Receive notifications about account activities

Administrators can:
- Manage customer accounts and properties
- Set water rates and pricing
- Monitor system-wide analytics
- Generate comprehensive reports
- Handle customer support requests

## ✨ Features

### 🔐 Authentication & User Management
- **Multi-role Authentication**: Customer, Admin, and Super Admin roles
- **Secure Registration**: Email verification and password strength validation
- **Password Recovery**: Forgot password functionality with email reset links
- **Profile Management**: Update personal information and preferences
- **Session Management**: JWT-based authentication with refresh tokens

### 🏠 Property Management
- **Property Registration**: Support for multiple property types (residential, commercial, industrial)
- **Property Verification**: Admin approval process for new properties
- **Multiple Properties**: Customers can manage multiple properties
- **Property Details**: Comprehensive property information including location data
- **Meter Association**: Link water meters to specific properties

### 💰 Payment & Token System
- **Paynow Integration**: Seamless integration with Zimbabwe's Paynow payment gateway
- **Multiple Payment Methods**: Support for various payment options
- **Token Generation**: Automatic generation of prepaid water tokens
- **Token Validation**: Secure token verification system
- **Payment History**: Comprehensive transaction records
- **Receipt Generation**: Digital receipts for all transactions

### 📊 Meter Reading & Consumption
- **Real-time Monitoring**: Track water consumption in real-time
- **Historical Data**: Access to historical consumption patterns
- **Balance Tracking**: Monitor remaining water balance
- **Usage Analytics**: Detailed consumption analytics and trends
- **Low Balance Alerts**: Automatic notifications for low balance

### 💵 Rate Management
- **Dynamic Pricing**: Flexible rate structures for different property types
- **Seasonal Rates**: Support for time-based rate changes
- **Minimum Charges**: Configurable minimum monthly charges
- **Bulk Discounts**: Volume-based pricing tiers

### 📱 Mobile Application Features
- **Intuitive UI/UX**: Modern, user-friendly interface
- **Offline Support**: Limited functionality available offline
- **Push Notifications**: Real-time alerts and updates
- **Biometric Authentication**: Fingerprint and face recognition support
- **Dark Mode**: Support for light and dark themes
- **Multi-language**: Support for English and local languages

### 📈 Analytics & Reporting
- **Customer Dashboard**: Personal consumption and payment analytics
- **Admin Dashboard**: System-wide statistics and insights
- **Revenue Reports**: Detailed financial reporting
- **Usage Reports**: Consumption pattern analysis
- **Export Functionality**: Export data to various formats (PDF, Excel, CSV)

### 🔔 Notification System
- **Email Notifications**: Automated email alerts for important events
- **Push Notifications**: Mobile app notifications
- **SMS Integration**: SMS alerts for critical notifications
- **Notification Preferences**: Customizable notification settings

## 🛠 Technology Stack

### Backend (API Server)
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Sequelize with TypeScript
- **Authentication**: JWT (JSON Web Tokens)
- **Caching**: Redis
- **Payment Gateway**: Paynow Zimbabwe
- **Email Service**: Nodemailer
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston
- **Testing**: Jest
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting

### Mobile Application
- **Framework**: Flutter (v3.16+)
- **Language**: Dart
- **State Management**: GetX
- **Architecture**: MVC+S (Model-View-Controller-Service)
- **HTTP Client**: Dio
- **Local Storage**: GetStorage
- **Charts**: FL Chart
- **Icons**: Lucide Icons
- **Animations**: Flutter Animations
- **Platform**: iOS & Android

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL 14+
- **Cache**: Redis
- **Web Server**: Nginx (for production)
- **SSL**: Let's Encrypt
- **Monitoring**: Winston Logging
- **Version Control**: Git

## 🏗 Architecture

### System Architecture
\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Flutter App   │    │   Admin Panel   │    │   Web Portal    │
│   (Mobile)      │    │   (Web)         │    │   (Customer)    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴───────────┐
                    │     Load Balancer       │
                    │      (Nginx)            │
                    └─────────────┬───────────┘
                                 │
                    ┌─────────────┴───────────┐
                    │   Express.js API        │
                    │   (Node.js/TypeScript)  │
                    └─────────────┬───────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
┌─────────┴───────┐    ┌─────────┴───────┐    ┌─────────┴───────┐
│   PostgreSQL    │    │     Redis       │    │   Paynow API    │
│   (Database)    │    │    (Cache)      │    │   (Payments)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
\`\`\`

### Mobile App Architecture (MVC+S)
\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                        Views (UI)                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │   Login     │ │  Dashboard  │ │   Payment   │    ...    │
│  │    View     │ │    View     │ │    View     │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                    Controllers                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │    Auth     │ │  Dashboard  │ │   Payment   │    ...    │
│  │ Controller  │ │ Controller  │ │ Controller  │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                     Services                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │    Auth     │ │    User     │ │   Payment   │    ...    │
│  │   Service   │ │   Service   │ │   Service   │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                     Models                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │    User     │ │  Property   │ │   Payment   │    ...    │
│  │   Model     │ │   Model     │ │   Model     │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## 🚀 Installation

### Prerequisites

#### Backend Requirements
- Node.js (v18.0.0 or higher)
- PostgreSQL (v14.0 or higher)
- Redis (v6.0 or higher)
- Git

#### Mobile App Requirements
- Flutter SDK (v3.16.0 or higher)
- Dart SDK (v3.2.0 or higher)
- Android Studio / Xcode
- Android SDK / iOS SDK

### Backend Installation

1. **Clone the Repository**
   \`\`\`bash
   git clone https://github.com/kumalowilson/zinwa_water_meters.git
   cd water-meter-system
   \`\`\`

2. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Configuration**
   \`\`\`bash
   cp .env.example .env
   # Edit .env file with your configuration
   nano .env
   \`\`\`

4. **Database Setup**
   \`\`\`bash
   # Create PostgreSQL database
   createdb zinwa_water_meters
   
   # Run migrations
   npm run migrate
   
   # Seed database (optional)
   npm run seed
   \`\`\`

5. **Start Redis Server**
   \`\`\`bash
   redis-server
   \`\`\`

6. **Start Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

The API server will be available at `http://localhost:5000`

### Mobile App Installation

1. **Navigate to Mobile App Directory**
   \`\`\`bash
   cd mobile_app
   \`\`\`

2. **Install Flutter Dependencies**
   \`\`\`bash
   flutter pub get
   \`\`\`

3. **Configure API Endpoint**
   \`\`\`dart
   // lib/utils/constants.dart
   class Constants {
     static const String apiBaseUrl = 'http://your-api-server:5000/api';
     // ... other configurations
   }
   \`\`\`

4. **Run the Application**
   \`\`\`bash
   # For Android
   flutter run

   # For iOS
   flutter run --device-id=<ios-device-id>

   # For specific device
   flutter devices  # List available devices
   flutter run -d <device-id>
   \`\`\`

### Docker Installation (Recommended for Production)

1. **Using Docker Compose**
   \`\`\`bash
   # Clone repository
   git clone [https://github.com/zinwa/water-meter-system.git](https://github.com/kumalowilson/zinwa_water_meters.git)
   cd water-meter-system

   # Copy environment file
   cp .env.example .env
   # Edit .env with your production values

   # Start all services
   docker-compose up -d

   # View logs
   docker-compose logs -f

   # Stop services
   docker-compose down
   \`\`\`

2. **Individual Docker Commands**
   \`\`\`bash
   # Build backend image
   docker build -t zinwa-backend .

   # Run PostgreSQL
   docker run -d --name zinwa-postgres \
     -e POSTGRES_DB=zinwa_water_meters \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=your_password \
     -p 5432:5432 postgres:14-alpine

   # Run Redis
   docker run -d --name zinwa-redis \
     -p 6379:6379 redis:alpine

   # Run backend
   docker run -d --name zinwa-backend \
     --link zinwa-postgres:postgres \
     --link zinwa-redis:redis \
     -p 5000:5000 \
     --env-file .env \
     zinwa-backend
   \`\`\`

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the root directory:

\`\`\`bash
# Server Configuration
PORT=5000
NODE_ENV=production
LOG_LEVEL=info
CORS_ORIGIN=https://your-frontend-domain.com
SEED_DB=false

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password
DB_NAME=zinwa_water_meters

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=noreply@zinwa.co.zw

# Paynow Integration
PAYNOW_INTEGRATION_ID=your_paynow_integration_id
PAYNOW_INTEGRATION_KEY=your_paynow_integration_key
PAYNOW_URL=https://www.paynow.co.zw/interface/initiatetransaction
PAYNOW_RETURN_URL=https://your-domain.com/payment/return
PAYNOW_RESULT_URL=https://your-api-domain.com/api/payments/update

# Frontend URL
FRONTEND_URL=https://your-frontend-domain.com
\`\`\`

### Mobile App Configuration

Update the constants file:

\`\`\`dart
// lib/utils/constants.dart
class Constants {
  // API Configuration
  static const String apiBaseUrl = 'https://your-api-domain.com/api';
  static const Duration apiTimeout = Duration(seconds: 30);
  
  // Storage Keys
  static const String tokenKey = 'auth_token';
  static const String userKey = 'user_data';
  static const String themeKey = 'theme_mode';
  
  // App Configuration
  static const String appName = 'ZINWA Water Meter';
  static const String appVersion = '1.0.0';
  static const bool isDevelopment = false; // Set to false for production
  
  // Paynow Configuration
  static const String paynowReturnUrl = 'https://your-domain.com/payment/return';
  
  // Support
  static const String supportEmail = 'support@zinwa.co.zw';
  static const String supportPhone = '+263-4-791631';
}
\`\`\`

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new customer account.

**Request Body:**
\`\`\`json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+263771234567",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification.",
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "customer"
    },
    "token": "jwt_token_here"
  }
}
\`\`\`

#### POST /api/auth/login
Authenticate user and get access token.

**Request Body:**
\`\`\`json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "customer"
    },
    "token": "jwt_token_here"
  }
}
\`\`\`

#### POST /api/auth/forgot-password
Request password reset link.

**Request Body:**
\`\`\`json
{
  "email": "john.doe@example.com"
}
\`\`\`

### Property Endpoints

#### GET /api/properties
Get user's properties.

**Headers:**
\`\`\`
Authorization: Bearer jwt_token_here
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "propertyNumber": "PROP001",
      "address": "123 Main Street, Harare",
      "propertyType": "residential_low_density",
      "meterNumber": "MTR001",
      "balance": 45.50,
      "status": "active"
    }
  ]
}
\`\`\`

#### POST /api/properties
Register a new property.

**Request Body:**
\`\`\`json
{
  "propertyNumber": "PROP002",
  "address": "456 Oak Avenue, Bulawayo",
  "propertyType": "residential_high_density",
  "meterNumber": "MTR002"
}
\`\`\`

### Payment Endpoints

#### POST /api/payments/purchase-token
Purchase water token.

**Request Body:**
\`\`\`json
{
  "propertyId": "property_uuid",
  "amount": 50.00,
  "paymentMethod": "paynow"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "paymentId": "payment_uuid",
    "redirectUrl": "https://paynow.co.zw/payment/...",
    "pollUrl": "https://paynow.co.zw/interface/remotetransaction"
  }
}
\`\`\`

#### GET /api/payments/history
Get payment history.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `startDate`: Filter from date (YYYY-MM-DD)
- `endDate`: Filter to date (YYYY-MM-DD)

### Dashboard Endpoints

#### GET /api/dashboard/customer
Get customer dashboard data.

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "totalProperties": 2,
    "totalBalance": 125.75,
    "monthlyConsumption": 15.5,
    "recentPayments": [...],
    "recentReadings": [...],
    "notifications": [...]
  }
}
\`\`\`

For complete API documentation, visit: `http://your-api-domain.com/api-docs`

## 📱 Mobile App Setup

### Development Setup

1. **Install Flutter**
   \`\`\`bash
   # macOS
   brew install flutter

   # Or download from https://flutter.dev/docs/get-started/install
   \`\`\`

2. **Verify Installation**
   \`\`\`bash
   flutter doctor
   \`\`\`

3. **IDE Setup**
   - **VS Code**: Install Flutter and Dart extensions
   - **Android Studio**: Install Flutter and Dart plugins

4. **Device Setup**
   \`\`\`bash
   # Enable developer options on Android device
   # Or start iOS simulator
   flutter devices
   \`\`\`

### Building for Production

#### Android APK
\`\`\`bash
# Build APK
flutter build apk --release

# Build App Bundle (recommended for Play Store)
flutter build appbundle --release
\`\`\`

#### iOS IPA
\`\`\`bash
# Build for iOS
flutter build ios --release

# Archive in Xcode for App Store submission
\`\`\`

### App Signing

#### Android
1. Create keystore:
   \`\`\`bash
   keytool -genkey -v -keystore ~/zinwa-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias zinwa
   \`\`\`

2. Configure in `android/app/build.gradle`:
   \`\`\`gradle
   android {
       ...
       signingConfigs {
           release {
               keyAlias keystoreProperties['keyAlias']
               keyPassword keystoreProperties['keyPassword']
               storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
               storePassword keystoreProperties['storePassword']
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
           }
       }
   }
   \`\`\`

#### iOS
Configure signing in Xcode with your Apple Developer account.

## 💡 Usage Examples

### Customer Workflow

1. **Registration & Login**
   \`\`\`dart
   // Register new account
   await authController.register(
     firstName: 'John',
     lastName: 'Doe',
     email: 'john@example.com',
     password: 'SecurePass123!',
   );

   // Login
   await authController.login(
     email: 'john@example.com',
     password: 'SecurePass123!',
   );
   \`\`\`

2. **Property Management**
   \`\`\`dart
   // Add new property
   await propertyController.addProperty(
     propertyNumber: 'PROP001',
     address: '123 Main St',
     propertyType: PropertyType.residentialLowDensity,
     meterNumber: 'MTR001',
   );

   // Get properties
   await propertyController.fetchProperties();
   \`\`\`

3. **Token Purchase**
   \`\`\`dart
   // Purchase token
   await paymentController.purchaseToken(
     propertyId: 'property-uuid',
     amount: 50.0,
   );
   \`\`\`

### Admin Workflow

1. **User Management**
   \`\`\`bash
   # Get all users
   GET /api/admin/users

   # Update user status
   PATCH /api/admin/users/:id/status
   \`\`\`

2. **Rate Management**
   \`\`\`bash
   # Set new rates
   POST /api/admin/rates
   {
     "propertyType": "residential_low_density",
     "rate": 2.50,
     "minimumCharge": 10.00,
     "effectiveDate": "2024-01-01"
   }
   \`\`\`

## 🗄 Database Schema

### Core Tables

#### Users Table
\`\`\`sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'customer',
    status user_status DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### Properties Table
\`\`\`sql
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    property_number VARCHAR(50) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    property_type property_type NOT NULL,
    meter_number VARCHAR(50) UNIQUE NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0.00,
    status property_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### Payments Table
\`\`\`sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    property_id UUID REFERENCES properties(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method payment_method NOT NULL,
    status payment_status DEFAULT 'pending',
    reference VARCHAR(100) UNIQUE,
    paynow_reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

#### Tokens Table
\`\`\`sql
CREATE TABLE tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES payments(id),
    property_id UUID REFERENCES properties(id),
    token_value VARCHAR(20) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    units DECIMAL(10,2) NOT NULL,
    status token_status DEFAULT 'available',
    expires_at TIMESTAMP,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

### Entity Relationships

\`\`\`
Users (1) ──── (N) Properties
Properties (1) ──── (N) Payments
Payments (1) ──── (1) Tokens
Properties (1) ──── (N) MeterReadings
Users (1) ──── (N) Notifications
Properties (1) ──── (N) Rates
\`\`\`

## 🚀 Deployment

### Backend Deployment

#### Using Docker (Recommended)

1. **Production Docker Compose**
   \`\`\`yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "5000:5000"
       environment:
         - NODE_ENV=production
       env_file:
         - .env.production
       depends_on:
         - postgres
         - redis
       restart: unless-stopped

     postgres:
       image: postgres:14-alpine
       environment:
         POSTGRES_DB: ${DB_NAME}
         POSTGRES_USER: ${DB_USERNAME}
         POSTGRES_PASSWORD: ${DB_PASSWORD}
       volumes:
         - postgres_data:/var/lib/postgresql/data
       restart: unless-stopped

     redis:
       image: redis:alpine
       volumes:
         - redis_data:/data
       restart: unless-stopped

     nginx:
       image: nginx:alpine
       ports:
         - "80:80"
         - "443:443"
       volumes:
         - ./nginx.conf:/etc/nginx/nginx.conf
         - ./ssl:/etc/nginx/ssl
       depends_on:
         - app
       restart: unless-stopped

   volumes:
     postgres_data:
     redis_data:
   \`\`\`

2. **Deploy to Production**
   \`\`\`bash
   # Build and deploy
   docker-compose -f docker-compose.prod.yml up -d

   # Monitor logs
   docker-compose -f docker-compose.prod.yml logs -f
   \`\`\`

#### Manual Deployment

1. **Server Setup (Ubuntu 20.04+)**
   \`\`\`bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PostgreSQL
   sudo apt install postgresql postgresql-contrib

   # Install Redis
   sudo apt install redis-server

   # Install PM2 for process management
   sudo npm install -g pm2
   \`\`\`

2. **Application Deployment**
   \`\`\`bash
   # Clone repository
   git clone https://github.com/zinwa/water-meter-system.git
   cd water-meter-system

   # Install dependencies
   npm ci --production

   # Build application
   npm run build

   # Setup environment
   cp .env.example .env.production
   # Edit .env.production with production values

   # Run migrations
   NODE_ENV=production npm run migrate

   # Start with PM2
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   \`\`\`

3. **Nginx Configuration**
   \`\`\`nginx
   server {
       listen 80;
       server_name your-domain.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name your-domain.com;

       ssl_certificate /path/to/ssl/cert.pem;
       ssl_certificate_key /path/to/ssl/private.key;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   \`\`\`

### Mobile App Deployment

#### Google Play Store

1. **Prepare Release**
   \`\`\`bash
   # Update version in pubspec.yaml
   version: 1.0.0+1

   # Build app bundle
   flutter build appbundle --release
   \`\`\`

2. **Upload to Play Console**
   - Create app listing
   - Upload app bundle
   - Complete store listing
   - Submit for review

#### Apple App Store

1. **Prepare Release**
   \`\`\`bash
   # Update version in pubspec.yaml
   version: 1.0.0+1

   # Build iOS
   flutter build ios --release
   \`\`\`

2. **Archive in Xcode**
   - Open `ios/Runner.xcworkspace`
   - Archive for distribution
   - Upload to App Store Connect

#### Enterprise Distribution

For internal distribution:

\`\`\`bash
# Android APK
flutter build apk --release

# iOS IPA (requires enterprise certificate)
flutter build ios --release
\`\`\`

## 🧪 Testing

### Backend Testing

1. **Unit Tests**
   \`\`\`bash
   # Run all tests
   npm test

   # Run with coverage
   npm run test:coverage

   # Run specific test file
   npm test -- --testPathPattern=auth.test.js
   \`\`\`

2. **Integration Tests**
   \`\`\`bash
   # Run integration tests
   npm run test:integration

   # Test specific endpoint
   npm run test:integration -- --grep "POST /api/auth/login"
   \`\`\`

3. **API Testing with Postman**
   - Import Postman collection from `/docs/postman/`
   - Set environment variables
   - Run automated tests

### Mobile App Testing

1. **Unit Tests**
   \`\`\`bash
   # Run unit tests
   flutter test

   # Run with coverage
   flutter test --coverage
   \`\`\`

2. **Widget Tests**
   \`\`\`bash
   # Run widget tests
   flutter test test/widget_test.dart
   \`\`\`

3. **Integration Tests**
   \`\`\`bash
   # Run integration tests
   flutter drive --target=test_driver/app.dart
   \`\`\`

4. **Device Testing**
   \`\`\`bash
   # Test on connected device
   flutter run --debug

   # Test on specific device
   flutter run -d <device-id>
   \`\`\`

### Test Coverage

Maintain minimum test coverage:
- Backend: 80%
- Mobile App: 70%

## 🤝 Contributing

We welcome contributions to the ZINWA Water Meter System! Please follow these guidelines:

### Development Workflow

1. **Fork the Repository**
   \`\`\`bash
   git clone https://github.com/your-username/zinwa-water-meter-system.git
   cd zinwa-water-meter-system
   \`\`\`

2. **Create Feature Branch**
   \`\`\`bash
   git checkout -b feature/your-feature-name
   \`\`\`

3. **Make Changes**
   - Follow coding standards
   - Add tests for new features
   - Update documentation

4. **Commit Changes**
   \`\`\`bash
   git add .
   git commit -m "feat: add new feature description"
   \`\`\`

5. **Push and Create PR**
   \`\`\`bash
   git push origin feature/your-feature-name
   # Create pull request on GitHub
   \`\`\`

### Coding Standards

#### Backend (TypeScript/Node.js)
- Use ESLint and Prettier
- Follow TypeScript strict mode
- Write comprehensive JSDoc comments
- Use meaningful variable names
- Follow RESTful API conventions

#### Mobile App (Flutter/Dart)
- Follow Dart style guide
- Use meaningful widget names
- Implement proper error handling
- Follow GetX patterns
- Write widget tests

### Commit Message Convention

Use conventional commits:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

### Code Review Process

1. All changes require pull request
2. At least one reviewer approval
3. All tests must pass
4. Code coverage requirements met
5. Documentation updated

## 🔧 Troubleshooting

### Common Backend Issues

#### Database Connection Issues
\`\`\`bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U postgres -d zinwa_water_meters

# Reset database
npm run migrate:reset
npm run migrate
npm run seed
\`\`\`

#### Redis Connection Issues
\`\`\`bash
# Check Redis status
redis-cli ping

# Restart Redis
sudo systemctl restart redis

# Clear Redis cache
redis-cli FLUSHALL
\`\`\`

#### JWT Token Issues
\`\`\`bash
# Verify JWT secret is set
echo $JWT_SECRET

# Check token expiration
# Tokens expire based on JWT_EXPIRES_IN setting
\`\`\`

### Common Mobile App Issues

#### Build Issues
\`\`\`bash
# Clean build
flutter clean
flutter pub get

# Clear cache
flutter pub cache repair

# Update dependencies
flutter pub upgrade
\`\`\`

#### API Connection Issues
\`\`\`dart
// Check API endpoint in constants.dart
static const String apiBaseUrl = 'http://your-correct-api-url:5000/api';

// Enable network permissions in AndroidManifest.xml
<uses-permission android:name="android.permission.INTERNET" />
\`\`\`

#### State Management Issues
\`\`\`dart
// Ensure GetX controllers are properly initialized
Get.put(YourController());

// Check if services are registered
Get.find<YourService>();
\`\`\`

### Performance Issues

#### Backend Performance
\`\`\`bash
# Monitor API response times
# Check database query performance
# Optimize slow queries
# Implement caching where appropriate
\`\`\`

#### Mobile App Performance
\`\`\`bash
# Profile app performance
flutter run --profile

# Check for memory leaks
flutter run --debug
# Use Flutter Inspector
\`\`\`

### Debugging

#### Backend Debugging
\`\`\`bash
# Enable debug logging
LOG_LEVEL=debug npm run dev

# Use Node.js debugger
node --inspect src/app.ts
\`\`\`

#### Mobile App Debugging
\`\`\`bash
# Debug mode
flutter run --debug

# Verbose logging
flutter run --verbose
\`\`\`

## 📞 Support

### Getting Help

- **Documentation**: Check this README and API docs
- **Issues**: Create GitHub issue for bugs
- **Discussions**: Use GitHub discussions for questions
- **Email**: support@zinwa.co.zw

### Contact Information

- **Technical Support**: tech-support@zinwa.co.zw
- **Business Inquiries**: info@zinwa.co.zw
- **Emergency**: +263-4-791631

### Support Hours

- **Business Hours**: Monday - Friday, 8:00 AM - 5:00 PM CAT
- **Emergency Support**: 24/7 for critical issues
- **Response Time**: 
  - Critical: 2 hours
  - High: 8 hours
  - Medium: 24 hours
  - Low: 72 hours

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Third-Party Licenses

- **Express.js**: MIT License
- **Flutter**: BSD 3-Clause License
- **PostgreSQL**: PostgreSQL License
- **Redis**: BSD 3-Clause License

## 🙏 Acknowledgments

- Zimbabwe National Water Authority (ZINWA)
- Paynow Zimbabwe for payment integration
- Flutter and Node.js communities
- All contributors and testers

## 📈 Roadmap

### Version 2.0 (Q2 2024)
- [ ] Real-time meter reading integration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Offline mode for mobile app
- [ ] Bulk payment processing

### Version 3.0 (Q4 2024)
- [ ] IoT meter integration
- [ ] Machine learning consumption predictions
- [ ] Advanced reporting features
- [ ] Customer portal web application
- [ ] API rate limiting improvements

---

**Built with ❤️ for Zimbabwe National Water Authority**
