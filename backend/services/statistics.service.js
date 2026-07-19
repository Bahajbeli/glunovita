import User from '../models/User.model.js';
import PatientDeclaration from '../models/PatientDeclaration.model.js';
import MedicalRecord from '../models/MedicalRecord.model.js';
import Survey from '../models/Survey.model.js';
import mongoose from 'mongoose';

export const getAnonymizedStatistics = async (region = null) => {
  const matchStage = region ? { region } : {};

  // Patient statistics
  const totalPatients = await User.countDocuments({ 
    role: 'PATIENT', 
    isActive: true,
    ...matchStage 
  });

  const approvedDeclarations = await PatientDeclaration.countDocuments({ 
    status: 'APPROVED' 
  });

  // Age distribution (anonymized)
  const ageGroups = await User.aggregate([
    { $match: { role: 'PATIENT', isActive: true, dateOfBirth: { $exists: true }, ...matchStage } },
    {
      $project: {
        age: {
          $divide: [
            { $subtract: [new Date(), '$dateOfBirth'] },
            365.25 * 24 * 60 * 60 * 1000
          ]
        }
      }
    },
    {
      $bucket: {
        groupBy: '$age',
        boundaries: [0, 18, 35, 50, 65, 100],
        default: '65+',
        output: { count: { $sum: 1 } }
      }
    }
  ]);

  // Gender distribution (if you add gender field)
  // For now, we'll skip this

  // Medical records statistics
  const totalRecords = await MedicalRecord.countDocuments();
  const recordsByType = await MedicalRecord.aggregate([
    {
      $group: {
        _id: '$visitType',
        count: { $sum: 1 }
      }
    }
  ]);

  // Survey participation
  const totalSurveys = await Survey.countDocuments({ isActive: true });
  const surveyResponses = await Survey.aggregate([
    { $unwind: '$responses' },
    { $count: 'totalResponses' }
  ]);

  // Regional distribution (anonymized)
  const regionalDistribution = await User.aggregate([
    { $match: { role: 'PATIENT', isActive: true, region: { $exists: true } } },
    {
      $group: {
        _id: '$region',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Declaration status distribution
  const declarationStatus = await PatientDeclaration.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  return {
    patients: {
      total: totalPatients,
      withApprovedDeclaration: approvedDeclarations,
      ageDistribution: ageGroups,
      regionalDistribution: regionalDistribution.map(r => ({
        region: r._id,
        count: r.count
      }))
    },
    medicalRecords: {
      total: totalRecords,
      byType: recordsByType.map(r => ({
        type: r._id,
        count: r.count
      }))
    },
    declarations: {
      statusDistribution: declarationStatus.map(s => ({
        status: s._id,
        count: s.count
      }))
    },
    surveys: {
      activeSurveys: totalSurveys,
      totalResponses: surveyResponses[0]?.totalResponses || 0
    },
    generatedAt: new Date().toISOString()
  };
};

export const getRegionalStatistics = async (region) => {
  if (!region) {
    throw new Error('Region is required');
  }

  return await getAnonymizedStatistics(region);
};
