import { Board, GRID_SIZE } from "./board";

export type Input = {
    id: number;
    player1: string;
    player2: string;
    winner: string;
    ships: {
        player: string;
        x: number;
        y: number;
        length: number;
        orientation: 'HORIZONTAL' | 'VERTICAL';
    }[];
    shots: {
        player: string;
        x: number;
        y: number;
    }[];
}

type Step = {
    player: string;
    boards: [Board, Board];
    shot: "miss" | "hit" | "sunk" | null;
}

export type Output = {
    id: number;
    players: [string, string];
    winner: string;
    steps: Step[];
}

type ShipState = {
    player: string;
    coords: { x: number; y: number }[];
    hits: Set<string>;
}

function makeEmptyBoard(): Board {
    return Array.from({ length: GRID_SIZE }, () => Array.from({ length: GRID_SIZE }, () => '' as any));
}

export function makeSteps(input: Input): Output {
    const output: Output = {
        id: input.id,
        players: [input.player1, input.player2],
        winner: input.winner,
        steps: [],
    }

    // Build ship states grouped per player
    const shipsByPlayer: Record<string, ShipState[]> = {
        [input.player1]: [],
        [input.player2]: [],
    };

    for (const s of input.ships) {
        const coords: { x: number; y: number }[] = [];
        for (let i = 0; i < s.length; i++) {
            const x = s.orientation === 'HORIZONTAL' ? s.x + i : s.x;
            const y = s.orientation === 'VERTICAL' ? s.y + i : s.y;
            coords.push({ x, y });
        }
        shipsByPlayer[s.player].push({ player: s.player, coords, hits: new Set() });
    }

    // Initialize boards with ships shown
    const boards: Record<string, Board> = {
        [input.player1]: makeEmptyBoard(),
        [input.player2]: makeEmptyBoard(),
    };

    // helper to deep-copy current boards for a snapshot
    const snapFor = (player: string): Board => boards[player].map(row => row.slice()) as Board;

    // Initialize boards with ships
    for (const player of [input.player1, input.player2]) {
        const b = boards[player];
        for (const ship of shipsByPlayer[player]) {
            for (const c of ship.coords) {
                b[c.y][c.x] = 'ship';
            }
        }
    }
   
    // initial snapshot before any shots
    output.steps.push({
        player: '',
        boards: [snapFor(input.player1), snapFor(input.player2)],
        shot: null,
    });

    // Process shots in order, creating a step after each shot
    for (const shot of input.shots) {
        // shooter is shot.player, target is the other player
        const shooter = shot.player;
        const target = shooter === input.player1 ? input.player2 : input.player1;
        const tx = shot.x;
        const ty = shot.y;

        // see if this hits any ship of target
        const targetShips = shipsByPlayer[target];
        let hitShip: ShipState | null = null;
        for (const sh of targetShips) {
            if (sh.coords.some(c => c.x === tx && c.y === ty)) {
                hitShip = sh;
                break;
            }
        }

        const board = boards[target];

        let shotResult: "miss" | "hit" | "sunk" = 'miss';

        if (hitShip) {
            // register hit
            hitShip.hits.add(`${tx},${ty}`);

            // check sunk
            const sunk = hitShip.coords.every(c => hitShip!.hits.has(`${c.x},${c.y}`));
            if (sunk) {
                // mark all cells of that ship as sunk
                for (const c of hitShip.coords) {
                    board[c.y][c.x] = 'sunk';
                }
                shotResult = 'sunk';
            } else {
                // mark this cell as hit (only if not already sunk)
                if (board[ty][tx] !== 'sunk') {
                    board[ty][tx] = 'hit';
                }
                shotResult = 'hit';
            }
        } else {
            // miss
            if (boards[target][ty][tx] === '') {
                boards[target][ty][tx] = 'miss';
            }
            shotResult = 'miss';
        }

        output.steps.push({
            player: shooter,
            boards: [snapFor(input.player1), snapFor(input.player2)],
            shot: shotResult,
        });
    }

    return output;
}