#!/usr/bin/env python3
"""
Overlay clean, readable text on infographic images.

Usage:
    # Single text element
    python3 overlay_text.py input.png --text "Title" --position top-center \\
      --font-size 64 --color white --outline-color black --output final.png

    # Multiple elements via inline JSON
    python3 overlay_text.py input.png --config-json '[
      {"text": "Title", "position": "top-center", "font_size": 64,
       "color": "white", "outline_color": "black", "outline_width": 3}
    ]' --output final.png

    # Multiple elements via JSON file
    python3 overlay_text.py input.png --config overlays.json --output final.png
"""

import argparse
import json
import math
import os
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional, Union

try:
    from PIL import Image, ImageDraw, ImageFilter, ImageFont
except ImportError:
    print("Installing Pillow...")
    import subprocess

    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "Pillow"])
    from PIL import Image, ImageDraw, ImageFilter, ImageFont


# ---------------------------------------------------------------------------
# Font map — short names to macOS system font filenames
# ---------------------------------------------------------------------------

_FONT_DIR = "/System/Library/Fonts/Supplemental"

FONT_MAP = {
    # Sans-serif
    "helvetica-neue": "HelveticaNeue.ttc",
    "helvetica-neue-bold": "HelveticaNeue-Bold.ttc",
    "helvetica-neue-medium": "HelveticaNeue-Medium.ttc",
    "helvetica-neue-light": "HelveticaNeue-Light.ttc",
    "avenir-next": "AvenirNext.ttc",
    "avenir-next-bold": "AvenirNext-Bold.ttc",
    "avenir-next-medium": "AvenirNext-Medium.ttc",
    "avenir-next-light": "AvenirNextCondensed-Regular.ttc",
    "avenir": "Avenir.ttc",
    "avenir-bold": "Avenir-Black.ttc",
    "avenir-medium": "Avenir-Medium.ttc",
    "avenir-light": "Avenir-Light.ttc",
    # Serif
    "palatino": "Palatino.ttc",
    "palatino-bold": "Palatino Bold.ttc",
    "palatino-italic": "Palatino Italic.ttc",
    "times": "Times New Roman.ttf",
    "times-bold": "Times New Roman Bold.ttf",
    "times-italic": "Times New Roman Italic.ttf",
}

# Weight suffixes used by resolve_font
_WEIGHT_SUFFIXES = {"bold", "medium", "light", "italic"}


# ---------------------------------------------------------------------------
# Dataclass
# ---------------------------------------------------------------------------


@dataclass
class TextOverlay:
    """Specification for a single text overlay element."""

    text: str
    position: Union[str, list] = "center"
    font: str = "helvetica-neue"
    font_weight: Optional[str] = None
    font_size: int = 48
    color: str = "white"
    # Outline
    outline_color: Optional[str] = None
    outline_width: int = 2
    # Drop shadow
    shadow: bool = False
    shadow_color: str = "#00000088"
    shadow_offset: list = field(default_factory=lambda: [4, 4])
    shadow_blur: int = 6
    # Background box
    bg_color: Optional[str] = None
    bg_padding: int = 16
    bg_radius: int = 12
    # Wrapping
    max_width: Optional[int] = None


# ---------------------------------------------------------------------------
# Color helper
# ---------------------------------------------------------------------------


def parse_color(color_str: str):
    """Parse a color string. Handles named colors, #RRGGBB, and #RRGGBBAA."""
    if not isinstance(color_str, str):
        return color_str
    s = color_str.strip()
    if s.startswith("#") and len(s) == 9:  # #RRGGBBAA
        return (int(s[1:3], 16), int(s[3:5], 16), int(s[5:7], 16), int(s[7:9], 16))
    return s


# ---------------------------------------------------------------------------
# Font resolution
# ---------------------------------------------------------------------------


