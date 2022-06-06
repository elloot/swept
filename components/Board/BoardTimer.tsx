import * as React from 'react';
import { GameState } from '../../types/gameState';

interface BoardTimerProps {
  gameState: GameState;
}

export const BoardTimer: React.FC<BoardTimerProps> = ({ gameState }) => {
  const [seconds, setSeconds] = React.useState(0);
  const [isActive, setIsActive] = React.useState(false);

  function reset() {
    setSeconds(0);
    setIsActive(false);
  }

  function toMinutesAndSeconds(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    seconds = seconds - minutes * 60;
    return `${minutes}:${padWithLeadingZeros(seconds, 2)}`;
  }

  function padWithLeadingZeros(number: number, numberOfDigits: number): string {
    let paddedString = number.toString();
    for (let i = 0; i < numberOfDigits - countDigits(number); i++) {
      paddedString = '0' + paddedString;
    }
    return paddedString;
  }

  function countDigits(number: number): number {
    return number.toString().length;
  }

  React.useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((seconds) => seconds + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  React.useEffect(() => {
    switch (gameState) {
      case 'ONGOING':
        setIsActive(true);
        break;
      case undefined:
        reset();
        break;
      case 'LOST':
      case 'WON':
        setIsActive(false);
        break;
    }
  }, [gameState]);

  return <div className="time">{toMinutesAndSeconds(seconds)}</div>;
};
