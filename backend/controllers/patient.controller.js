import * as patientService from '../services/patient.service.js';

export const createDeclaration = async (req, res, next) => {
  try {
    const declaration = await patientService.createDeclaration(req.user._id, req.body);
    res.status(201).json({
      success: true,
      message: 'Declaration submitted successfully',
      data: declaration
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getDeclarations = async (req, res, next) => {
  try {
    const declarations = await patientService.getPatientDeclarations(req.user._id, req.user.role);
    res.status(200).json({
      success: true,
      data: declarations
    });
  } catch (error) {
    next(error);
  }
};

export const approveDeclaration = async (req, res, next) => {
  try {
    const declaration = await patientService.approveDeclaration(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: 'Declaration approved successfully',
      data: declaration
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const rejectDeclaration = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;
    const declaration = await patientService.rejectDeclaration(req.params.id, req.user._id, rejectionReason);
    res.status(200).json({
      success: true,
      message: 'Declaration rejected',
      data: declaration
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
