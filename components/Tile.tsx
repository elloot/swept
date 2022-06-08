import * as React from 'react';
import styles from './Tile.module.scss';
import { GameState } from '../types/gameState';

interface TileProps {
  index: number;
  value: number;
  gameState: GameState;
  handleClick: (index: number) => void;
  handleMouseDown: (
    index: number
  ) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  handleMouseUp: (
    index: number
  ) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

type Face = 'HIDDEN' | 'FLAGGED' | 'CLEAR' | 'MINE' | 'HIGHLIGHTED';

export class Tile extends React.Component<TileProps> {
  state: { face: Face };

  constructor(props: TileProps) {
    super(props);
    this.state = { face: 'HIDDEN' };
  }

  setFace(value: Face): void {
    this.setState({ face: value });
  }

  getFace(): Face {
    return this.state.face;
  }

  getValue(): number {
    return this.props.value;
  }

  render() {
    return (
      <div
        onClick={(e) => {
          if (this.props.gameState !== 'LOST') {
            if (this.getFace() !== 'FLAGGED') {
              this.setFace(this.props.value === -1 ? 'MINE' : 'CLEAR');
              this.props.handleClick(this.props.index);
            }
          }
        }}
        onMouseDown={this.props.handleMouseDown(this.props.index)}
        onMouseUp={this.props.handleMouseUp(this.props.index)}
        onContextMenu={(e) => {
          e.preventDefault();
        }}
        className={`${styles.tile} ${styles.tile__text} ${
          styles[`tile__text${this.props.value}`]
        } ${styles[this.state.face.toLowerCase()] || ''}`}
      >
        {this.state.face === 'CLEAR' &&
          this.props.value !== -1 &&
          this.props.value !== 0 &&
          this.props.value}
      </div>
    );
  }
}
