import * as React from 'react';

interface TileProps {
  width: number;
  height: number;
  handleClick: (index: number) => void;
  index: number;
  value: number;
}

export const Tile: React.FC<TileProps> = ({
  width,
  height,
  handleClick,
  index,
  value
}) => {
  return (
    <div style={{ width: width + 'px', height: height + 'px', margin: '11px' }}>
      {value}
    </div>
  );
};
