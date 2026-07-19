import express from 'express';
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct, getAllProductsForAdmin } from '../controllers/product.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { auditLog } from '../middleware/audit.middleware.js';

const router = express.Router();

// Public routes - anyone can view products (no authentication required)
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin routes - only admins can manage products
router.post('/', authenticate, authorize('ADMIN'), auditLog('PRODUCT_CREATE', 'PRODUCT'), createProduct);
router.get('/admin/all', authenticate, authorize('ADMIN'), getAllProductsForAdmin);
router.put('/:id', authenticate, authorize('ADMIN'), auditLog('PRODUCT_UPDATE', 'PRODUCT'), updateProduct);
router.delete('/:id', authenticate, authorize('ADMIN'), auditLog('PRODUCT_DELETE', 'PRODUCT'), deleteProduct);

export default router;