def resolve_font(
    font_name: str = "helvetica-neue",
    font_weight: Optional[str] = None,
    font_size: int = 48,
) -> ImageFont.FreeTypeFont:
    """Resolve a short font name (+ optional weight) to an ImageFont object."""
    # Build lookup key
    key = font_name.lower()
    if font_weight and font_weight.lower() in _WEIGHT_SUFFIXES:
        key = f"{key}-{font_weight.lower()}"

    filename = FONT_MAP.get(key)
    if filename:
        path = os.path.join(_FONT_DIR, filename)
        if os.path.exists(path):
            return ImageFont.truetype(path, font_size)

    # Fallback: try the base name without weight
    filename = FONT_MAP.get(font_name.lower())
    if filename:
        path = os.path.join(_FONT_DIR, filename)
        if os.path.exists(path):
            return ImageFont.truetype(path, font_size)

    # Last resort: Pillow default
    try:
        return ImageFont.truetype("Arial", font_size)
    except OSError:
        return ImageFont.load_default(size=font_size)


# ---------------------------------------------------------------------------
# Position resolution
# ---------------------------------------------------------------------------

_MARGIN = 0.05  # 5 % margin

_NAMED_POSITIONS = {
    "top-left": (0.0, 0.0, "lt"),
    "top-center": (0.5, 0.0, "mt"),
    "top-right": (1.0, 0.0, "rt"),
    "center-left": (0.0, 0.5, "lm"),
    "center": (0.5, 0.5, "mm"),
    "center-right": (1.0, 0.5, "rm"),
    "bottom-left": (0.0, 1.0, "lb"),
    "bottom-center": (0.5, 1.0, "mb"),
    "bottom-right": (1.0, 1.0, "rb"),
}


def resolve_position(
    position: Union[str, list], image_size: tuple[int, int]
) -> tuple[tuple[int, int], str]:
    """Return ((x, y), anchor) for a named position or explicit [x, y]."""
    w, h = image_size
    mx, my = int(w * _MARGIN), int(h * _MARGIN)

    if isinstance(position, (list, tuple)) and len(position) == 2:
        return (int(position[0]), int(position[1])), "lt"

    key = str(position).lower().strip()
    if key not in _NAMED_POSITIONS:
        raise ValueError(
            f"Unknown position '{position}'. "
            f"Use one of {list(_NAMED_POSITIONS)} or [x, y]."
        )

    fx, fy, anchor = _NAMED_POSITIONS[key]

    # Map fractional position to pixel coords, respecting margin
    x = int(mx + fx * (w - 2 * mx))
    y = int(my + fy * (h - 2 * my))
    return (x, y), anchor


# ---------------------------------------------------------------------------
# Text wrapping
# ---------------------------------------------------------------------------


def wrap_text(text: str, font: ImageFont.FreeTypeFont, max_width: int) -> str:
    """Greedy word-wrap to a pixel width."""
    words = text.split()
    if not words:
        return text

    lines: list[str] = []
    current = words[0]

    for word in words[1:]:
        candidate = f"{current} {word}"
        bbox = font.getbbox(candidate)
        if bbox[2] - bbox[0] <= max_width:
            current = candidate
        else:
            lines.append(current)
            current = word

    lines.append(current)
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Rendering
# ---------------------------------------------------------------------------


def render_text_overlay(image: Image.Image, overlay: TextOverlay) -> Image.Image:
    """Draw a single text overlay element onto the image and return it."""
    image = image.copy().convert("RGBA")
    font = resolve_font(overlay.font, overlay.font_weight, overlay.font_size)

    # Wrap text if needed
    text = overlay.text
    if overlay.max_width:
        text = wrap_text(text, font, overlay.max_width)

    (x, y), anchor = resolve_position(overlay.position, image.size)
    color = parse_color(overlay.color)

    # --- Background box ---
    if overlay.bg_color:
        bg = parse_color(overlay.bg_color)
        pad = overlay.bg_padding
        radius = overlay.bg_radius

        # Measure text bounding box
        tmp = ImageDraw.Draw(image)
        bbox = tmp.textbbox((x, y), text, font=font, anchor=anchor)
        box = (
            bbox[0] - pad,
            bbox[1] - pad,
            bbox[2] + pad,
            bbox[3] + pad,
        )
        box_layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
        box_draw = ImageDraw.Draw(box_layer)
        box_draw.rounded_rectangle(box, radius=radius, fill=bg)
        image = Image.alpha_composite(image, box_layer)

    # --- Drop shadow ---
    if overlay.shadow:
        shadow_color = parse_color(overlay.shadow_color)
        sx = x + overlay.shadow_offset[0]
        sy = y + overlay.shadow_offset[1]

        shadow_layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
        shadow_draw = ImageDraw.Draw(shadow_layer)
        shadow_draw.text((sx, sy), text, font=font, fill=shadow_color, anchor=anchor)
        if overlay.shadow_blur > 0:
            shadow_layer = shadow_layer.filter(
                ImageFilter.GaussianBlur(radius=overlay.shadow_blur)
            )
        image = Image.alpha_composite(image, shadow_layer)

    # --- Main text (with optional outline) ---
    draw = ImageDraw.Draw(image)
    stroke_kwargs = {}
    if overlay.outline_color:
        stroke_kwargs["stroke_width"] = overlay.outline_width
        stroke_kwargs["stroke_fill"] = parse_color(overlay.outline_color)

    draw.text((x, y), text, font=font, fill=color, anchor=anchor, **stroke_kwargs)

    return image


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def overlays_from_dicts(specs: list[dict]) -> list[TextOverlay]:
    """Convert a list of plain dicts (e.g. from JSON) to TextOverlay objects."""
    overlays = []
    for spec in specs:
        overlays.append(TextOverlay(**spec))
    return overlays


