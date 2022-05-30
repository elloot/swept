import * as React from 'react';
import styles from './Tile.module.scss';

interface TileProps {
  width: number;
  height: number;
  handleClick: (index: number) => void;
  index: number;
  value: number;
  hideNearestHighlightedTiles: (index: number) => void;
  highlightNearestHiddenTiles: (index: number) => void;
  revealNearestIfCorrectlyFlagged: (index: number) => void;
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
        style={{
          width: this.props.width + 'px',
          height: this.props.height + 'px',
          margin: '11px'
        }}
        onClick={(e) => {
          this.setFace(this.props.value === -1 ? 'MINE' : 'CLEAR');
          this.props.handleClick(this.props.index);
        }}
        onMouseDown={(e) => {
          // if left mouse button is pressed
          if (e.button === 0) {
            // if right mouse button is also pressed
            if (e.buttons === 3) {
              this.props.highlightNearestHiddenTiles(this.props.index);
            }
            if (this.state.face === 'HIDDEN') {
              this.setFace('HIGHLIGHTED');
            }
            return;
          }

          // if middle mouse button is pressed
          if (e.button === 1) {
            this.props.highlightNearestHiddenTiles(this.props.index);
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
          // if left mouse button is released while right mouse button is pressed OR
          // if right mouse button is released while left mouse button is pressed OR
          // if middle mouse button is released
          if (e.buttons === 2 || e.buttons === 1 || e.button === 1) {
            this.props.hideNearestHighlightedTiles(this.props.index);
            if (this.state.face === 'HIGHLIGHTED') {
              this.setFace('HIDDEN');
            }
          }
          if (e.button === 1) {
            this.props.revealNearestIfCorrectlyFlagged(this.props.index);
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
        }}
        className={`${styles.tile} ${
          styles[this.state.face.toLowerCase()] || ''
        }`}
      >
        {this.state.face === 'CLEAR' &&
          this.props.value !== -1 &&
          this.props.value !== 0 &&
          this.props.value}
      </div>
    );
  }
}
