import { Tile } from '../components/Tile';
import { createRef, useCallback, useEffect, useMemo, useState } from 'react';
import {
  generateBoardWithMines,
  fillBoardWithMineCounts,
  indexToCoords,
  coordsToIndex,
  iterateOverClosestTiles
} from '../library/board-utils';

export default function Home() {
  const [hasRun, setHasRun] = useState<boolean>(false);
  const [indexOfFirstClickedTile, setIndexOfFirstClickedTile] =
    useState<number>();
  const boardWidth = 30;
  const boardHeight = 16;
  const [board, setBoard] = useState<number[]>(
    Array(boardWidth * boardHeight).fill(1)
  );
  const tiles: React.RefObject<Tile>[] = [];

  function clickHandler(tileIndex: number): void {
    if (!hasRun) {
      setHasRun(true);
      setBoard(generateBoard(tileIndex));
      setIndexOfFirstClickedTile(tileIndex);
    }

    if (board[tileIndex] === 0) {
      const visitedZeroTiles = [tileIndex];
      revealClosestTiles(tileIndex, visitedZeroTiles);
    }
  }

  const revealClosestTiles = useCallback(
    (index: number, visitedZeroTiles: number[]) => {
      const tileValue = board[index];
      if (tileValue === 0) {
        const tilePos = indexToCoords(index, boardWidth);
        iterateOverClosestTiles(
          tilePos,
          boardWidth,
          boardHeight,
          (closeTile) => {
            const closeTileIndex = coordsToIndex(
              closeTile.x,
              closeTile.y,
              boardWidth
            );
            if (
              board[closeTileIndex] === 0 &&
              !visitedZeroTiles.includes(closeTileIndex)
            ) {
              visitedZeroTiles.push(closeTileIndex);
              revealClosestTiles(closeTileIndex, visitedZeroTiles);
            }

            tiles[closeTileIndex].current.setFace('CLEAR');
          }
        );
      }
    },
    [board, tiles]
  );

  function generateBoard(firstTileIndex: number) {
    const tempBoard = generateBoardWithMines(
      boardWidth,
      boardHeight,
      firstTileIndex
    );

    fillBoardWithMineCounts(tempBoard, boardWidth, boardHeight);

    return tempBoard;
  }

  useEffect(() => {
    if (board[indexOfFirstClickedTile] === 0) {
      const visitedZeroTiles = [indexOfFirstClickedTile];
      revealClosestTiles(indexOfFirstClickedTile, visitedZeroTiles);
    }
  }, [indexOfFirstClickedTile, board, revealClosestTiles]);

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
