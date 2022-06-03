import { Tile } from '../components/Tile';
import { createRef, useCallback, useEffect, useRef, useState } from 'react';
import {
  generateBoardWithMines,
  fillBoardWithMineCounts,
  indexToCoords,
  coordsToIndex,
  iterateOverClosestTiles,
  countMinesNearTile
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
  const [playerHasLost, setPlayerHasLost] = useState<boolean>(false);
  const numberOfRenders = useRef(0);

  function gameOver() {
    const shouldReload = confirm('You lost\n\nConfirm to reload').valueOf();
    if (shouldReload) window.location.reload();
  }

  function revealNearestIfCorrectlyFlagged(tileIndex: number) {
    if (
      countNearestFlags(tileIndex) ===
      countMinesNearTile(tileIndex, board, boardWidth, boardHeight)
    ) {
      if (flagsNearTileAreValid(tileIndex, getNearestFlags(tileIndex))) {
        iterateOverClosestTiles(
          indexToCoords(tileIndex, boardWidth),
          boardWidth,
          boardHeight,
          (closeTilePos) => {
            const closeTileIndex = coordsToIndex(
              closeTilePos.x,
              closeTilePos.y,
              boardWidth
            );
            const closeTile = tiles[closeTileIndex].current;
            if (
              closeTile.getValue() !== -1 &&
              (closeTile.getFace() === 'HIDDEN' ||
                closeTile.getFace() === 'HIGHLIGHTED')
            ) {
              closeTile.setFace('CLEAR');
              if (closeTile.getValue() === 0) {
                revealClosestTiles(closeTileIndex, [closeTileIndex]);
              }
            }
          }
        );
      } else {
        setPlayerHasLost(true);
      }
    }
  }

  function flagsNearTileAreValid(tileIndex: number, nearestFlags: number[]) {
    let flagsAreValid = true;
    iterateOverClosestTiles(
      indexToCoords(tileIndex, boardWidth),
      boardWidth,
      boardHeight,
      (closeTilePos) => {
        const closeTile =
          tiles[coordsToIndex(closeTilePos.x, closeTilePos.y, boardWidth)]
            .current;
        if (closeTile.getValue() === -1) {
          if (
            !nearestFlags.includes(
              coordsToIndex(closeTilePos.x, closeTilePos.y, boardWidth)
            )
          ) {
            console.log(closeTilePos, nearestFlags);
            flagsAreValid = false;
            return;
          }
        }
      }
    );
    return flagsAreValid;
  }

  function getNearestFlags(tileIndex: number): number[] {
    const flags: number[] = [];
    iterateOverClosestTiles(
      indexToCoords(tileIndex, boardWidth),
      boardWidth,
      boardHeight,
      (closeTilePos) => {
        const closeTile =
          tiles[coordsToIndex(closeTilePos.x, closeTilePos.y, boardWidth)]
            .current;
        if (closeTile.getFace() === 'FLAGGED') {
          flags.push(coordsToIndex(closeTilePos.x, closeTilePos.y, boardWidth));
        }
      }
    );
    return flags;
  }

  function countNearestFlags(tileIndex: number): number {
    let flagCount = 0;
    iterateOverClosestTiles(
      indexToCoords(tileIndex, boardWidth),
      boardWidth,
      boardHeight,
      (closeTilePos) => {
        const closeTile =
          tiles[coordsToIndex(closeTilePos.x, closeTilePos.y, boardWidth)]
            .current;
        if (closeTile.getFace() === 'FLAGGED') {
          flagCount++;
        }
      }
    );
    return flagCount;
  }

  function highlightNearestHiddenTiles(tileIndex: number) {
    iterateOverClosestTiles(
      indexToCoords(tileIndex, boardWidth),
      boardWidth,
      boardHeight,
      (closeTilePos) => {
        const closeTile =
          tiles[coordsToIndex(closeTilePos.x, closeTilePos.y, boardWidth)]
            .current;
        if (closeTile.getFace() === 'HIDDEN') {
          closeTile.setFace('HIGHLIGHTED');
        }
      }
    );
  }

  function hideNearestHighlightedTiles(tileIndex: number) {
    iterateOverClosestTiles(
      indexToCoords(tileIndex, boardWidth),
      boardWidth,
      boardHeight,
      (closeTilePos) => {
        const closeTile =
          tiles[coordsToIndex(closeTilePos.x, closeTilePos.y, boardWidth)]
            .current;
        if (closeTile.getFace() === 'HIGHLIGHTED') {
          closeTile.setFace('HIDDEN');
        }
      }
    );
  }

  function clickHandler(tileIndex: number): void {
    if (!hasRun) {
      setHasRun(true);
      setBoard(generateBoard(tileIndex));
      setIndexOfFirstClickedTile(tileIndex);
    }

    if (board[tileIndex] === -1) {
      setPlayerHasLost(true);
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

  function generateBoard(firstTileIndex: number): number[] {
    const tempBoard = generateBoardWithMines(
      boardWidth,
      boardHeight,
      firstTileIndex
    );

    fillBoardWithMineCounts(tempBoard, boardWidth, boardHeight);

    return tempBoard;
  }

  useEffect(() => {
    if (numberOfRenders.current < 2) {
      numberOfRenders.current++;
    } else if (playerHasLost) {
      gameOver();
    }
  }, [playerHasLost, numberOfRenders]);

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
            hideNearestHighlightedTiles={hideNearestHighlightedTiles}
            highlightNearestHiddenTiles={highlightNearestHiddenTiles}
            revealNearestIfCorrectlyFlagged={revealNearestIfCorrectlyFlagged}
          />
        );
      })}
    </div>
  );
}
