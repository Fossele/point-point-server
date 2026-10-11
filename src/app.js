
import express from "express";
import {createServer} from "node:http";
import { Server } from "socket.io";

const app = express();

const server = createServer(app);

const io = new Server(server,{
    cors: {
        origin: "*",
    },
}
)

export {server as app}