import * as secretaryService from '../services/secretary.service.js';

export const createSecretary = async (req, res, next) => {
  try {
    const secretary = await secretaryService.createSecretary(req.body, req.user._id);
    res.status(201).json({
      success: true,
      message: 'Secretary created successfully',
      data: secretary
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getSecretaries = async (req, res, next) => {
  try {
    const secretaries = await secretaryService.getSecretariesByDoctor(req.user._id);
    res.status(200).json({
      success: true,
      data: secretaries
    });
  } catch (error) {
    next(error);
  }
};

export const removeSecretary = async (req, res, next) => {
  try {
    const result = await secretaryService.removeSecretary(req.params.id, req.user._id);
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
