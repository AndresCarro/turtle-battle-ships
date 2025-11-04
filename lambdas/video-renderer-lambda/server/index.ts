import { bundle } from "@remotion/bundler";
import path from "node:path";
import { webpackOverride } from "./webpack-override";
import { example } from "../example";
import { renderMedia, selectComposition } from "@remotion/renderer";

async function main() {
  const remotionBundle = await bundle({
    entryPoint: path.resolve("remotion/index.ts"),
    onProgress(progress) {
      console.info(`Bundling Remotion project: ${progress}%`);
    },
    webpackOverride,
  });

  // TODO: Fetch this data from the S3 bucket.
  const inputProps = {
    input: example,
  }

  const composition = await selectComposition({
    serveUrl: remotionBundle,
    id: "battleship",
    inputProps,
  });

  await renderMedia({
    serveUrl: remotionBundle,
    composition,
    inputProps,
    codec: "h264",
    onProgress: (progress) => {
      console.info(`Render progress:`, progress.progress);
    },
    outputLocation: path.join("out", "battleship.mp4"),
  });
}

main();
