const { Chess } =
  require('./node_modules/@chesswise/chess-core/node_modules/chess.js/dist/chess.js') ||
  require('chess.js');
const pgn = `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2026.05.02"]
[Round "-"]
[White "Mr_coder"]
[Black "RAVINDRA007RKB"]
[Result "0-1"]
[CurrentPosition "r1b1kb1r/ppp2pp1/2np1n2/6BP/6P1/5qK1/P4P2/7q w kq - 0 19"]
[Timezone "UTC"]
[ECO "A40"]
[ECOUrl "https://www.chess.com/openings/Queens-Pawn-Opening-Mikenas-Defense-2.Nf3-d6"]
[UTCDate "2026.05.02"]
[UTCTime "21:46:59"]
[WhiteElo "462"]
[BlackElo "631"]
[TimeControl "300"]
[Termination "RAVINDRA007RKB won by checkmate"]
[StartTime "21:46:59"]
[EndDate "2026.05.02"]
[EndTime "21:53:38"]
[Link "https://www.chess.com/game/live/168151315378"]

1. d4 {[%clk 0:05:00]} 1... Nc6 {[%clk 0:05:00]} 2. Nf3 {[%clk 0:04:52.5]} 2... d6 {[%clk 0:04:52.8]} 3. Ng5 {[%clk 0:04:45.9]} 3... Nf6 {[%clk 0:04:47.2]} 4. g4 {[%clk 0:04:29.4]} 4... h6 {[%clk 0:04:44.2]} 5. Rg1 {[%clk 0:04:13.5]} 5... hxg5 {[%clk 0:04:36.3]} 6. h3 {[%clk 0:03:47.8]} 6... e5 {[%clk 0:04:25.2]} 7. c3 {[%clk 0:03:31.8]} 7... exd4 {[%clk 0:04:21.4]} 8. Bxg5 {[%clk 0:03:24.6]} 8... Qe7 {[%clk 0:04:15.1]} 9. h4 {[%clk 0:03:01.7]} 9... dxc3 {[%clk 0:04:12.7]} 10. Qc1 {[%clk 0:02:48.1]} 10... Qe5 {[%clk 0:04:04.9]} 11. e3 {[%clk 0:02:20.3]} 11... cxb2 {[%clk 0:03:58.9]} 12. Rh1 {[%clk 0:01:50.4]} 12... bxc1=Q+ {[%clk 0:03:51.1]} 13. Ke2 {[%clk 0:01:23.7]} 13... Qxa1 {[%clk 0:03:45.4]} 14. Kf3 {[%clk 0:01:14.4]} 14... Qaxb1 {[%clk 0:03:40.1]} 15. Be2 {[%clk 0:01:06.7]} 15... Qe4+ {[%clk 0:03:37.9]} 16. Kg3 {[%clk 0:00:55.7]} 16... Qcxh1 {[%clk 0:03:34.6]} 17. Bf3 {[%clk 0:00:32.6]} 17... Qxe3 {[%clk 0:03:30.9]} 18. h5 {[%clk 0:00:09.7]} 18... Qexf3# {[%clk 0:03:28.3]} 0-1`;

const chess = new Chess();
try {
  chess.loadPgn(pgn);
  console.log('Success! Moves:', chess.history().length);
} catch (e) {
  console.error('Failed!', e.message);
}
