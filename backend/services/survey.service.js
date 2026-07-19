import Survey from '../models/Survey.model.js';
import AuditLog from '../models/AuditLog.model.js';

export const createSurvey = async (creatorId, surveyData) => {
  const survey = new Survey({
    ...surveyData,
    createdBy: creatorId
  });

  await survey.save();

  await AuditLog.create({
    userId: creatorId,
    action: 'SURVEY_CREATE',
    resourceType: 'SURVEY',
    resourceId: survey._id,
    status: 'SUCCESS'
  });

  return survey;
};

export const getSurveys = async (userId, userRole, userRegion) => {
  const now = new Date();
  
  const query = {
    isActive: true,
    startDate: { $lte: now },
    $or: [
      { endDate: null },
      { endDate: { $gte: now } }
    ],
    $or: [
      { targetRoles: userRole },
      { targetRegions: userRegion }
    ]
  };

  const surveys = await Survey.find(query)
    .populate('createdBy', 'firstName lastName')
    .sort({ createdAt: -1 });

  // Filter out surveys user has already responded to
  return surveys.filter(survey => {
    return !survey.responses.some(response => 
      response.userId.toString() === userId.toString()
    );
  });
};

export const submitSurveyResponse = async (surveyId, userId, answers) => {
  const survey = await Survey.findById(surveyId);

  if (!survey) {
    throw new Error('Survey not found');
  }

  if (!survey.isActive) {
    throw new Error('Survey is not active');
  }

  const now = new Date();
  if (survey.startDate > now || (survey.endDate && survey.endDate < now)) {
    throw new Error('Survey is not available at this time');
  }

  // Check if user already responded
  const alreadyResponded = survey.responses.some(
    response => response.userId.toString() === userId.toString()
  );

  if (alreadyResponded) {
    throw new Error('You have already responded to this survey');
  }

  survey.responses.push({
    userId,
    answers
  });

  await survey.save();

  await AuditLog.create({
    userId,
    action: 'SURVEY_RESPOND',
    resourceType: 'SURVEY',
    resourceId: survey._id,
    status: 'SUCCESS'
  });

  return survey;
};

export const getSurveyResults = async (surveyId, userRole) => {
  if (userRole !== 'ADMIN' && userRole !== 'AUTHORITY') {
    throw new Error('Unauthorized');
  }

  const survey = await Survey.findById(surveyId)
    .populate('responses.userId', 'firstName lastName role region');

  if (!survey) {
    throw new Error('Survey not found');
  }

  // Return anonymized results for AUTHORITY
  if (userRole === 'AUTHORITY') {
    const anonymized = {
      ...survey.toObject(),
      responses: survey.responses.map(response => ({
        answers: response.answers,
        submittedAt: response.submittedAt,
        // Remove user identification
        userId: null
      }))
    };
    return anonymized;
  }

  return survey;
};
