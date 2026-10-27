const GRID_SIZE = 30; // Assuming a 30x30 grid for the game


export function evaluateAdjacentSquares(vr, vc, currentVerts, currentSquares, player) {
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