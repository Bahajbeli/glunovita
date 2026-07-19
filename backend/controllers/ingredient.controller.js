import Ingredient from '../models/Ingredient.model.js';

// @desc    Get all ingredients
// @route   GET /api/ingredients
// @access  Private/Admin
export const getIngredients = async (req, res, next) => {
  try {
    const ingredients = await Ingredient.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: ingredients.length,
      data: ingredients
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new ingredient
// @route   POST /api/ingredients
// @access  Private/Admin
export const createIngredient = async (req, res, next) => {
  try {
    const ingredient = await Ingredient.create(req.body);

    res.status(201).json({
      success: true,
      data: ingredient
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ingredient
// @route   PUT /api/ingredients/:id
// @access  Private/Admin
export const updateIngredient = async (req, res, next) => {
  try {
    let ingredient = await Ingredient.findById(req.params.id);

    if (!ingredient) {
      return res.status(404).json({ success: false, message: 'Ingredient not found' });
    }

    ingredient = await Ingredient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: ingredient
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete ingredient
// @route   DELETE /api/ingredients/:id
// @access  Private/Admin
export const deleteIngredient = async (req, res, next) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);

    if (!ingredient) {
      return res.status(404).json({ success: false, message: 'Ingredient not found' });
    }

    await ingredient.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
