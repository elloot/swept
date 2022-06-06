import { GameBoard } from '../types/gameBoard';

function coordsToIndex(x: number, y: number, width: number): number {
  return y * width + x;
}

function indexToCoords(
  index: number,
  board: GameBoard
): { x: number; y: number } {
  return { x: index % board.width, y: Math.floor(index / board.width) };
}

function fillTileArrayWithMineCounts(mineBoard: number[], board: GameBoard) {
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

function countMinesNearTile(tileIndex: number, board: GameBoard): number {
  const tilePos = indexToCoords(tileIndex, board);
  let mineCount = 0;
  forEachCloseTile(tilePos, board, (closeTilePos) => {
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

function generateArrayWithMines(
  board: GameBoard,
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

function generateIndices(board: GameBoard, firstTileIndex: number): number[] {
  let indices: number[] = [];
  for (let i = 0; i < board.width * board.height; i++) {
    indices.push(i);
  }
  forEachCloseTile(
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

function forEachCloseTile(
  centerTilePos: { x: number; y: number },
  board: GameBoard,
  callback: (closeTilePos: { x: number; y: number }) => void
) {
  for (let y = -1; y <= 1; y++) {
    for (let x = -1; x <= 1; x++) {
      if (coordIsInBoard(centerTilePos.x + x, centerTilePos.y + y, board)) {
        callback({ x: centerTilePos.x + x, y: centerTilePos.y + y });
      }
    }
  }
}

function coordIsInBoard(x: number, y: number, board: GameBoard): boolean {
  return x >= 0 && x < board.width && y >= 0 && y < board.height;
}

export {
  coordsToIndex,
  indexToCoords,
  generateArrayWithMines,
  fillTileArrayWithMineCounts,
  forEachCloseTile,
  countMinesNearTile
};
