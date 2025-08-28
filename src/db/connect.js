import mongoose from 'mongoose';
export const connectDB = async () => {
	if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI missing');
	await mongoose.connect(process.env.MONGODB_URI);
	console.log('Mongo connected');
};