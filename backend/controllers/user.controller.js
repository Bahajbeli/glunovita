import User from '../models/User.model.js';
import AuditLog from '../models/AuditLog.model.js';

export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }
    if (req.query.region) {
      filter.region = req.query.region;
    }
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const users = await User.find(filter)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshToken');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { password, email, ...updateData } = req.body;
    
    // Don't allow password or email updates through this route
    if (password || email) {
      return res.status(400).json({
        success: false,
        message: 'Password and email cannot be updated through this route'
      });
    }

    // Check if user is updating their own profile or is admin
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Allow users to update their own profile, or admins to update any profile
    if (req.user.role !== 'ADMIN' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    await AuditLog.create({
      userId: req.user._id,
      action: 'USER_UPDATE',
      resourceType: 'USER',
      resourceId: user._id,
      status: 'SUCCESS',
      details: { updatedFields: Object.keys(updateData) }
    });

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await AuditLog.create({
      userId: req.user._id,
      action: 'USER_UPDATE',
      resourceType: 'USER',
      resourceId: user._id,
      status: 'SUCCESS',
      details: { action: 'deactivated' }
    });

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const searchPatients = async (req, res, next) => {
  try {
    const { search } = req.query;
    
    if (!search || search.length < 2) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const patients = await User.find({
      role: 'PATIENT',
      isActive: true,
      $or: [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    })
      .select('firstName lastName email phoneNumber')
      .limit(10)
      .sort({ firstName: 1, lastName: 1 });

    res.status(200).json({
      success: true,
      data: patients
    });
  } catch (error) {
    next(error);
  }
};

export const getDoctors = async (req, res, next) => {
  try {
    const doctors = await User.find({
      role: 'DOCTOR',
      isActive: true
    })
      .select('firstName lastName email specialization address location region licenseNumber profileQuestions')
      .sort({ firstName: 1, lastName: 1 });

    res.status(200).json({
      success: true,
      data: doctors
    });
  } catch (error) {
    next(error);
  }
};
