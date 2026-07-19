import mongoose from 'mongoose';
import Product from './models/Product.model.js';
mongoose.connect('mongodb+srv://baha:baha@cluster0.ytuptr5.mongodb.net/celiac-disease?appName=Cluster0')
  .then(async () => {
    // Delete all recipes that are inactive (soft deleted)
    const res = await Product.deleteMany({ isRecipe: true, isActive: false });
    console.log(`Deleted ${res.deletedCount} inactive recipes.`);
    process.exit(0);
  });
