import { Tile } from '../components/Tile';
import { createRef, useCallback, useEffect, useMemo, useState } from 'react';

export default function Home() {
  const [hasRun, setHasRun] = useState<boolean>(false);
  const [indexOfFirstClickedTile, setIndexOfFirstClickedTile] =
    useState<number>();
  const width = 30;
  const height = 16;
  const [board, setBoard] = useState<number[]>(Array(width * height).fill(1));
  const tiles: React.RefObject<Tile>[] = [];

  function coordsToIndex(x: number, y: number) {
    return y * width + x;
  }

  function indexToCoords(index: number): { x: number; y: number } {
    return { x: index % width, y: Math.floor(index / width) };
  }

  function clickHandler(index: number): void {
    if (!hasRun) {
      setHasRun(true);
      setBoard(generateBoard(index));
      setIndexOfFirstClickedTile(index);
    }

    if (board[index] === 0) {
      const visitedZeroTiles = [index];
      revealClosestTiles(index, visitedZeroTiles);
    }
  }

  const revealClosestTiles = useCallback(
    (index, visitedZeroTiles) => {
      const tileValue = board[index];
      if (tileValue === 0) {
        const tilePos = indexToCoords(index);
        iterateOverClosestTiles(tilePos, (closeTile) => {
          const closeTileIndex = coordsToIndex(closeTile.x, closeTile.y);
          if (
            board[closeTileIndex] === 0 &&
            !visitedZeroTiles.includes(closeTileIndex)
          ) {
            visitedZeroTiles.push(closeTileIndex);
            revealClosestTiles(closeTileIndex, visitedZeroTiles);
          }

          tiles[closeTileIndex].current.setFace('CLEAR');
        });
      }
    },
    [board, tiles]
  );

  useEffect(() => {
    if (board[indexOfFirstClickedTile] === 0) {
      const visitedZeroTiles = [indexOfFirstClickedTile];
      revealClosestTiles(indexOfFirstClickedTile, visitedZeroTiles);
    }
  }, [indexOfFirstClickedTile, board, revealClosestTiles]);

  function generateBoard(firstTileIndex: number) {
    let indices: number[] = [];
    for (let i = 0; i < width * height; i++) {
      indices.push(i);
    }

    indices.splice(indices.indexOf(firstTileIndex), 1);

    let tempBoard: number[] = Array(width * height);

    tempBoard.fill(0);

    for (let i = 0; i < 99; i++) {
      const tileIndex = indices[Math.floor(Math.random() * indices.length)];
      tempBoard[tileIndex] = -1;
      indices.splice(indices.indexOf(tileIndex), 1);
    }

    for (let i = 0; i < tempBoard.length; i++) {
      const tileValue = tempBoard[i];
      let mineCount = 0;
      if (tileValue === 0) {
        const tilePos = indexToCoords(i);
        iterateOverClosestTiles(tilePos, (closeTile) => {
          if (tempBoard[coordsToIndex(closeTile.x, closeTile.y)] == -1) {
            mineCount++;
          }
        });
        tempBoard[i] = mineCount;
      }
    }

    return tempBoard;
  }

  function iterateOverClosestTiles(
    centerTilePos: { x: number; y: number },
    callback: (closeTile: { x: number; y: number }) => void
  ) {
    for (let y = -1; y <= 1; y++) {
      for (let x = -1; x <= 1; x++) {
        if (
          centerTilePos.x + x >= 0 &&
          centerTilePos.x + x < width &&
          centerTilePos.y + y >= 0 &&
          centerTilePos.y + y < height
        ) {
          callback({ x: centerTilePos.x + x, y: centerTilePos.y + y });
        }
      }
    }
  }

  return (
    <div
      style={{
        width: 988 + 'px',
        height: 'auto',
        display: 'flex',
        flexWrap: 'wrap'
      }}
    >
      {board.map((value, index) => {
        const tileRef = createRef<Tile>();
        tiles.push(tileRef);
        return (
          <Tile
            width={10}
            height={10}
            handleClick={clickHandler}
            value={value}
            index={index}
            key={index}
            ref={tileRef}
          />
        );
      })}
    </div>
  );
}
