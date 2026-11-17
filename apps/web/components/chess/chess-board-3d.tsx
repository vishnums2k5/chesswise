'use client';
import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import { Square, Chess, fenToPieceMap, getLegalMovesForSquare } from '@chesswise/chess-core';
import { Text } from '@react-three/drei';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        color={data.color === 'w' ? '#f5f5f7' : '#26272e'}
        emissive={isSelected ? (data.color === 'w' ? '#c9a24b' : '#d4af37') : '#000000'}
        emissiveIntensity={isSelected ? 0.4 : 0}
        metalness={data.color === 'w' ? 0.08 : 0.22}
        roughness={data.color === 'w' ? 0.16 : 0.22}
        clearcoat={0.9}
        clearcoatRoughness={0.12}
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
      if (isSelected) color = '#f7d070';

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
            <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
          </mesh>
          {isLegal && !isCapture && (
            <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.16, 32]} />
              <meshBasicMaterial
                color={isBlack ? '#1b3320' : '#475569'}
                opacity={0.4}
                transparent
              />
            </mesh>
          )}
          {isLegal && isCapture && (
            <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.34, 0.44, 32]} />
              <meshBasicMaterial color="#ef4444" opacity={0.65} transparent />
            </mesh>
          )}
        </group>,
      );
    }
  }
  return <group>{squares}</group>;
}

interface ChessBoard3DProps {
  fen: string;
  orientation?: 'white' | 'black';
  onMove?: (from: Square, to: Square) => void;
  interactive?: boolean;
  className?: string;
}

export default function ChessBoard3D({
  fen,
  orientation = 'white',
  onMove,
  interactive = true,
  className,
}: ChessBoard3DProps) {
  const [pieces, setPieces] = useState<PieceData[]>([]);
  const [selected, setSelected] = useState<Square | null>(null);
  const [legalTargets, setLegalTargets] = useState<Square[]>([]);
  const controlsRef = useRef<any>(null);

  const game = useMemo(() => new Chess(fen), [fen]);

  const handleResetCamera = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, []);

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
    <div
      className={cn(
        'relative aspect-square w-full select-none overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-b from-[#181a20] via-[#121318] to-[#0c0d12] shadow-2xl ring-1 ring-white/5',
        className,
      )}
    >
      {/* Floating 3D HUD Controls */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between p-3">
        <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white/75 shadow-sm backdrop-blur-md">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          <span>3D Studio</span>
          <span className="text-white/40">•</span>
          <span className="hidden text-white/50 sm:inline">Drag to rotate • Scroll to zoom</span>
        </div>

        <button
          type="button"
          onClick={handleResetCamera}
          className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white/80 shadow-sm backdrop-blur-md transition-all hover:border-white/20 hover:bg-black/80 hover:text-white active:scale-95"
          title="Reset 3D camera to default orientation"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset View</span>
        </button>
      </div>

      <Canvas
        shadows
        camera={{ position: [0, 5.8, 6.2], fov: 52 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[8, 14, 10]}
          intensity={1.1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={25}
          shadow-camera-left={-6}
          shadow-camera-right={6}
          shadow-camera-top={6}
          shadow-camera-bottom={-6}
          shadow-bias={-0.0005}
        />
        <pointLight position={[-8, 6, -8]} intensity={0.35} color="#8ab4f8" />

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
          <meshStandardMaterial color="#1a1c23" roughness={0.45} metalness={0.12} />
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
                  color="#94a3b8"
                >
                  {fileStr}
                </Text>
                {/* Files (a-h) - Top edge */}
                <Text
                  position={[pos, 0.01, -(BOARD_OFFSET + 0.65)]}
                  rotation={[-Math.PI / 2, 0, Math.PI]}
                  fontSize={0.25}
                  color="#94a3b8"
                >
                  {fileStr}
                </Text>
                {/* Ranks (1-8) - Left edge */}
                <Text
                  position={[-(BOARD_OFFSET + 0.65), 0.01, pos]}
                  rotation={[-Math.PI / 2, 0, Math.PI / 2]}
                  fontSize={0.25}
                  color="#94a3b8"
                >
                  {rankStr}
                </Text>
                {/* Ranks (1-8) - Right edge */}
                <Text
                  position={[BOARD_OFFSET + 0.65, 0.01, pos]}
                  rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
                  fontSize={0.25}
                  color="#94a3b8"
                >
                  {rankStr}
                </Text>
              </group>
            );
          })}
        </group>

        <ContactShadows position={[0, -0.04, 0]} opacity={0.45} scale={11} blur={2} far={4} />
        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableDamping={true}
          dampingFactor={0.06}
          rotateSpeed={0.8}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.3}
          minDistance={5.5}
          maxDistance={14}
        />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