def overlay_text(
    image_path: str,
    overlays: list[TextOverlay],
    output_path: Optional[str] = None,
) -> str:
    """
    Top-level entry point: apply all overlays to an image and save.

    Args:
        image_path: Path to the source image.
        overlays: List of TextOverlay specifications.
        output_path: Where to save. Defaults to <stem>_text.<ext>.

    Returns:
        The output file path.
    """
    src = Path(image_path)
    if not src.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    image = Image.open(src).convert("RGBA")

    for ov in overlays:
        image = render_text_overlay(image, ov)

    if output_path is None:
        output_path = str(src.with_stem(f"{src.stem}_text"))

    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)

    # Save as RGB for JPEG, RGBA for PNG
    if out.suffix.lower() in (".jpg", ".jpeg"):
        image.convert("RGB").save(out)
    else:
        image.save(out)

    print(f"Saved: {out}")
    return str(out)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def main():
    parser = argparse.ArgumentParser(
        description="Overlay clean text on infographic images"
    )
    parser.add_argument("image", help="Path to the input image")
    parser.add_argument("--output", "-o", default=None, help="Output file path")

    # Single-text mode
    parser.add_argument("--text", "-t", help="Text to overlay (single-element mode)")
    parser.add_argument(
        "--position",
        "-p",
        default="center",
        help="Named position or x,y coords (default: center)",
    )
    parser.add_argument("--font", default="helvetica-neue", help="Font short name")
    parser.add_argument("--font-weight", default=None, help="Font weight variant")
    parser.add_argument("--font-size", type=int, default=48, help="Font size in px")
    parser.add_argument("--color", default="white", help="Text color")
    parser.add_argument("--outline-color", default=None, help="Outline/stroke color")
    parser.add_argument("--outline-width", type=int, default=2, help="Outline width")
    parser.add_argument(
        "--shadow", action="store_true", help="Enable drop shadow"
    )
    parser.add_argument("--bg-color", default=None, help="Background box color")
    parser.add_argument("--max-width", type=int, default=None, help="Wrap width in px")

    # Multi-element modes
    parser.add_argument(
        "--config", help="Path to a JSON file with overlay specifications"
    )
    parser.add_argument(
        "--config-json", help="Inline JSON string with overlay specifications"
    )

    args = parser.parse_args()

    # Build overlay list
    if args.config:
        with open(args.config) as f:
            specs = json.load(f)
        overlays = overlays_from_dicts(specs)
    elif args.config_json:
        specs = json.loads(args.config_json)
        overlays = overlays_from_dicts(specs)
    elif args.text:
        # Parse position — support "x,y" as well as named positions
        pos = args.position
        if "," in pos:
            parts = pos.split(",")
            pos = [int(parts[0].strip()), int(parts[1].strip())]
        overlays = [
            TextOverlay(
                text=args.text,
                position=pos,
                font=args.font,
                font_weight=args.font_weight,
                font_size=args.font_size,
                color=args.color,
                outline_color=args.outline_color,
                outline_width=args.outline_width,
                shadow=args.shadow,
                bg_color=args.bg_color,
                max_width=args.max_width,
            )
        ]
    else:
        parser.error("Provide --text, --config, or --config-json")

    try:
        out = overlay_text(args.image, overlays, args.output)
        print(f"Done: {out}")
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
