import * as React from 'react';
import styles from './Tile.module.scss';

interface TileProps {
  width: number;
  height: number;
  handleClick: (index: number) => void;
  index: number;
  value: number;
  hideClosestHighlightedTiles: (index: number) => void;
  highlightClosestHiddenTiles: (index: number) => void;
  revealClosestIfCorrectlyFlagged: (index: number) => void;
  flagCountNearTileIsCorrect: (index: number) => boolean;
}

type Face = 'HIDDEN' | 'FLAGGED' | 'CLEAR' | 'MINE' | 'HIGHLIGHTED';

export class Tile extends React.Component<TileProps> {
  state: { face: Face };

  constructor(props) {
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
          if (this.getFace() !== 'FLAGGED') {
            this.setFace(this.props.value === -1 ? 'MINE' : 'CLEAR');
            this.props.handleClick(this.props.index);
          }
        }}
        onMouseDown={(e) => {
          // if left mouse button is pressed
          if (e.button === 0) {
            // if right mouse button is also pressed
            if (e.buttons === 3) {
              this.props.highlightClosestHiddenTiles(this.props.index);
            }
            if (this.state.face === 'HIDDEN') {
              this.setFace('HIGHLIGHTED');
            }
            return;
          }

          // if middle mouse button is pressed
          if (e.button === 1) {
            this.props.highlightClosestHiddenTiles(this.props.index);
          }

          // if right mouse button is pressed
          if (e.button === 2) {
            if (this.state.face === 'HIDDEN') {
              this.setFace('FLAGGED');
            }
            if (this.state.face === 'FLAGGED') {
              this.setFace('HIDDEN');
            }
          }
        }}
        onMouseUp={(e) => {
          // if right and left mouse button were pressed together and now one of them has been released OR
          // if middle mouse button has been released
          if (
            (e.button === 0 && e.buttons === 2) ||
            (e.button === 2 && e.buttons === 1) ||
            e.button === 1
          ) {
            if (this.props.flagCountNearTileIsCorrect(this.props.index)) {
              this.props.revealClosestIfCorrectlyFlagged(this.props.index);
            } else {
              this.props.hideClosestHighlightedTiles(this.props.index);
            }
          }
        }}
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
