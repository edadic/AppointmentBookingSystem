# Appointment Booking System

A full-stack web application for managing appointments between customers and businesses. Built with React, Node.js, and MySQL.

## Features

- **User Authentication**
  - Register as a customer or business owner
  - Secure login system
  - Profile management

- **For Customers**
  - Browse available businesses
  - Book appointments with preferred time slots
  - View and manage appointments
  - Receive email notifications for appointment status

- **For Business Owners**
  - Manage store profile and settings
  - Handle appointment requests
  - Set availability schedules
  - View customer appointments

## Tech Stack

### Frontend
- React.js with Vite
- React Router for navigation
- Tailwind CSS for styling
- FullCalendar for appointment scheduling
- Axios for API requests

### Backend
- Node.js
- Express.js
- MySQL with Sequelize ORM
- Nodemailer for email notifications
- JWT for authentication

## Project Structure
```

appointment-booking-system/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service functions
│   │   └── App.jsx       # Main application component
│   └── package.json      # Frontend dependencies
│
└── server/               # Backend Node.js application
├── routes/          # API route definitions
├── controllers/     # Route controllers
├── models/         # Database models
├── utils/          # Utility functions
└── package.json    # Backend dependencies
```
## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL database
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd appointment-booking-system
```
2. Install backend dependencies
```bash
cd server
npm install
```
3. Configure environment variables. Create a .env file in the server directory with the following variables:
```
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASS=your_database_password
DB_HOST=localhost
DB_PORT=3306
JWT_SECRET=your_jwt_secret
EMAIL_HOST=your_smtp_host
EMAIL_PORT=your_smtp_port
EMAIL_USER=your_email_user
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=your_sender_email
```
4. Install frontend dependencies
```bash
cd ../client
npm install
```
### Running the Application
1. Start the backend server
```bash
cd ../server
npm run dev
```
2. Start the frontend application
```bash
cd../client
npm run dev
```
3. Access the application in your browser at http://localhost:5173

## Features in Detail

### Appointment Booking
- Interactive calendar interface
- Real-time availability checking
- Email notifications for booking confirmations
- Appointment status tracking

### User Management
- Store profile customization
- Appointment request handling
- Business hours management
- Customer communication

