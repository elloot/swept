function coordsToIndex(x: number, y: number, width: number): number {
  return y * width + x;
}

function indexToCoords(index: number, width: number): { x: number; y: number } {
  return { x: index % width, y: Math.floor(index / width) };
}

function fillBoardWithMineCounts(
  mineBoard: number[],
  boardWidth: number,
  boardHeight: number
) {
  for (let tileIndex = 0; tileIndex < mineBoard.length; tileIndex++) {
    const tileValue = mineBoard[tileIndex];
    if (tileValue === 0) {
      const mineCount = countMinesNearTile(
        tileIndex,
        mineBoard,
        boardWidth,
        boardHeight
      );
      mineBoard[tileIndex] = mineCount;
    }
  }
}

function countMinesNearTile(
  tileIndex: number,
  tileBoard: number[],
  boardWidth: number,
  boardHeight: number
): number {
  const tilePos = indexToCoords(tileIndex, boardWidth);
  let mineCount = 0;
  iterateOverClosestTiles(tilePos, boardWidth, boardHeight, (closeTilePos) => {
    if (
      tileBoard[coordsToIndex(closeTilePos.x, closeTilePos.y, boardWidth)] == -1
    ) {
      mineCount++;
    }
  });
  return mineCount;
}

function generateBoardWithMines(
  width: number,
  height: number,
  firstTileIndex: number
): number[] {
  const tempBoard: number[] = Array(width * height);
  tempBoard.fill(0);
  const indices = generateIndices(width, height, firstTileIndex);

  for (let i = 0; i < 99; i++) {
    const tileIndex = indices[Math.floor(Math.random() * indices.length)];
    tempBoard[tileIndex] = -1;
    indices.splice(indices.indexOf(tileIndex), 1);
  }

  return tempBoard;
}

function generateIndices(
  width: number,
  height: number,
  firstTileIndex: number
): number[] {
  let indices: number[] = [];
  for (let i = 0; i < width * height; i++) {
    indices.push(i);
  }
  iterateOverClosestTiles(
    indexToCoords(firstTileIndex, width),
    width,
    height,
    (closeTilePos) => {
      const closeTileIndex = coordsToIndex(
        closeTilePos.x,
        closeTilePos.y,
        width
      );
      indices.splice(indices.indexOf(closeTileIndex), 1);
    }
  );
  indices.splice(indices.indexOf(firstTileIndex));
  return indices;
}

function iterateOverClosestTiles(
  centerTilePos: { x: number; y: number },
  boardWidth: number,
  boardHeight: number,
  callback: (closeTilePos: { x: number; y: number }) => void
) {
  for (let y = -1; y <= 1; y++) {
    for (let x = -1; x <= 1; x++) {
      if (
        centerTilePos.x + x >= 0 &&
        centerTilePos.x + x < boardWidth &&
        centerTilePos.y + y >= 0 &&
        centerTilePos.y + y < boardHeight
      ) {
        callback({ x: centerTilePos.x + x, y: centerTilePos.y + y });
      }
    }
  }
}

export {
  coordsToIndex,
  indexToCoords,
  generateBoardWithMines,
  fillBoardWithMineCounts,
  iterateOverClosestTiles,
  countMinesNearTile
};
