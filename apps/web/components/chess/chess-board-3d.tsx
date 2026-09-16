'use client';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import { Square, Chess, fenToPieceMap, getLegalMovesForSquare } from '@chesswise/chess-core';
import { Text } from '@react-three/drei';

const SQUARE_SIZE = 1;
const BOARD_OFFSET = (8 * SQUARE_SIZE) / 2 - SQUARE_SIZE / 2;

// Maps 'a1' to 3D coordinates
function squareToPos(sq: string, orientation: 'white' | 'black') {
  const file = sq.charCodeAt(0) - 97; // 'a' -> 0, 'h' -> 7
  const rank = parseInt(sq.charAt(1)) - 1; // '1' -> 0, '8' -> 7

  let x = file * SQUARE_SIZE - BOARD_OFFSET;
  let z = -(rank * SQUARE_SIZE - BOARD_OFFSET); // -z is forward in WebGL

  if (orientation === 'black') {
    x = -x;
    z = -z;
  }
  return [x, 0, z] as [number, number, number];
}

interface PieceData {
  id: string;
  type: string; // 'p', 'n', 'b', 'r', 'q', 'k'
  color: 'w' | 'b';
  square: Square;
}

// Preload individual piece models
useGLTF.preload('/pawn.gltf');
useGLTF.preload('/knight.gltf');
useGLTF.preload('/bishop.gltf');
useGLTF.preload('/rook.gltf');
useGLTF.preload('/queen.gltf');
useGLTF.preload('/king.gltf');

function Piece({ data, orientation, onClick, isSelected }: any) {
  const [x, y, z] = squareToPos(data.square, orientation);

  const pawnGLTF = useGLTF('/pawn.gltf') as any;
  const knightGLTF = useGLTF('/knight.gltf') as any;
  const bishopGLTF = useGLTF('/bishop.gltf') as any;
  const rookGLTF = useGLTF('/rook.gltf') as any;
  const queenGLTF = useGLTF('/queen.gltf') as any;
  const kingGLTF = useGLTF('/king.gltf') as any;

  const getGeom = (gltf: any) =>
    (Object.values(gltf.nodes).find((n: any) => n.geometry) as any)?.geometry;

  const typeMap = {
    p: getGeom(pawnGLTF),
    n: getGeom(knightGLTF),
    b: getGeom(bishopGLTF),
    r: getGeom(rookGLTF),
    q: getGeom(queenGLTF),
    k: getGeom(kingGLTF),
  };

  const geometry = typeMap[data.type.toLowerCase() as keyof typeof typeMap];

  const { position } = useSpring({
    position: [x, isSelected ? y + 0.3 : y, z],
    config: { mass: 1, tension: 170, friction: 26 },
  });

  // Knight needs rotation
  let rotation: [number, number, number] = [0, 0, 0];
  if (data.type.toLowerCase() === 'n') {
    rotation[1] += data.color === 'b' ? Math.PI : 0; // The knight model might face differently
  }

  return (
    <a.mesh
      position={position as any}
      rotation={rotation}
      scale={[0.0045, 0.0045, 0.0045]}
      geometry={geometry}
      castShadow
      receiveShadow
      onClick={(e) => {
        e.stopPropagation();
        onClick(data.square);
      }}
    >
      <meshPhysicalMaterial
        color={data.color === 'w' ? '#d9d9d9' : '#4a4a4a'}
        metalness={0.2}
        roughness={0.2}
        clearcoat={0.8}
        clearcoatRoughness={0.2}
      />
    </a.mesh>
  );
}

function BoardSquares({ orientation, selected, legalTargets, onSquareClick, pieces }: any) {
  const squares = [];
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const sq = (String.fromCharCode(97 + file) + (rank + 1)) as Square;
      const [x, _y, z] = squareToPos(sq, orientation);
      const isBlack = (rank + file) % 2 === 0;

      const isSelected = selected === sq;
      const isLegal = legalTargets.includes(sq);
      const isCapture = isLegal && pieces.some((p: any) => p.square === sq);

      let color = isBlack ? '#739552' : '#EBECD0';
      if (isSelected) color = '#f5f682';

      squares.push(
        <group key={sq} position={[x, 0.01, z]}>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onSquareClick(sq);
            }}
            receiveShadow
          >
            <planeGeometry args={[SQUARE_SIZE, SQUARE_SIZE]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {isLegal && !isCapture && (
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.15, 32]} />
              <meshBasicMaterial color="#000" opacity={0.25} transparent />
            </mesh>
          )}
          {isLegal && isCapture && (
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.35, 0.45, 32]} />
              <meshBasicMaterial color="#000" opacity={0.25} transparent />
            </mesh>
          )}
        </group>,
      );
    }
  }
  return <group>{squares}</group>;
}

