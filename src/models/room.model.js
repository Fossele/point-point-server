import mongoose, { Schema } from "mongoose";



const gameRoomSchema = new Schema(
    {
        roomCode: String,
        players: [Object ],
        vertices: [][Number],
        squares: [][Number],
        status: String,
        scores: Object,
    }, { timestamps: true }
)


export const GameRoom = mongoose.model("GameRoom", gameRoomSchema);