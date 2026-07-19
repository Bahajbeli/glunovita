import * as surveyService from '../services/survey.service.js';

export const createSurvey = async (req, res, next) => {
  try {
    const survey = await surveyService.createSurvey(req.user._id, req.body);
    res.status(201).json({
      success: true,
      message: 'Survey created successfully',
      data: survey
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getSurveys = async (req, res, next) => {
  try {
    const surveys = await surveyService.getSurveys(
      req.user._id,
      req.user.role,
      req.user.region
    );
    res.status(200).json({
      success: true,
      data: surveys
    });
  } catch (error) {
    next(error);
  }
};

export const submitResponse = async (req, res, next) => {
  try {
    const survey = await surveyService.submitSurveyResponse(
      req.params.id,
      req.user._id,
      req.body.answers
    );
    res.status(200).json({
      success: true,
      message: 'Survey response submitted successfully',
      data: survey
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getSurveyResults = async (req, res, next) => {
  try {
    const results = await surveyService.getSurveyResults(req.params.id, req.user.role);
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(403).json({
      success: false,
      message: error.message
    });
  }
};
