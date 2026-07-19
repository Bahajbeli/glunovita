import SalesPoint from '../models/SalesPoint.model.js';

// @desc    Get all sales points
// @route   GET /api/sales-points
// @access  Private (All authenticated users)
export const getSalesPoints = async (req, res, next) => {
  try {
    const salesPoints = await SalesPoint.find({ isActive: true });
    res.status(200).json({
      success: true,
      count: salesPoints.length,
      data: salesPoints
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all sales points including inactive (Admin only)
// @route   GET /api/sales-points/admin
// @access  Private/Admin
export const getAdminSalesPoints = async (req, res, next) => {
  try {
    const salesPoints = await SalesPoint.find().sort('-createdAt');
    res.status(200).json({
      success: true,
      count: salesPoints.length,
      data: salesPoints
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new sales point
// @route   POST /api/sales-points
// @access  Private/Admin
export const createSalesPoint = async (req, res, next) => {
  try {
    const salesPoint = await SalesPoint.create(req.body);
    res.status(201).json({
      success: true,
      data: salesPoint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a sales point
// @route   PUT /api/sales-points/:id
// @access  Private/Admin
export const updateSalesPoint = async (req, res, next) => {
  try {
    const salesPoint = await SalesPoint.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!salesPoint) {
      return res.status(404).json({ success: false, message: 'Sales point not found' });
    }

    res.status(200).json({
      success: true,
      data: salesPoint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a sales point
// @route   DELETE /api/sales-points/:id
// @access  Private/Admin
export const deleteSalesPoint = async (req, res, next) => {
  try {
    const salesPoint = await SalesPoint.findById(req.params.id);

    if (!salesPoint) {
      return res.status(404).json({ success: false, message: 'Sales point not found' });
    }

    await salesPoint.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
