# ZINWA Water Meter System - Backend

A robust Express.js backend for the Zimbabwe National Water Authority (ZINWA) prepaid water meter management system. This system allows customers to register, manage properties, purchase water tokens, and view consumption history. Administrators can manage properties, users, rates, and view comprehensive analytics.

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Usage Examples](#usage-examples)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

### User Management
- Customer registration and authentication
- Admin and super admin roles with different permissions
- Profile management and password reset functionality
- Email notifications for account actions

### Property Management
- Support for different property types (residential low/high density, commercial, etc.)
- Property-to-owner mapping
- Comprehensive property details including location data

### Token/Payment System
- Paynow Zimbabwe integration for online payments
- Token generation and verification
- Support for manual payments by admins
- Complete payment history

### Meter Reading Management
- Track water consumption
- Calculate remaining balance
- Historical consumption data

### Rate Management
- Different pricing for different property types
- Time-based rate changes
- Support for fixed charges and minimum charges

### Dashboard APIs
- Customer dashboard with property and consumption data
- Admin dashboard with revenue and system-wide analytics
- Comprehensive reporting capabilities

### Security Features
- JWT authentication
- Role-based access control
- Rate limiting to prevent abuse
- Data validation and sanitization

## Technology Stack

- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT (JSON Web Tokens)
- **Payment Gateway**: Paynow Zimbabwe
- **Caching**: Redis
- **Documentation**: Swagger
- **Logging**: Winston
- **Email**: Nodemailer

## Installation

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- Redis

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/zinwa-water-meters.git
   cd zinwa-water-meters

