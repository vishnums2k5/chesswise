const { Chess } = require('./node_modules/chess.js/dist/chess.js');

const chess = new Chess();
chess.move('f3');
chess.move('d5');
chess.move('g4');
chess.move('e5');
chess.move('f4');
chess.move('Qh4#');
const pgn = chess.pgn();
console.log('PGN:', pgn);

const chess2 = new Chess();
try {
  chess2.loadPgn(pgn);
  console.log('Validation OK, history:', chess2.history());
} catch (e) {
  console.log('Validation Error:', e.message);
}
