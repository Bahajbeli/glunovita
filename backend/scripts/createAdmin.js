import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://baha:baha@cluster0.ytuptr5.mongodb.net/celiac-disease?appName=Cluster0');
    console.log('MongoDB connected');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@glunovita.com' });
    
    if (existingAdmin) {
      console.log('Admin already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      process.exit(0);
    }

    // Create admin user
    const admin = new User({
      email: 'admin@glunovita.com',
      password: 'Admin123456',
      firstName: 'Admin',
      lastName: 'Glunovita',
      role: 'ADMIN',
      isActive: true,
      isEmailVerified: true
    });

    await admin.save();

    console.log('\n✅ Admin account created successfully!\n');
    console.log('=================================');
    console.log('Email: admin@glunovita.com');
    console.log('Password: Admin123456');
    console.log('Role: ADMIN');
    console.log('=================================\n');
    console.log('⚠️  IMPORTANT: Change the password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
