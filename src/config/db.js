import mongoose from "mongoose";

const connectDB = async () => {
    try {

        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}`);
        console.log("Database successfully connected to " + connectionInstance.connection.host);

    } catch (error) {
        console.log('Error: ', error);
        process.exit(1);
    }
}

export default connectDB;