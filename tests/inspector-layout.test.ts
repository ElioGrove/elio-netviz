import { describe, expect, test } from "vitest";
import { testFile } from "./test-file";

describe("inspector layout", () => {
  test("scrolls the complete animation inspector when paths overflow", async () => {
    const source = await testFile(
      new URL("../src/components/inspector.tsx", import.meta.url)
    ).text();
    const animationBranch = source.slice(
      source.indexOf('if (workMode === "animation"'),
      source.indexOf("\n  return (", source.indexOf('if (workMode === "animation"') + 1)
    );

    expect(animationBranch).toContain("min-h-0 flex-1 overflow-y-auto");
  });

  test("offers persistent Video delay and camera controls", async () => {
    const source = await testFile(
      new URL("../src/components/inspector.tsx", import.meta.url)
    ).text();
    expect(source).toContain("<VideoSettings />");
    expect(source).toContain('placeholder={translate("Current animation name")}');
    expect(source).toContain('ariaLabel={translate("Start delay")}');
    expect(source).toContain('ariaLabel={translate("Between animations delay")}');
    expect(source).toContain('ariaLabel={translate("End delay")}');
    expect(source).toContain('label={translate("Camera follow")}');
    expect(source).toContain("max={10_000}");
    expect(source).toContain("videoTitle");
    expect(source).toContain("videoStartDelayMs");
    expect(source).toContain("videoBetweenDelayMs");
    expect(source).toContain("videoEndDelayMs");
    expect(source).toContain("videoCameraFollowEnabled");
    expect(source).toContain("Keeps your saved zoom and canvas position");
  });
});
