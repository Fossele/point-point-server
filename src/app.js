
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { handleGameSocket} from "./socket.js";
import userRouter from "./routes/user.route.js";
import cors from "cors";
import { notFound } from "./middlewares/notFound.js";

const app = express();
const server = createServer(app);


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use("/api/v1/users", userRouter);
app.all('*any', notFound);




const io = new Server(server, {
    cors: {
        origin: "*"
    },
 }
);

handleGameSocket(io);

export { server as app }