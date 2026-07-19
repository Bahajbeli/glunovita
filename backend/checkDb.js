import mongoose from 'mongoose';
import Product from './models/Product.model.js';
mongoose.connect('mongodb+srv://baha:baha@cluster0.ytuptr5.mongodb.net/celiac-disease?appName=Cluster0')
  .then(async () => {
    const p = await Product.find({ isRecipe: true });
    import('fs').then(fs => {
        fs.writeFileSync('db_out.json', JSON.stringify(p, null, 2));
        process.exit(0);
    });
  });
