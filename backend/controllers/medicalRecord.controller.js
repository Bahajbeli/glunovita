import * as medicalRecordService from '../services/medicalRecord.service.js';

export const createRecord = async (req, res, next) => {
  try {
    const record = await medicalRecordService.createMedicalRecord(req.user._id, req.body);
    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getRecords = async (req, res, next) => {
  try {
    const records = await medicalRecordService.getMedicalRecords(req.user._id, req.user.role);
    res.status(200).json({
      success: true,
      data: records
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: error.message
    });
  }
};

export const getRecordById = async (req, res, next) => {
  try {
    const record = await medicalRecordService.getMedicalRecordById(req.params.id, req.user._id, req.user.role);
    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(error.message === 'Access denied' ? 403 : 404).json({
      success: false,
      message: error.message
    });
  }
};

export const updateRecord = async (req, res, next) => {
  try {
    const record = await medicalRecordService.updateMedicalRecord(req.params.id, req.user._id, req.body);
    res.status(200).json({
      success: true,
      message: 'Medical record updated successfully',
      data: record
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteRecord = async (req, res, next) => {
  try {
    const result = await medicalRecordService.deleteMedicalRecord(req.params.id, req.user._id, req.user.role);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
