const GRID_SIZE = 30; // Assuming a 30x30 grid for the game

function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
        if (i === 2) code += '-';
    }
    return code;
}


function evaluateAdjacentSquares(vr, vc, currentVerts, currentSquares, player) {
    let claimedCount = 0;
    let blockedCount = 0;
    const updatedSquares = currentSquares.map(row => [...row]);
    const newlyCaptured = [];

    const candidates = [
        { r: vr - 1, c: vc - 1 },
        { r: vr - 1, c: vc },
        { r: vr, c: vc - 1 },
        { r: vr, c: vc }
    ];

    candidates.forEach(({ r, c }) => {
        if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
            if (updatedSquares[r][c] === 0) {
                const c1 = currentVerts[r][c];
                const c2 = currentVerts[r][c + 1];
                const c3 = currentVerts[r + 1][c];
                const c4 = currentVerts[r + 1][c + 1];

                if (c1 !== 0 && c2 !== 0 && c3 !== 0 && c4 !== 0) {
                    if (c1 === c2 && c2 === c3 && c3 === c4) {
                        updatedSquares[r][c] = player;
                        claimedCount++;
                        newlyCaptured.push({ r, c, player });
                    } else {
                        updatedSquares[r][c] = -1;
                        blockedCount++;
                    }
                }
            }
        }
    });

    return { updatedSquares, claimedCount, blockedCount, newlyCaptured };
}

export function handleGameSocket(io) {


    const rooms = new Map();


    io.on('connection', (socket) => {
        console.log('Player connected:', socket.id);

        // 1. Handle room creation
        socket.on('create-room', (callback) => {
            try {
                let roomCode = generateRoomCode();

                // Ensure absolute uniqueness (prevent rare collisions)
                while (rooms.has(roomCode)) {
                    roomCode = generateRoomCode();
                }

                const newVerts = Array.from({ length: 30 + 1 }, () => Array(30 + 1).fill(0));
                const newSq = Array.from({ length: 30 }, () => Array(30).fill(0));


                // Initialize room state
                rooms.set(roomCode, {
                    roomCode,
                    players: [
                        { id: socket.id, role: 1 } // The creator is always Player 1
                    ],
                    vertices: newVerts.map(row => [...row]),
                    squares: newSq.map(row => [...row]),
                    status: 'lobby', // 'lobby' | 'playing' | 'game_over'
                    currentTurn: 1,
                    scores: { 1: 0, 2: 0 },
                    extraTurn: false
                });

                // Force this socket to join the Socket.io room channel
                socket.join(roomCode);

                console.log(`Room created: ${roomCode} by ${socket.id}`);

                // Respond back to the frontend with the generated code
                if (typeof callback === 'function') {
                    callback({ roomCode });
                }
            } catch (error) {
                console.error('Error in create_room:', error);
                if (typeof callback === 'function') {
                    callback({ error: 'Failed to create room.' });
                }
            }
        });



        // 2. Player joins a room
        socket.on('join-room', async (roomCode, callback) => {

            console.log(`Player ${socket.id} trying to join room: ${roomCode}`);

            const room = rooms.get(roomCode);
            if (!room) {
                console.log(`Room ${roomCode} doesn't exist`);
                if (typeof callback === 'function') {
                    callback({ success: false, error: "Room does not exist." });
                }
                return;
            }

            // Optional: Check if room is already full (e.g., already has 2 players)
            if (room.players.length >= 2 && socket.id !== room.players[0].id && socket.id !== room.players[1].id) {
                if (typeof callback === 'function') {
                    callback({ success: false, error: "Room is already full." });
                }
                return;
            }


            console.log("game should start 1")
            room.players.push({ id: socket.id, role: 2 }); // Player 2
            room.status = 'playing';
            let sockets = await io.in(roomCode).fetchSockets();

            if (sockets.find(s => s.id == socket.id)) {
                console.log("socket present in room");
                if (typeof callback === 'function') {
                    callback({ success: false, error: "User already in room." });
                }
                return;
            }

            console.log("game should start 2")

            socket.join(roomCode);

            sockets = await io.in(roomCode).fetchSockets();



            const socketIds = sockets.map(s => s.id);

            if (socketIds.length === 2) {
                io.to(roomCode).emit('game-start', {
                    currentTurn: 1,
                    players: [
                        { id: socketIds[0], role: 1 },
                        { id: socketIds[1], role: 2 }
                    ], roomCode
                });
                console.log(`Game started in room ${roomCode} with players:`, socketIds);
            }

            // Tell the client joining was successful
            if (typeof callback === 'function') {
                callback({
                    success: true, payload: {
                        currentTurn: 1,
                        players: [
                            { id: socketIds[0], role: 1 },
                            { id: socketIds[1], role: 2 }
                        ], roomCode
                    }
                });
            }
        });

        // Handle a move sent from any client
        socket.on('make-move', ({ roomCode, r, c, player }) => {
            console.log("move received: ", { roomCode, r, c, player });
        
            const game = rooms.get(roomCode);
            if (!game) return;

            if (game.vertices[r][c] !== 0) return;
            game.vertices[r][c] = player;


            


            const {  claimedCount } = evaluateAdjacentSquares(
                r,
                c,
                game.vertices,
                game.squares,
                player
            );


            // Update scores
            if (claimedCount > 0) {
                game.scores[player] += claimedCount;
                game.extraTurn = true; // Player gets an extra turn for capturing a box
                // Note: In standard Dots and Boxes rules, capturing a box awards an extra turn.
                // Therefore, game.currentTurn stays the same (player keeps their turn).
            } else {
                // Switch turn only if no boxes were captured
                game.currentTurn = game.currentTurn === 1 ? 2 : 1;
                game.extraTurn = false;
            }

            const lastMove = { r, c, player };

            // BROADCAST A LIGHTWEIGHT DELTA INSTEAD OF THE WHOLE BOARD
            io.to(roomCode).emit('move-applied', {
                r,
                c,
                player,
                currentTurn: game.currentTurn,
                scores: game.scores,
                lastMove,
                extraTurn: game.extraTurn,
                // Include captured boxes or scores if your engine calculates them here
            });
        });

        socket.on('disconnect', (roomCode) => {
            io.to(roomCode).emit("player X left the game.");
            socket.leave(roomCode);
            console.log('user disconnected:', socket.id);
        });
    });

}