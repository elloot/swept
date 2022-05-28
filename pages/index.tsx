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

  function indexToCoords(index: number) {
    return { x: index % width, y: Math.floor(index / width) };
  }

  function clickHandler(index: number): void {
    if (!hasRun) {
      setHasRun(true);
      generateBoard(index);
      setIndexOfFirstClickedTile(index);
    }

    if (board[index] === 0) {
      const visitedZeroTiles = [index];
      revealClosestTiles(index, visitedZeroTiles);
    }
  }

  const revealClosestTiles = useCallback(
    (index, visitedZeroTiles) => {
      const tileNumber = board[index];
      const tilePos = indexToCoords(index);
      if (tileNumber === 0) {
        for (let y = -1; y <= 1; y++) {
          for (let x = -1; x <= 1; x++) {
            if (
              tilePos.x + x >= 0 &&
              tilePos.x + x < width &&
              tilePos.y + y >= 0 &&
              tilePos.y + y < height
            ) {
              const currentTilePos = coordsToIndex(
                tilePos.x + x,
                tilePos.y + y
              );

              if (
                board[currentTilePos] === 0 &&
                !visitedZeroTiles.includes(currentTilePos)
              ) {
                visitedZeroTiles.push(currentTilePos);
                revealClosestTiles(currentTilePos, visitedZeroTiles);
              }

              if (tiles[currentTilePos] == undefined) {
                console.log(currentTilePos);
              }

              tiles[currentTilePos].current.setFace('CLEAR');
            }
          }
        }
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
      const currentTile = tempBoard[i];
      const currentTilePos = indexToCoords(i);
      let mineCount = 0;
      if (currentTile === 0) {
        for (let y = -1; y <= 1; y++) {
          for (let x = -1; x <= 1; x++) {
            if (
              currentTilePos.x + x >= 0 &&
              currentTilePos.x + x < width &&
              currentTilePos.y + y >= 0 &&
              currentTilePos.y + y < height
            ) {
              if (
                tempBoard[
                  coordsToIndex(currentTilePos.x + x, currentTilePos.y + y)
                ] == -1
              ) {
                mineCount++;
              }
            }
          }
        }
        tempBoard[i] = mineCount;
      }
    }

    setBoard(tempBoard);

    return tempBoard;
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
