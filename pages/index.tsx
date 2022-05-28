import { Tile } from '../components/Tile';
import { createRef, useEffect, useState } from 'react';

export default function Home() {
  const width = 30;
  const height = 16;
  const [board, setBoard] = useState<number[]>(Array(width * height));
  const tiles: React.RefObject<Tile>[] = [];

  function coordsToIndex(x: number, y: number) {
    return y * width + x;
  }

  function indexToCoords(index: number) {
    return { x: index % width, y: Math.floor(index / width) };
  }

  function clickHandler(index: number): void {
    if (board[index] === 0) {
      const visitedZeroTiles = [index];
      revealClosestTiles(index, visitedZeroTiles);
    }
  }

  function revealClosestTiles(index: number, visitedZeroTiles: number[]): void {
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
            const currentTilePos = coordsToIndex(tilePos.x + x, tilePos.y + y);

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
  }

  useEffect(() => {
    let indices: number[] = [];
    for (let i = 0; i < width * height; i++) {
      indices.push(i);
    }

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
  }, []);

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
