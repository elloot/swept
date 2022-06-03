import { Tile } from '../components/Tile';
import {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  generateBoardWithMines as generateArrayWithMines,
  fillBoardWithMineCounts as fillTileArrayWithMineCounts,
  indexToCoords,
  coordsToIndex,
  iterateOverClosestTiles,
  countMinesNearTile
} from '../library/board-utils';
import { Board } from '../types/board';

export default function Home() {
  const [hasRun, setHasRun] = useState<boolean>(false);
  const [indexOfFirstClickedTile, setIndexOfFirstClickedTile] =
    useState<number>();
  const boardWidth = 30;
  const boardHeight = 16;
  const [tiles, setTiles] = useState<number[]>(
    Array(boardWidth * boardHeight).fill(1)
  );
  const board: Board = useMemo(() => {
    return {
      width: 30,
      height: 16,
      tiles
    };
  }, [tiles]);
  const tileElements: React.RefObject<Tile>[] = useMemo(() => {
    tiles;
    return [];
  }, [tiles]);
  const [playerHasLost, setPlayerHasLost] = useState<boolean>(false);
  const numberOfRenders = useRef(0);

  function flagCountNearTileIsCorrect(tileIndex: number): boolean {
    return (
      countClosestFlags(tileIndex) === countMinesNearTile(tileIndex, board)
    );
  }

  function gameOver() {
    const shouldReload = confirm('You lost\n\nConfirm to reload').valueOf();
    if (shouldReload) window.location.reload();
  }

  function revealClosestIfCorrectlyFlagged(tileIndex: number) {
    if (flagCountNearTileIsCorrect(tileIndex)) {
      if (flagsNearTileAreCorrect(tileIndex, getClosestFlags(tileIndex))) {
        iterateOverClosestTiles(
          indexToCoords(tileIndex, board),
          board,
          (closeTilePos) => {
            const closeTileIndex = coordsToIndex(
              closeTilePos.x,
              closeTilePos.y,
              boardWidth
            );
            const closeTile = tileElements[closeTileIndex].current;
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

  function flagsNearTileAreCorrect(tileIndex: number, closestFlags: number[]) {
    let flagsAreCorrect = true;
    iterateOverClosestTiles(
      indexToCoords(tileIndex, board),
      board,
      (closeTilePos) => {
        const closeTile =
          tileElements[
            coordsToIndex(closeTilePos.x, closeTilePos.y, boardWidth)
          ].current;
        if (closeTile.getValue() === -1) {
          if (
            !closestFlags.includes(
              coordsToIndex(closeTilePos.x, closeTilePos.y, boardWidth)
            )
          ) {
            flagsAreCorrect = false;
            return;
          }
        }
      }
    );
    return flagsAreCorrect;
  }

  function getClosestFlags(tileIndex: number): number[] {
    const flags: number[] = [];
    iterateOverClosestTiles(
      indexToCoords(tileIndex, board),
      board,
      (closeTilePos) => {
        const closeTile =
          tileElements[
            coordsToIndex(closeTilePos.x, closeTilePos.y, boardWidth)
          ].current;
        if (closeTile.getFace() === 'FLAGGED') {
          flags.push(coordsToIndex(closeTilePos.x, closeTilePos.y, boardWidth));
        }
      }
    );
    return flags;
  }

  function countClosestFlags(tileIndex: number): number {
    let flagCount = 0;
    iterateOverClosestTiles(
      indexToCoords(tileIndex, board),
      board,
      (closeTilePos) => {
        const closeTile =
          tileElements[
            coordsToIndex(closeTilePos.x, closeTilePos.y, boardWidth)
          ].current;
        if (closeTile.getFace() === 'FLAGGED') {
          flagCount++;
        }
      }
    );
    return flagCount;
  }

  function highlightClosestHiddenTiles(tileIndex: number) {
    iterateOverClosestTiles(
      indexToCoords(tileIndex, board),
      board,
      (closeTilePos) => {
        const closeTile =
          tileElements[
            coordsToIndex(closeTilePos.x, closeTilePos.y, boardWidth)
          ].current;
        if (closeTile.getFace() === 'HIDDEN') {
          closeTile.setFace('HIGHLIGHTED');
        }
      }
    );
  }

  function hideClosestHighlightedTiles(tileIndex: number) {
    iterateOverClosestTiles(
      indexToCoords(tileIndex, board),
      board,
      (closeTilePos) => {
        const closeTile =
          tileElements[
            coordsToIndex(closeTilePos.x, closeTilePos.y, boardWidth)
          ].current;
        if (closeTile.getFace() === 'HIGHLIGHTED') {
          closeTile.setFace('HIDDEN');
        }
      }
    );
  }

  function clickHandler(tileIndex: number): void {
    if (!hasRun) {
      setHasRun(true);
      setIndexOfFirstClickedTile(tileIndex);
      setTiles(generateTileArray(tileIndex));
    }

    if (board.tiles[tileIndex] === -1) {
      setPlayerHasLost(true);
    }

    if (board.tiles[tileIndex] === 0) {
      const visitedZeroTiles = [tileIndex];
      revealClosestTiles(tileIndex, visitedZeroTiles);
    }
  }

  const revealClosestTiles = useCallback(
    (index: number, visitedZeroTiles: number[]) => {
      const tileValue = board.tiles[index];
      if (tileValue === 0) {
        const tilePos = indexToCoords(index, board);
        iterateOverClosestTiles(tilePos, board, (closeTile) => {
          const closeTileIndex = coordsToIndex(
            closeTile.x,
            closeTile.y,
            boardWidth
          );
          if (
            board.tiles[closeTileIndex] === 0 &&
            !visitedZeroTiles.includes(closeTileIndex)
          ) {
            visitedZeroTiles.push(closeTileIndex);
            revealClosestTiles(closeTileIndex, visitedZeroTiles);
          }

          tileElements[closeTileIndex].current.setFace('CLEAR');
        });
      }
    },
    [board, tileElements]
  );

  function generateTileArray(firstTileIndex: number): number[] {
    const tileArray = generateArrayWithMines(board, firstTileIndex);

    fillTileArrayWithMineCounts(tileArray, board);

    return tileArray;
  }

  useEffect(() => {
    if (numberOfRenders.current < 2) {
      numberOfRenders.current++;
    } else if (playerHasLost) {
      gameOver();
    }
  }, [playerHasLost, numberOfRenders]);

  useEffect(() => {
    if (board.tiles[indexOfFirstClickedTile] === 0) {
      const visitedZeroTiles = [indexOfFirstClickedTile];
      revealClosestTiles(indexOfFirstClickedTile, visitedZeroTiles);
    }
  }, [indexOfFirstClickedTile, board.tiles, revealClosestTiles]);

  return (
    <div
      style={{
        width: 988 + 'px',
        height: 'auto',
        display: 'flex',
        flexWrap: 'wrap'
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {board.tiles.map((value, index) => {
        const tileRef = createRef<Tile>();
        tileElements.push(tileRef);
        const utilityFunctions = {
          hideClosestHighlightedTiles,
          highlightClosestHiddenTiles,
          revealClosestIfCorrectlyFlagged,
          flagCountNearTileIsCorrect
        };
        return (
          <Tile
            width={10}
            height={10}
            handleClick={clickHandler}
            value={value}
            index={index}
            key={index}
            ref={tileRef}
            {...utilityFunctions}
          />
        );
      })}
    </div>
  );
}
