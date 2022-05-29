import * as React from 'react';
import styles from './Tile.module.scss';

interface TileProps {
  width: number;
  height: number;
  handleClick: (index: number) => void;
  index: number;
  value: number;
}

type Face = 'HIDDEN' | 'FLAGGED' | 'CLEAR' | 'MINE';

export class Tile extends React.Component<TileProps> {
  state: { face: Face };

  constructor(props) {
    super(props);
    this.state = { face: 'HIDDEN' };
  }

  setFace(value: Face): void {
    this.setState({ face: value });
  }

  render() {
    return (
      <div
        style={{
          width: this.props.width + 'px',
          height: this.props.height + 'px',
          margin: '11px'
        }}
        onClick={() => {
          this.setFace(this.props.value === -1 ? 'MINE' : 'CLEAR');
          this.props.handleClick(this.props.index);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          if (this.state.face !== 'CLEAR' && this.state.face !== 'MINE') {
            if (this.state.face === 'FLAGGED') {
              this.setFace('HIDDEN');
            } else {
              this.setFace('FLAGGED');
            }
          }
        }}
        className={styles[this.state.face.toLowerCase()]}
      >
        {this.state.face === 'CLEAR' &&
          this.props.value !== -1 &&
          this.props.value !== 0 &&
          this.props.value}
      </div>
    );
  }
}
