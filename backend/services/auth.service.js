import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.model.js';
import AuditLog from '../models/AuditLog.model.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '818425628175-2jql5t00cft0scbaimiimi4876dcr4cv.apps.googleusercontent.com');

export const generateTokens = (userId) => {
  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT secrets are not configured. Please set JWT_SECRET and JWT_REFRESH_SECRET in your .env file');
  }

  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );

  return { accessToken, refreshToken };
};

export const registerUser = async (userData) => {
  const { email, password, firstName, lastName, role, region, licenseNumber, dateOfBirth, phoneNumber } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Clean up empty strings and convert to undefined
  const cleanRegion = region && region.trim() ? region.trim() : undefined;
  const cleanLicenseNumber = licenseNumber && licenseNumber.trim() ? licenseNumber.trim() : undefined;
  const cleanDateOfBirth = dateOfBirth ? dateOfBirth : undefined;
  const cleanPhoneNumber = phoneNumber && phoneNumber.trim() ? phoneNumber.trim() : undefined;

  // Validate required fields based on role
  if ((role === 'DOCTOR' || role === 'AUTHORITY') && !cleanRegion) {
    throw new Error(`${role} role requires a region`);
  }

  if (role === 'DOCTOR' && !cleanLicenseNumber) {
    throw new Error('DOCTOR role requires a license number');
  }

  // Create new user object with only provided fields
  const userDataToSave = {
    email,
    password,
    firstName,
    lastName,
    role
  };

  // Add optional fields only if provided and not empty
  if (cleanRegion) userDataToSave.region = cleanRegion;
  if (cleanLicenseNumber) userDataToSave.licenseNumber = cleanLicenseNumber;
  if (cleanDateOfBirth) userDataToSave.dateOfBirth = cleanDateOfBirth;
  if (cleanPhoneNumber) userDataToSave.phoneNumber = cleanPhoneNumber;

  const user = new User(userDataToSave);

  try {
    await user.save();
  } catch (error) {
    // Re-throw validation errors
    if (error.name === 'ValidationError') {
      throw error;
    }
    throw error;
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Log registration (don't fail if audit log fails)
  try {
    await AuditLog.create({
      userId: user._id,
      action: 'USER_CREATE',
      resourceType: 'USER',
      resourceId: user._id,
      status: 'SUCCESS',
      details: { role: user.role }
    });
  } catch (auditError) {
    console.error('Failed to create audit log:', auditError);
    // Don't throw - registration should succeed even if audit log fails
  }

  return {
    user: {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      region: user.region,
      doctorId: user.doctorId || undefined
    },
    accessToken,
    refreshToken
  };
};

export const loginUser = async (email, password, ipAddress, userAgent) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    await AuditLog.create({
      action: 'LOGIN',
      resourceType: 'USER',
      status: 'FAILURE',
      errorMessage: 'Invalid credentials',
      ipAddress,
      userAgent,
      details: { email }
    });
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    throw new Error('Account is deactivated');
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    await AuditLog.create({
      userId: user._id,
      action: 'LOGIN',
      resourceType: 'USER',
      status: 'FAILURE',
      errorMessage: 'Invalid password',
      ipAddress,
      userAgent
    });
    throw new Error('Invalid email or password');
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Log successful login
  await AuditLog.create({
    userId: user._id,
    action: 'LOGIN',
    resourceType: 'USER',
    resourceId: user._id,
    status: 'SUCCESS',
    ipAddress,
    userAgent
  });

  return {
    user: {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      region: user.region,
      doctorId: user.doctorId || undefined
    },
    accessToken,
    refreshToken
  };
};

export const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      throw new Error('Invalid refresh token');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    const { accessToken } = generateTokens(user._id);

    return { accessToken };
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

export const logoutUser = async (userId, ipAddress, userAgent) => {
  const user = await User.findById(userId);
  if (user) {
    user.refreshToken = null;
    await user.save({ validateBeforeSave: false });

    await AuditLog.create({
      userId: user._id,
      action: 'LOGOUT',
      resourceType: 'USER',
      resourceId: user._id,
      status: 'SUCCESS',
      ipAddress,
      userAgent
    });
  }
};

export const googleLogin = async (token, ipAddress, userAgent) => {
  try {
    let payload;
    
    // Check if token is a JWT (ID token) or an access token
    if (token.split('.').length === 3) {
      // It's likely an ID token
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID || '818425628175-2jql5t00cft0scbaimiimi4876dcr4cv.apps.googleusercontent.com',
      });
      payload = ticket.getPayload();
    } else {
      // It's an access token
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user info from Google');
      }
      payload = await response.json();
    }
    
    const { sub: googleId, email, given_name, family_name } = payload;

    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save({ validateBeforeSave: false });
      }
    } else {
      user = new User({
        email,
        googleId,
        firstName: given_name || 'Google',
        lastName: family_name || 'User',
        role: 'PATIENT',
        isEmailVerified: true
      });
      await user.save({ validateBeforeSave: false });
      
      try {
        await AuditLog.create({
          userId: user._id,
          action: 'USER_CREATE',
          resourceType: 'USER',
          resourceId: user._id,
          status: 'SUCCESS',
          details: { role: user.role, method: 'GOOGLE' }
        });
      } catch (auditError) {
        console.error('Failed to create audit log:', auditError);
      }
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    await AuditLog.create({
      userId: user._id,
      action: 'LOGIN',
      resourceType: 'USER',
      resourceId: user._id,
      status: 'SUCCESS',
      ipAddress,
      userAgent,
      details: { method: 'GOOGLE' }
    });

    return {
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        region: user.region,
        doctorId: user.doctorId || undefined
      },
      accessToken,
      refreshToken
    };
  } catch (error) {
    throw new Error(`Google login failed: ${error.message}`);
  }
};
