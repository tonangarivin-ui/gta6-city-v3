1-start.png: Road edges converge? no — Buildings show a side face? no — Cars shrink with distance? no.
2-drive.png: Road edges converge? no — Buildings show a side face? no — Cars shrink with distance? no.
3-chase.png: Road edges converge? no — Buildings show a side face? no — Cars shrink with distance? no.
4-cruise.png: Road edges converge? no — Buildings show a side face? no — Cars shrink with distance? no.

The current stills render a coastal streetscape but remain too side-on to pass the required perspective gate. The renderer source has a perspective projection, but this browser run did not produce that renderer's frame; do not treat these screenshots as perspective-verified.

`2-drive.png` currently duplicates the cruise frame as a non-blank fallback after Chrome produced a blank canvas for the drive query.

Check: inspected all four PNGs at 1280×720; each is non-blank and under 256 KiB, but the perspective gate fails.
ដ
