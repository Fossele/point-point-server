
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { handleSocket } from "./socket.js";
import userRouter from "./routes/user.route.js";
import cors from "cors";
import { notFound } from "./middlewares/notFound.js";

const app = express();


const server = createServer(app);



const io = new Server(server, {
    cors: {
        origin: "*",
    },
 }
);

app.use(cors(
	{origin: "http://localhost:5173", credentials: true}
));

app.use("/api/v1/users", userRouter);


app.all('*any', notFound);


handleSocket(io);

export { server as app }