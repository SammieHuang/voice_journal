import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import {
  measureM4aDuration,
  UnsupportedAudioError,
} from "../src/lib/audioDuration";

const fixture = (name: string) => path.join(__dirname, "fixtures", name);

describe("measureM4aDuration", () => {
  it("measures real recordings", async () => {
    const seconds = async (name: string) =>
      (await measureM4aDuration(fixture(name))).seconds;
    expect(await seconds("one-second.m4a")).toBeCloseTo(1, 0);
    expect(await seconds("five-minutes.m4a")).toBeCloseTo(300, 0);
    expect(await seconds("six-minutes.m4a")).toBeCloseTo(360, 0);
  });

  it("rejects a file that isn't an m4a", async () => {
    fs.writeFileSync("not-audio.m4a", "just some text");
    await expect(measureM4aDuration("not-audio.m4a")).rejects.toThrow(
      UnsupportedAudioError,
    );
  });
});
