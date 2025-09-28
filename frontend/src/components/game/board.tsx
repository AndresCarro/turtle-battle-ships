import { GRID_SIZE } from "@/constants";
import type { Board } from "@/types";
import { cn } from "@/utils/ui";
import { CircleDot, LocateFixed, Ship, Skull } from "lucide-react";

const BOARD_ELEMENTS = {
    "": {
        className: "bg-sky-400 border-sky-600/50 hover:bg-sky-500 border dark:bg-sky-700 dark:hover:bg-sky-800 dark:border-sky-800",
        allowClickClassName: "cursor-pointer",
        icon: <></>
    },
    "miss": {
        className: "bg-sky-400 border border-sky-600/50 hover:bg-sky-500 dark:bg-sky-700 dark:hover:bg-sky-800 dark:border-sky-800",
        allowClickClassName: "",
        icon: <CircleDot className="size-4 opacity-50"/>
    },
    "hit": {
        className: "bg-red-400/70 border border-red-600/50 hover:bg-red-400 dark:bg-red-700 dark:hover:bg-red-700/80 dark:border-red-800",
        allowClickClassName: "",
        icon: <LocateFixed className="size-4 opacity-50" />
    },
    "ship": {
        className: "bg-slate-400/80 border border-slate-600/50 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-700/80 dark:border-slate-800",
        allowClickClassName: "",
        icon: <Ship className="size-4 opacity-50" />
    },
    "sunk": {
        className: "bg-red-700/80 border border-red-900/50 hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-900/80 dark:border-red-800",
        allowClickClassName: "",
        icon: <Skull className="size-4 opacity-50" />
    }
}

type Props = {
    board: Board;
    allowClick: boolean;
    onClick: (i: number, j: number) => void;
}

export function Board({
    board,
    allowClick,
    onClick
}: Props) {
    if (board.length !== GRID_SIZE || board.some(row => row.length !== GRID_SIZE)) {
        return <div>Invalid board size</div>;
    }

    return (
        <div className="inline-block">
            <div className="flex">
                <div className="size-8"></div>
                {Array.from({ length: GRID_SIZE }, (_, i) => (
                    <div
                        key={i}
                        className="size-8 flex items-center justify-center text-sm font-medium"
                    >
                        {i + 1}
                    </div>
                ))}
            </div>
            {board.map((row, i) => (
                <div key={i} className="flex">
                    <div className="size-8 flex items-center justify-center text-sm font-medium">
                        {String.fromCharCode("A".charCodeAt(0) + i)}
                    </div>
                    {row.map((state, j) => (
                        <div
                            key={`${i}-${j}`}
                            className={cn(
                                "size-8 flex items-center justify-center",
                                BOARD_ELEMENTS[state].className,
                                allowClick && BOARD_ELEMENTS[state].allowClickClassName,
                            )}
                            onClick={() => onClick(i, j)}
                        >
                            {BOARD_ELEMENTS[state].icon}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}