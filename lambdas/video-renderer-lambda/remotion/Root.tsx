import { Composition } from "remotion";
import './index.css';
import { Battleship } from "./battleship";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="battleship"
        component={Battleship}
        durationInFrames={800}
        fps={30}
        width={960}
        height={640}
        defaultProps={{
          input: {
            id: 0,
            player1: "Player 1",
            player2: "Player 2",
            winner: "Player 1",
            ships: [],
            shots: []
          }
        }}
        calculateMetadata={({props}: any) => {
          return {
            durationInFrames: 60 + (props.input.shots.length + 1) * 30 + 60,
          }
        }}
      />
    </>
  );
};