export default function ChessBoard3D({
  fen,
  orientation = 'white',
  onMove,
  interactive = true,
}: any) {
  const [pieces, setPieces] = useState<PieceData[]>([]);
  const [selected, setSelected] = useState<Square | null>(null);
  const [legalTargets, setLegalTargets] = useState<Square[]>([]);

  const game = useMemo(() => new Chess(fen), [fen]);

  // Sync FEN to pieces with stable IDs for animation
  useEffect(() => {
    const map = fenToPieceMap(fen);

    setPieces((prev) => {
      const usedIds = new Set<string>();

      const newPieces = Object.entries(map)
        .filter(([_, pStr]) => pStr)
        .map(([sq, pStr]) => ({
          square: sq as Square,
          type: pStr!.toLowerCase(),
          color: (pStr === pStr!.toUpperCase() ? 'w' : 'b') as 'w' | 'b',
          id: '',
        }));

      // Pass 1: Exact matches (pieces that stayed on the same square)
      newPieces.forEach((newP) => {
        const existing = prev.find(
          (p) =>
            p.square === newP.square &&
            p.type === newP.type &&
            p.color === newP.color &&
            !usedIds.has(p.id),
        );
        if (existing) {
          usedIds.add(existing.id);
          newP.id = existing.id;
        }
      });

      // Pass 2: Pieces that moved
      newPieces.forEach((newP) => {
        if (!newP.id) {
          const existing = prev.find(
            (p) => p.type === newP.type && p.color === newP.color && !usedIds.has(p.id),
          );
          if (existing) {
            usedIds.add(existing.id);
            newP.id = existing.id;
          } else {
            // New piece (e.g., pawn promotion or board reset)
            const newId = Math.random().toString(36).substring(7);
            usedIds.add(newId);
            newP.id = newId;
          }
        }
      });

      return newPieces;
    });
  }, [fen]);

  const handleSquareClick = useCallback(
    (sq: Square) => {
      if (!interactive) return;

      if (selected && legalTargets.includes(sq)) {
        onMove?.(selected, sq);
        setSelected(null);
        setLegalTargets([]);
        return;
      }

      const pStr = fenToPieceMap(game.fen())[sq];
      const isOwnPiece =
        pStr && (game.turn() === 'w' ? pStr === pStr.toUpperCase() : pStr === pStr.toLowerCase());

      if (pStr && isOwnPiece) {
        setSelected(sq);
        setLegalTargets(getLegalMovesForSquare(game, sq));
        return;
      }

      setSelected(null);
      setLegalTargets([]);
    },
    [interactive, selected, legalTargets, game, onMove],
  );

  return (
    <div className="h-full min-h-[600px] w-full overflow-hidden rounded-lg bg-[#222] ring-4 ring-[#333]">
      <Canvas shadows camera={{ position: [0, 4.5, 5.5], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        <BoardSquares
          orientation={orientation}
          selected={selected}
          legalTargets={legalTargets}
          pieces={pieces}
          onSquareClick={handleSquareClick}
        />

        <group>
          {pieces.map((p) => (
            <Piece
              key={p.id}
              data={p}
              orientation={orientation}
              onClick={handleSquareClick}
              isSelected={selected === p.square}
            />
          ))}
        </group>

        {/* Board Base / Frame */}
        <mesh position={[0, -0.3, 0]} receiveShadow>
          <boxGeometry args={[8 * SQUARE_SIZE + 0.8, 0.5, 8 * SQUARE_SIZE + 0.8]} />
          <meshStandardMaterial color="#333" />
        </mesh>

        {/* Coordinates */}
        <group position={[0, 0, 0]}>
          {Array.from({ length: 8 }).map((_, i) => {
            const isWhite = orientation === 'white';
            const fileStr = String.fromCharCode(97 + (isWhite ? i : 7 - i));
            const rankStr = isWhite ? (8 - i).toString() : (i + 1).toString();
            const pos = i * SQUARE_SIZE - BOARD_OFFSET;

            return (
              <group key={i}>
                {/* Files (a-h) - Bottom edge */}
                <Text
                  position={[pos, 0.01, BOARD_OFFSET + 0.65]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  fontSize={0.25}
                  color="#e5e5e5"
                >
                  {fileStr}
                </Text>
                {/* Files (a-h) - Top edge */}
                <Text
                  position={[pos, 0.01, -(BOARD_OFFSET + 0.65)]}
                  rotation={[-Math.PI / 2, 0, Math.PI]}
                  fontSize={0.25}
                  color="#e5e5e5"
                >
                  {fileStr}
                </Text>
                {/* Ranks (1-8) - Left edge */}
                <Text
                  position={[-(BOARD_OFFSET + 0.65), 0.01, pos]}
                  rotation={[-Math.PI / 2, 0, Math.PI / 2]}
                  fontSize={0.25}
                  color="#e5e5e5"
                >
                  {rankStr}
                </Text>
                {/* Ranks (1-8) - Right edge */}
                <Text
                  position={[BOARD_OFFSET + 0.65, 0.01, pos]}
                  rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
                  fontSize={0.25}
                  color="#e5e5e5"
                >
                  {rankStr}
                </Text>
              </group>
            );
          })}
        </group>

        <ContactShadows position={[0, -0.04, 0]} opacity={0.4} scale={10} blur={2} far={4} />
        <OrbitControls
          enablePan={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
          minDistance={5}
          maxDistance={15}
        />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
