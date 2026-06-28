from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def is_magenta_key(r: int, g: int, b: int, threshold: int) -> bool:
    exact_key = abs(r - 255) <= threshold and g <= threshold and abs(b - 255) <= threshold
    rendered_key = r >= 180 and b >= 140 and g <= 90 and r >= g + 90 and b >= g + 70
    return exact_key or rendered_key


def key_out_magenta(input_path: Path, output_path: Path, threshold: int) -> tuple[int, int]:
    image = Image.open(input_path).convert("RGBA")
    pixels = image.load()
    keyed = 0
    total = image.width * image.height

    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            if is_magenta_key(r, g, b, threshold):
                pixels[x, y] = (255, 255, 255, 0)
                keyed += 1
            elif a < 255:
                pixels[x, y] = (r, g, b, a)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path, "PNG", optimize=True)
    return keyed, total


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Convert solid #ff00ff placeholder areas in mockup PNGs to transparency."
    )
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--threshold", type=int, default=28)
    args = parser.parse_args()

    keyed, total = key_out_magenta(args.input, args.output, args.threshold)
    ratio = keyed / total if total else 0
    if ratio < 0.015:
        raise SystemExit(
            f"Only {keyed} pixels ({ratio:.2%}) were keyed out. "
            "The source likely does not contain a usable #ff00ff insert area."
        )
    print(f"keyed={keyed} total={total} ratio={ratio:.2%} output={args.output}")


if __name__ == "__main__":
    main()
