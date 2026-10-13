


export const handleSocket = (io) =>{
    
    io.on("connection", (socket) => {
        console.log("user connected: ",socket.id );
        const room = socket.handshake.query?.room ?? "public";
        socket.join(room);
        console.log(socket.id, "joined room:", room);
        socket.on("game.point-capture", (message) => {
            console.log(`made move by ${message.currentPlayer}`);
            io.to(room).emit("game.point-capture",  message)
        });

        socket.on('disconnect', () => {
            io.to(room).emit("player X left the game.");
            console.log('user disconnected:', socket.id);
        });
    })

}