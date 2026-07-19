import express from 'express';
import {
    createBlogPost,
    getBlogPosts,
    getBlogPost,
    updateBlogPost,
    deleteBlogPost
} from '../controllers/blog.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getBlogPosts);
router.get('/:id', getBlogPost);

// Admin only routes
router.use(authenticate);
router.use(authorize('ADMIN'));

router.post('/', createBlogPost);
router.put('/:id', updateBlogPost);
router.delete('/:id', deleteBlogPost);

export default router;
