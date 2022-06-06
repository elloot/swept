import { Tile } from '../Tile';
import {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  generateArrayWithMines,
  fillTileArrayWithMineCounts,
  indexToCoords,
  coordsToIndex,
  forEachCloseTile,
  countMinesNearTile
} from '../../library/board-utils';
import { GameBoard } from '../../types/gameBoard';
import { BoardRestartButton } from './BoardRestartButton';
import { GameState } from '../../types/gameState';

interface BoardProps {}

export const Board: React.FC<BoardProps> = ({}) => {
  const [hasRun, setHasRun] = useState<boolean>(false);
  const [indexOfFirstClickedTile, setIndexOfFirstClickedTile] =
    useState<number>();
  const boardWidth = 30;
  const boardHeight = 16;
  const [tiles, setTiles] = useState<number[]>(
    Array(boardWidth * boardHeight).fill(1)
  );
  const board: GameBoard = useMemo(() => {
    return {
      width: 30,
      height: 16,
      tiles
    };
  }, [tiles]);
  const tileRefs: React.RefObject<Tile>[] = useMemo(() => {
    tiles;
    const goodArray: React.RefObject<Tile>[] = [];
    for (let i = 0; i < boardWidth * boardHeight; i++) {
      goodArray.push(createRef<Tile>());
    }
    return goodArray;
  }, [tiles]);
  const numberOfRenders = useRef(0);
  const [gameState, setGameState] = useState<GameState>('ONGOING');

  function checkIfPlayerHasWon(): void {
    let hasWon = true;
    for (const tileRef of tileRefs) {
      const tile = tileRef.current;
      if (tile.getValue() !== -1) {
        if (tile.getFace() !== 'CLEAR') {
          hasWon = false;
        }
      }
    }
    if (hasWon) {
      setGameState('WON');
    }
  }

  function flagCountNearTileIsCorrect(tileIndex: number): boolean {
    return (
      countClosestFlags(tileIndex) === countMinesNearTile(tileIndex, board)
    );
  }

  const gameOver = useCallback(
    (state: GameState) => {
      for (const tileRef of tileRefs) {
        const tile = tileRef.current;
        if (tile.getValue() === -1) {
          if (state === 'WON') {
            tile.setFace('FLAGGED');
          } else if (tile.getFace() === 'HIDDEN') {
            tile.setFace('MINE');
          }
        }
      }
    },
    [tileRefs]
  );

  function revealClosestIfCorrectlyFlagged(tileIndex: number) {
    if (flagCountNearTileIsCorrect(tileIndex)) {
      if (flagsNearTileAreCorrect(tileIndex, getClosestFlags(tileIndex))) {
        forEachCloseTile(
          indexToCoords(tileIndex, board),
          board,
          (closeTilePos) => {
            const closeTileIndex = coordsToIndex(
              closeTilePos.x,
              closeTilePos.y,
              boardWidth
            );
            const closeTile = tileRefs[closeTileIndex].current;
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
        checkIfPlayerHasWon();
      } else {
        setGameState('LOST');
      }
    }
  }

  function flagsNearTileAreCorrect(tileIndex: number, closestFlags: number[]) {
    let flagsAreCorrect = true;
    forEachCloseTile(indexToCoords(tileIndex, board), board, (closeTilePos) => {
      const closeTile =
        tileRefs[coordsToIndex(closeTilePos.x, closeTilePos.y, boardWidth)]
          .current;
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
    });
    return flagsAreCorrect;
  }

  function getClosestFlags(tileIndex: number): number[] {
    const flags: number[] = [];
    forEachCloseTile(indexToCoords(tileIndex, board), board, (closeTilePos) => {
      const closeTile =
        tileRefs[coordsToIndex(closeTilePos.x, closeTilePos.y, boardWidth)]
          .current;
      if (closeTile.getFace() === 'FLAGGED') {
        flags.push(coordsToIndex(closeTilePos.x, closeTilePos.y, boardWidth));
      }
    });
    return flags;
  }

  function countClosestFlags(tileIndex: number): number {
    let flagCount = 0;
    forEachCloseTile(indexToCoords(tileIndex, board), board, (closeTilePos) => {
      const closeTile =
        tileRefs[coordsToIndex(closeTilePos.x, closeTilePos.y, boardWidth)]
          .current;
      if (closeTile.getFace() === 'FLAGGED') {
        flagCount++;
      }
    });
    return flagCount;
  }

  function highlightClosestHiddenTiles(tileIndex: number) {
    forEachCloseTile(indexToCoords(tileIndex, board), board, (closeTilePos) => {
      const closeTile =
        tileRefs[coordsToIndex(closeTilePos.x, closeTilePos.y, boardWidth)]
          .current;
      if (closeTile.getFace() === 'HIDDEN') {
        closeTile.setFace('HIGHLIGHTED');
      }
    });
  }

  function hideClosestHighlightedTiles(tileIndex: number) {
    forEachCloseTile(indexToCoords(tileIndex, board), board, (closeTilePos) => {
      const closeTile =
        tileRefs[coordsToIndex(closeTilePos.x, closeTilePos.y, boardWidth)]
          .current;
      if (closeTile.getFace() === 'HIGHLIGHTED') {
        closeTile.setFace('HIDDEN');
      }
    });
  }

  function clickHandler(tileIndex: number): void {
    if (!hasRun) {
      setHasRun(true);
      setIndexOfFirstClickedTile(tileIndex);
      setTiles(generateTileArray(tileIndex));
    }

    if (board.tiles[tileIndex] === -1) {
      setGameState('LOST');
      return;
    }

    if (board.tiles[tileIndex] === 0) {
      const visitedZeroTiles = [tileIndex];
      revealClosestTiles(tileIndex, visitedZeroTiles);
    }

    checkIfPlayerHasWon();
  }

  const revealClosestTiles = useCallback(
    (index: number, visitedZeroTiles: number[]) => {
      const tileValue = board.tiles[index];
      if (tileValue === 0) {
        const tilePos = indexToCoords(index, board);
        forEachCloseTile(tilePos, board, (closeTile) => {
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

          tileRefs[closeTileIndex].current.setFace('CLEAR');
        });
      }
    },
    [board, tileRefs]
  );

  function generateTileArray(firstTileIndex: number): number[] {
    const tileArray = generateArrayWithMines(board, firstTileIndex);

    fillTileArrayWithMineCounts(tileArray, board);

    return tileArray;
  }

  useEffect(() => {
    if (numberOfRenders.current < 3) {
      numberOfRenders.current++;
    } else {
      gameOver(gameState);
    }
  }, [gameState, numberOfRenders, gameOver]);

  useEffect(() => {
    if (board.tiles[indexOfFirstClickedTile] === 0) {
      const visitedZeroTiles = [indexOfFirstClickedTile];
      revealClosestTiles(indexOfFirstClickedTile, visitedZeroTiles);
    }
  }, [indexOfFirstClickedTile, board.tiles, revealClosestTiles]);

  function restart() {
    numberOfRenders.current = 1;
    setIndexOfFirstClickedTile(undefined);
    for (const tileRef of tileRefs) {
      const tile = tileRef.current;
      tile.setFace('HIDDEN');
    }
    const newTilesArray = Array(boardWidth * boardHeight).fill(1);
    setTiles(newTilesArray);
    setHasRun(false);
    setGameState('ONGOING');
  }

  function restartButtonClickHandler() {
    restart();
  }

  function generateTileElements(): JSX.Element[] {
    const tileElements = [];
    for (let i = 0; i < board.tiles.length; i++) {
      const tileValue = board.tiles[i];
      const tileRef = tileRefs[i];
      const utilityFunctions = {
        hideClosestHighlightedTiles,
        highlightClosestHiddenTiles,
        revealClosestIfCorrectlyFlagged,
        flagCountNearTileIsCorrect
      };
      tileElements.push(
        <Tile
          width={10}
          height={10}
          handleClick={clickHandler}
          value={tileValue}
          index={i}
          key={i}
          ref={tileRef}
          {...utilityFunctions}
        />
      );
    }
    return tileElements;
  }

  return (
    <>
      <BoardRestartButton
        clickHandler={restartButtonClickHandler}
        gameState={gameState}
      />
      <div className="board" onContextMenu={(e) => e.preventDefault()}>
        {generateTileElements()}
      </div>
    </>
  );
};