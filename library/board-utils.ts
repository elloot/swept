import { Board } from '../types/board';

function coordsToIndex(x: number, y: number, width: number): number {
  return y * width + x;
}

function indexToCoords(index: number, board: Board): { x: number; y: number } {
  return { x: index % board.width, y: Math.floor(index / board.width) };
}

function fillBoardWithMineCounts(mineBoard: number[], board: Board) {
  for (let tileIndex = 0; tileIndex < mineBoard.length; tileIndex++) {
    const tileValue = mineBoard[tileIndex];
    if (tileValue === 0) {
      const mineCount = countMinesNearTile(tileIndex, {
        width: board.width,
        height: board.height,
        tiles: mineBoard
      });
      mineBoard[tileIndex] = mineCount;
    }
  }
}

function countMinesNearTile(tileIndex: number, board: Board): number {
  const tilePos = indexToCoords(tileIndex, board);
  let mineCount = 0;
  iterateOverClosestTiles(tilePos, board, (closeTilePos) => {
    if (
      board.tiles[
        coordsToIndex(closeTilePos.x, closeTilePos.y, board.width)
      ] === -1
    ) {
      mineCount++;
    }
  });
  return mineCount;
}

function generateBoardWithMines(
  board: Board,
  firstTileIndex: number
): number[] {
  const tempBoard: number[] = Array(board.width * board.height);
  tempBoard.fill(0);
  const indices = generateIndices(board, firstTileIndex);

  for (let i = 0; i < 99; i++) {
    const tileIndex = indices[Math.floor(Math.random() * indices.length)];
    tempBoard[tileIndex] = -1;
    indices.splice(indices.indexOf(tileIndex), 1);
  }

  return tempBoard;
}

function generateIndices(board: Board, firstTileIndex: number): number[] {
  let indices: number[] = [];
  for (let i = 0; i < board.width * board.height; i++) {
    indices.push(i);
  }
  iterateOverClosestTiles(
    indexToCoords(firstTileIndex, board),
    board,
    (closeTilePos) => {
      const closeTileIndex = coordsToIndex(
        closeTilePos.x,
        closeTilePos.y,
        board.width
      );
      indices.splice(indices.indexOf(closeTileIndex), 1);
    }
  );
  indices.splice(indices.indexOf(firstTileIndex));
  return indices;
}

function iterateOverClosestTiles(
  centerTilePos: { x: number; y: number },
  board: Board,
  callback: (closeTilePos: { x: number; y: number }) => void
) {
  for (let y = -1; y <= 1; y++) {
    for (let x = -1; x <= 1; x++) {
      if (
        centerTilePos.x + x >= 0 &&
        centerTilePos.x + x < board.width &&
        centerTilePos.y + y >= 0 &&
        centerTilePos.y + y < board.height
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
