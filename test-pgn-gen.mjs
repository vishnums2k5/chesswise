import { Chess } from 'chess.js';

const chess = new Chess();
chess.move('f3');
chess.move('d5');
chess.move('g4');
chess.move('e5');
chess.move('f4');
chess.move('Qh4#');
console.log("PGN:", chess.pgn());

const chess2 = new Chess();
try {
  chess2.loadPgn(chess.pgn());
  console.log("Validation OK");
} catch (e) {
  console.log("Validation Failed:", e);
}
