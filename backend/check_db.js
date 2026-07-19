import mongoose from 'mongoose';
import Product from './models/Product.model.js';

const URI = 'mongodb+srv://baha:baha@cluster0.ytuptr5.mongodb.net/celiac-disease?appName=Cluster0';

async function check() {
    await mongoose.connect(URI);
    const products = await Product.find({});
    console.log(JSON.stringify(products, null, 2));
    process.exit(0);
}

check().catch(console.error);
