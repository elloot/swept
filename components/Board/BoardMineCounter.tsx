import * as React from 'react';

interface BoardMineCounterProps {
  numberOfFlags: number;
}

export const BoardMineCounter: React.FC<BoardMineCounterProps> = ({
  numberOfFlags
}) => {
  return (
    <>
      <span>{numberOfFlags}</span>
    </>
  );
};
