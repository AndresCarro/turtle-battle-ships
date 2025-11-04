import { AbsoluteFill, Html5Audio, Img, Sequence } from "remotion";
import { staticFile } from "remotion";
import { Board } from "./battleship/board";
import { useMemo } from "react";
import { Input, makeSteps } from "./battleship/make-steps";
import { cn } from "./utils/ui";

export function Battleship({ input }: { input: Input}) {
    const data = useMemo(() => {
        return makeSteps(input);
    }, []);

    return (
        <>
            <Sequence from={0} durationInFrames={60}>
                <AbsoluteFill>
                    <Img
                        src={staticFile("/background.jpg")}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            position: "absolute",
                        }}
                    />
                    <div className="relative bg-white h-full flex flex-col items-center justify-center m-12 rounded-3xl">
                        <div className="text-4xl font-bold p-4">🐢 Turtle Battleships</div>
                        <div className="grow flex gap-10 items-center justify-around">
                            <div className="text-2xl font-semibold mb-2 text-teal-600 w-88 text-center">{data.players[0]}</div>
                            <div className="text-2xl font-semibold mb-2">vs</div>
                            <div className="text-2xl font-semibold mb-2 text-teal-600 w-88 text-center">{data.players[1]}</div>
                        </div>
                    </div>
                </AbsoluteFill>
            </Sequence>
            {data.steps.map((step, index) => (
                <Sequence key={index} from={60 + index * 30} durationInFrames={30}>
                    <AbsoluteFill>
                        {step.shot === "miss" ? (
                            <Html5Audio src={staticFile("audio/miss.mp3")} />
                        ) : step.shot === "hit" ? (
                            <Html5Audio src={staticFile("audio/hit.mp3")} />
                        ) : step.shot === "sunk" ? (
                            <Html5Audio src={staticFile("audio/sunk.mp3")} />
                        ) : (
                            null
                        )}
                        <Img
                            src={staticFile("/background.jpg")}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                position: "absolute",
                            }}
                        />
                        <div className="relative bg-white h-full flex flex-col items-center justify-center m-12 rounded-3xl">
                            <div className="text-4xl font-bold p-4">🐢 Turtle Battleships</div>
                            <div className="grow flex gap-10 items-center justify-around">
                                <div className="text-center">
                                    <div className={cn("text-2xl font-semibold mb-2", data.players[0] === step.player && "text-teal-600")}>{data.players[0]}</div>
                                    <Board board={step.boards[0]} />
                                </div>
                                <div className="text-center">
                                    <div className={cn("text-2xl font-semibold mb-2", data.players[1] === step.player && "text-teal-600")}>{data.players[1]}</div>
                                    <Board board={step.boards[1]} />
                                </div>
                            </div>
                        </div>
                    </AbsoluteFill>
                </Sequence>
            ))}
            <Sequence from={60 + data.steps.length * 30} durationInFrames={60}>
                <AbsoluteFill>
                    <Img
                        src={staticFile("/background.jpg")}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            position: "absolute",
                        }}
                    />
                    <div className="relative bg-white h-full flex flex-col items-center justify-center m-12 rounded-3xl">
                        <div className="text-4xl font-bold p-4">🐢 Turtle Battleships</div>
                        <div className="grow flex gap-10 items-center justify-around">
                            <div className="text-2xl font-semibold text-center">The winner is <span className="text-teal-600">{data.winner}</span></div>
                        </div>
                    </div>
                </AbsoluteFill>
            </Sequence>
        </>
    );
}