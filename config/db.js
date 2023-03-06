import mongoose from 'mongoose'
import * as dotenv from 'dotenv'

const connectDB = async () => {
    try {
        const conn = await mongoose.connect("mongodb://localhost", {
                useNewUrlParser: true,
                useUnifiedTopology: true
            })
            console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline)
    } catch (error) {
        console.error(`Error: ${error.message}`.red.underline.bold)
        process.exit(1)
    }
}

export default connectDB;