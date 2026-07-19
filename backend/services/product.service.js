import Product from '../models/Product.model.js';
import AuditLog from '../models/AuditLog.model.js';
import Ingredient from '../models/Ingredient.model.js';

export const createProduct = async (productData, adminId) => {
  if (productData.isRecipe && productData.recipeIngredients && productData.recipeIngredients.length > 0) {
    let calculatedCost = 0;
    for (const item of productData.recipeIngredients) {
      const ing = await Ingredient.findById(item.ingredient);
      if (ing && ing.grammage > 0) {
        calculatedCost += (ing.price / ing.grammage) * item.grammage;
      }
    }
    const marginPercent = productData.margin || 0;
    productData.price = Number((calculatedCost * (1 + marginPercent / 100)).toFixed(3));
  }

  const product = new Product({
    ...productData,
    createdBy: adminId
  });

  await product.save();
  await product.populate('createdBy', 'firstName lastName email');

  await AuditLog.create({
    userId: adminId,
    action: 'PRODUCT_CREATE',
    resourceType: 'PRODUCT',
    resourceId: product._id,
    status: 'SUCCESS',
    details: { productName: product.name }
  });

  return product;
};

export const getProducts = async (filters = {}) => {
  const query = { isActive: true };

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = filters.minPrice;
    if (filters.maxPrice) query.price.$lte = filters.maxPrice;
  }

  const products = await Product.find(query)
    .populate('createdBy', 'firstName lastName')
    .populate('recipeIngredients.ingredient')
    .sort({ createdAt: -1 })
    .limit(filters.limit || 50)
    .skip(filters.skip || 0);

  const total = await Product.countDocuments(query);

  return { products, total };
};

export const getProductById = async (productId) => {
  const product = await Product.findById(productId)
    .populate('createdBy', 'firstName lastName email');

  if (!product) {
    throw new Error('Product not found');
  }

  return product;
};

export const updateProduct = async (productId, updateData, adminId) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error('Product not found');
  }

  if (updateData.isRecipe || (product.isRecipe && updateData.recipeIngredients)) {
    const ingredientsToUse = updateData.recipeIngredients || product.recipeIngredients;
    if (ingredientsToUse && ingredientsToUse.length > 0) {
      let calculatedCost = 0;
      for (const item of ingredientsToUse) {
        const ing = await Ingredient.findById(item.ingredient);
        if (ing && ing.grammage > 0) {
          calculatedCost += (ing.price / ing.grammage) * item.grammage;
        }
      }
      const marginPercent = updateData.margin !== undefined ? updateData.margin : (product.margin || 0);
      updateData.price = Number((calculatedCost * (1 + marginPercent / 100)).toFixed(3));
    }
  }

  Object.assign(product, updateData);
  await product.save();
  await product.populate('createdBy', 'firstName lastName email');

  await AuditLog.create({
    userId: adminId,
    action: 'PRODUCT_UPDATE',
    resourceType: 'PRODUCT',
    resourceId: product._id,
    status: 'SUCCESS',
    details: { productName: product.name }
  });

  return product;
};

export const deleteProduct = async (productId, adminId) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new Error('Product not found');
  }

  // Soft delete by setting isActive to false
  product.isActive = false;
  await product.save();

  await AuditLog.create({
    userId: adminId,
    action: 'PRODUCT_DELETE',
    resourceType: 'PRODUCT',
    resourceId: product._id,
    status: 'SUCCESS',
    details: { productName: product.name }
  });

  return { message: 'Product deleted successfully' };
};

export const getAllProductsForAdmin = async (filters = {}) => {
  const query = {};

  if (filters.category) {
    query.category = filters.category;
  }

  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }

  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  const products = await Product.find(query)
    .populate('createdBy', 'firstName lastName email')
    .populate('recipeIngredients.ingredient')
    .sort({ createdAt: -1 })
    .limit(filters.limit || 100)
    .skip(filters.skip || 0);

  const total = await Product.countDocuments(query);

  return { products, total };
};
