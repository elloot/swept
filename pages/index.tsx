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

  useEffect(() => {
    let indices: number[] = [];
    for (let i = 0; i < width * height; i++) {
      indices.push(i);
    }

    let tempBoard: number[] = Array(width * height);

    tempBoard.fill(0);

    for (let i = 0; i < 99; i++) {
      const tileIndex = indices[Math.floor(Math.random() * indices.length)];
      tempBoard[tileIndex] = 1;
      indices.splice(indices.indexOf(tileIndex), 1);
    }

    setBoard(tempBoard);

    console.log(tempBoard.filter((value) => value == 1).length);
  }, []);

  return (
    <div
      style={{
        width: 300 + 'px',
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
