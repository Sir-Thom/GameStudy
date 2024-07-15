import { Stage, Layer, Rect, Text } from 'react-konva';

function GameView() {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Rect
          x={20}
          y={20}
          width={100}
          height={100}
          fill="green"
          shadowBlur={10}
        />
        <Text text="Hello Konva!" x={50} y={50} />
      </Layer>
    </Stage>
  );
}

export default GameView;