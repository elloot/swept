import { Tile } from '../components/Tile';
import { useEffect, useState } from 'react';

export default function Home() {
  const width = 30;
  const height = 16;
  //const board: number[] = Array(width * height);
  const [board, setBoard] = useState<number[]>(Array(width * height));

  function coordsToIndex(x: number, y: number) {
    return y * width + x;
  }

  function indexToCoords(index: number) {
    return { x: index % width, y: Math.floor(index / width) };
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

    const tempTempBoard = tempBoard.slice();

    for (let i = 0; i < tempBoard.length; i++) {
      const currentTile = tempBoard[i];
      const currentTilePos = indexToCoords(i);
      console.log(currentTilePos.x, currentTilePos.y);
      let mineCount = 0;
      if (currentTile !== -1) {
        for (let y = -1; y <= 1; y++) {
          for (let x = -1; x <= 1; x++) {
            if (
              currentTilePos.x + x > 0 &&
              currentTilePos.x + x < width &&
              currentTilePos.y + y > 0 &&
              currentTilePos.y < height
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
        tempTempBoard[i] = mineCount;
      }
    }

    setBoard(tempTempBoard);

    console.log(tempBoard.filter((value) => value == 1).length);
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
      {board.map((value, index) => (
        <Tile
          width={10}
          height={10}
          handleClick={() => null}
          value={value}
          index={index}
          key={index}
        />
      ))}
    </div>
  );
}
