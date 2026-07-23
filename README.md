# Celiac Disease Management Platform

A comprehensive digital platform for managing and coordinating the follow-up of patients with celiac disease. The application serves multiple stakeholders including patients, doctors, associations, and health authorities.

## Features

- **User Authentication & Authorization**: JWT-based authentication with refresh tokens and Role-Based Access Control (RBAC)
- **Patient Disease Declaration**: Patients can submit disease declarations for validation
- **Electronic Medical Records**: Doctors can create and update medical records; patients can view their own
- **Role-Based Dashboards**: Customized dashboards for each user role
- **E-Commerce Shop**: Online store for gluten-free products with cart and ordering system
- **Order Management**: Complete order workflow from cart to delivery
- **Appointment System**: Patients can book consultations with doctors, doctors manage their schedules
- **Doctor Profile Management**: Doctors can complete their profile and set their location on a map
- **Secretary Management**: Doctors can add secretaries to manage their appointments
- **Notifications System**: Targeted notifications by role and region
- **Surveys & Feedback**: System for conducting surveys and collecting satisfaction feedback
- **Statistics & Reports**: Anonymized statistics for decision-making
- **Audit Logging**: Comprehensive audit trail for all sensitive actions
- **Mobile Application**: React Native mobile app for iOS and Android

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication (access + refresh tokens)
- bcrypt, helmet, rate limiting
- Audit logging

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts for statistics visualization
- Axios for API calls

## Project Structure

```
.
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth, validation, audit middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── server.js        # Entry point
│   └── package.json
│
├── frontend/
│   ├── app/             # Next.js App Router pages
│   ├── components/      # Reusable components
│   ├── contexts/        # React contexts (Auth)
│   ├── lib/             # Utilities (API client)
│   ├── middleware.ts    # Next.js middleware
│   └── package.json
│
└── frontend-mobile/
    ├── src/
    │   ├── config/      # API configuration
    │   ├── contexts/    # React contexts (Auth)
    │   ├── navigation/  # Navigation setup
    │   └── screens/      # App screens
    ├── App.tsx          # Entry point
    └── package.json
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration variables (see `.env.example`).

5. Start the development server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your configuration variables.

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Mobile App Setup

1. Navigate to the frontend-mobile directory:
```bash
cd frontend-mobile
```

2. Install dependencies:
```bash
npm install
```

3. Configure the API URL in `src/config/api.ts`:
   - For physical devices or Android emulator, use your local IP address instead of `localhost`
   - Example: `http://192.168.1.100:5000/api`

4. Start the Expo development server:
```bash
npm start
```

5. Scan the QR code with Expo Go app (iOS) or Camera app (Android)

See `frontend-mobile/SETUP.md` for detailed mobile setup instructions.

## User Roles

- **PATIENT**: Can submit declarations, view their medical records, receive notifications, participate in surveys, and order products
- **DOCTOR**: Can create and update medical records for assigned patients, manage daily appointments, add/manage secretaries, and order products
- **SECRETARY**: Can manage appointments for their assigned doctor, create/update/cancel appointments, and view daily schedules
- **ADMIN**: Full access including user management, declaration validation, product/order management, audit logs
- **AUTHORITY**: Access to anonymized statistics and can create notifications and surveys

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Patients
- `POST /api/patients/declarations` - Submit declaration (PATIENT)
- `GET /api/patients/declarations` - Get declarations
- `PATCH /api/patients/declarations/:id/approve` - Approve declaration (ADMIN)
- `PATCH /api/patients/declarations/:id/reject` - Reject declaration (ADMIN)

### Medical Records
- `POST /api/medical-records` - Create record (DOCTOR)
- `GET /api/medical-records` - Get records (role-based)
- `GET /api/medical-records/:id` - Get single record
- `PUT /api/medical-records/:id` - Update record (DOCTOR/ADMIN)
- `DELETE /api/medical-records/:id` - Delete record (DOCTOR/ADMIN)

### Notifications
- `POST /api/notifications` - Create notification (ADMIN/AUTHORITY)
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read

### Surveys
- `POST /api/surveys` - Create survey (ADMIN/AUTHORITY)
- `GET /api/surveys` - Get available surveys
- `POST /api/surveys/:id/respond` - Submit response
- `GET /api/surveys/:id/results` - Get results (ADMIN/AUTHORITY)

### Statistics
- `GET /api/statistics` - Get anonymized statistics
- `GET /api/statistics/region/:region` - Get regional statistics (ADMIN/AUTHORITY)

### Audit Logs
- `GET /api/audit` - Get audit logs (ADMIN)

### Users
- `GET /api/users` - Get users (ADMIN)
- `GET /api/users/:id` - Get user (ADMIN)
- `PUT /api/users/:id` - Update user (ADMIN)
- `PATCH /api/users/:id/deactivate` - Deactivate user (ADMIN)

### Products
- `POST /api/products` - Create product (ADMIN)
- `GET /api/products` - Get products (all authenticated users)
- `GET /api/products/:id` - Get product details
- `PUT /api/products/:id` - Update product (ADMIN)
- `DELETE /api/products/:id` - Delete product (ADMIN)
- `GET /api/products/admin/all` - Get all products for admin (ADMIN)

### Orders
- `POST /api/orders` - Create order (all authenticated users)
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders` - Get all orders (ADMIN)
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/status` - Update order status (ADMIN)

### Appointments
- `POST /api/appointments` - Create appointment (DOCTOR, SECRETARY)
- `GET /api/appointments/daily` - Get daily appointments (DOCTOR, SECRETARY)
- `GET /api/appointments/doctor` - Get appointments by doctor (DOCTOR, SECRETARY)
- `PATCH /api/appointments/:id/status` - Update appointment status (DOCTOR, SECRETARY)
- `DELETE /api/appointments/:id` - Delete appointment (DOCTOR, SECRETARY, ADMIN)

### Secretaries
- `POST /api/secretaries` - Add secretary (DOCTOR)
- `GET /api/secretaries` - Get doctor's secretaries (DOCTOR)
- `DELETE /api/secretaries/:id` - Remove secretary (DOCTOR)

## Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Helmet.js for security headers
- Rate limiting to prevent abuse
- Role-Based Access Control (RBAC)
- Ownership checks for resources
- Comprehensive audit logging
- Input validation with express-validator

## Database Models

- **User**: User accounts with role-based access (includes SECRETARY role with doctorId reference)
- **PatientDeclaration**: Disease declarations submitted by patients
- **MedicalRecord**: Electronic medical records created by doctors
- **Notification**: System notifications targeted by role/region
- **Survey**: Surveys with questions and responses
- **AuditLog**: Complete audit trail of all sensitive actions
- **Product**: Celiac-friendly products for e-commerce
- **Order**: Customer orders with items, status, and shipping information
- **Appointment**: Medical appointments with patient, doctor, date, time, and status

## Development

### Backend Development
- Uses nodemon for hot reloading
- Modular architecture (controllers, services, models)
- Clean separation of concerns

### Frontend Development
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Client-side routing with protected routes

## Production Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Update JWT secrets to strong, random values
3. Configure proper CORS origins
4. Set up MongoDB connection with proper credentials
5. Build frontend: `cd frontend && npm run build`
6. Start production servers

## License

ISC
