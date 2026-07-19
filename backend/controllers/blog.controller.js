import BlogPost from '../models/BlogPost.model.js';

export const createBlogPost = async (req, res, next) => {
    try {
        const blogPost = await BlogPost.create({
            ...req.body,
            author: req.user._id
        });
        res.status(201).json({ success: true, data: blogPost });
    } catch (error) {
        next(error);
    }
};

export const getBlogPosts = async (req, res, next) => {
    try {
        const { category, search, publishedOnly } = req.query;
        const query = {};

        if (category) query.category = category;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { summary: { $regex: search, $options: 'i' } }
            ];
        }
        if (publishedOnly === 'true') query.isPublished = true;

        const posts = await BlogPost.find(query)
            .populate('author', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: posts });
    } catch (error) {
        next(error);
    }
};

export const getBlogPost = async (req, res, next) => {
    try {
        const post = await BlogPost.findById(req.params.id).populate('author', 'firstName lastName');
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        res.status(200).json({ success: true, data: post });
    } catch (error) {
        next(error);
    }
};

export const updateBlogPost = async (req, res, next) => {
    try {
        const post = await BlogPost.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        res.status(200).json({ success: true, data: post });
    } catch (error) {
        next(error);
    }
};

export const deleteBlogPost = async (req, res, next) => {
    try {
        const post = await BlogPost.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        res.status(200).json({ success: true, message: 'Post deleted' });
    } catch (error) {
        next(error);
    }
};
