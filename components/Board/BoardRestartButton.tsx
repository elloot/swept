import * as React from 'react';
import styles from './BoardRestartButton.module.scss';
import { GameState } from '../../types/gameState';

interface BoardRestartButtonProps {
  clickHandler: () => void;
  gameState: GameState;
}

export const BoardRestartButton: React.FC<BoardRestartButtonProps> = ({
  clickHandler,
  gameState
}) => {
  return (
    <>
      <button className={styles.button} onClick={clickHandler}>
        <span>
          {(() => {
            switch (gameState) {
              case 'LOST':
                return '😵';
              case undefined:
              case 'ONGOING':
                return '🙂';
              case 'WON':
                return '😎';
            }
          })()}
        </span>
      </button>
    </>
  );
};
