import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        index: true
    },
    content: {
        type: String,
        required: [true, 'Content is required']
    },
    summary: {
        type: String,
        required: [true, 'Summary is required'],
        trim: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    image: {
        type: String,
        trim: true
    },
    images: [{
        type: String,
        trim: true
    }],
    video: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: ['HEALTH', 'NUTRITION', 'LIFESTYLE', 'RECIPES', 'NEWS'],
        default: 'NEWS',
        index: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    isPublished: {
        type: Boolean,
        default: true,
        index: true
    }
}, {
    timestamps: true
});

// Indexes for searching
blogPostSchema.index({ title: 'text', content: 'text', summary: 'text' });
blogPostSchema.index({ createdAt: -1 });

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

export default BlogPost;
