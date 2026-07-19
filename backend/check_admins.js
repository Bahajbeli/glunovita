import mongoose from 'mongoose';
import User from './models/User.model.js';

const URI = 'mongodb+srv://baha:baha@cluster0.ytuptr5.mongodb.net/celiac-disease?appName=Cluster0';

async function check() {
    await mongoose.connect(URI);
    const admins = await User.find({ role: 'ADMIN' });
    console.log('Admins:', admins.map(a => ({ email: a.email, name: a.firstName })));
    process.exit(0);
}

check().catch(console.error);
