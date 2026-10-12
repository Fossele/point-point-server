import  {app} from "./app.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
});

const startServer = async () => {
    try {
        await connectDB();

        app.on('error', (error) => {
            console.log(' Error', error);
            throw error;
        })
        app.listen(process.env.PORT || 8000, () => {
            console.log(`listening on port ${process.env.PORT}`)
            console.log(`http://localhost:${process.env.PORT || 8000}`)
        });
    } catch (error) {
        console.log("server error: ", error);
    }
}


startServer()