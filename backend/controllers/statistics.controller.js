import * as statisticsService from '../services/statistics.service.js';

export const getStatistics = async (req, res, next) => {
  try {
    const region = req.user.role === 'AUTHORITY' ? req.user.region : null;
    const statistics = await statisticsService.getAnonymizedStatistics(region);
    
    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getRegionalStatistics = async (req, res, next) => {
  try {
    const region = req.params.region || req.user.region;
    const statistics = await statisticsService.getRegionalStatistics(region);
    
    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
