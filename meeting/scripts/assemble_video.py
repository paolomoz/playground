#!/usr/bin/env python3
"""Assemble meeting recap video from infographics and audio.

Combines:
  - Title card (3s)
  - 6 section clips (infographic PNG + audio MP3 each)
  - Outro card (3s)
  - 0.5s crossfade transitions between clips

Output: meeting/output/meeting-recap-final.mp4 (H.264 + AAC, 1920x1080, 24fps)
"""

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont
from moviepy import (
    ImageClip,
    AudioFileClip,
    concatenate_videoclips,
    CompositeVideoClip,
    vfx,
)

BASE_DIR = Path(__file__).resolve().parent.parent
INFOGRAPHIC_DIR = BASE_DIR / "infographic"
AUDIO_DIR = BASE_DIR / "audio"
OUTPUT_DIR = BASE_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

WIDTH, HEIGHT = 1920, 1080
FPS = 24
CROSSFADE = 0.5

SECTIONS = [
    "01-intro",
    "02-customer-journey",
    "03-mission-statement",
    "04-accelerator-model",
    "05-measuring-success",
    "06-ai-first",
]

# ── Card Generation (Pillow) ──────────────────────────────────────────────────

def _find_font(bold=False):
    """Find a usable system font on macOS."""
    candidates = (
        [
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
            "/Library/Fonts/Arial Bold.ttf",
        ]
        if bold
        else [
            "/System/Library/Fonts/Supplemental/Arial.ttf",
            "/System/Library/Fonts/Helvetica.ttc",
            "/Library/Fonts/Arial.ttf",
        ]
    )
    for path in candidates:
        if Path(path).exists():
            return path
    return None  # Pillow will use default


def _draw_centered_text(draw, text, y, font, fill, width):
    """Draw centered text at vertical position y."""
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    x = (width - tw) // 2
    draw.text((x, y), text, font=font, fill=fill)


def make_card_image(lines, output_path):
    """Generate a dark card with centered text lines.

    lines: list of (text, font_size, color, is_bold) tuples
    """
    img = Image.new("RGB", (WIDTH, HEIGHT), color=(18, 18, 28))
    draw = ImageDraw.Draw(img)

    # Calculate total text block height for vertical centering
    fonts = []
    heights = []
    for text, size, _color, bold in lines:
        font_path = _find_font(bold=bold)
        font = ImageFont.truetype(font_path, size) if font_path else ImageFont.load_default()
        fonts.append(font)
        bbox = draw.textbbox((0, 0), text, font=font)
        heights.append(bbox[3] - bbox[1])

    line_spacing = 24
    total_h = sum(heights) + line_spacing * (len(lines) - 1)
    y = (HEIGHT - total_h) // 2

    for i, (text, _size, color, _bold) in enumerate(lines):
        _draw_centered_text(draw, text, y, fonts[i], color, WIDTH)
        y += heights[i] + line_spacing

    img.save(str(output_path))
    return output_path


def generate_title_card():
    """Create title card PNG."""
    path = OUTPUT_DIR / "_title_card.png"
    make_card_image(
        [
            ("AEM Team Mission & Goals", 72, (255, 255, 255), True),
            ("Meeting Recap", 44, (180, 180, 200), False),
            ("February 2, 2026", 36, (140, 140, 160), False),
        ],
        path,
    )
    return path


def generate_outro_card():
    """Create outro card PNG with Nicole's quote."""
    path = OUTPUT_DIR / "_outro_card.png"
    make_card_image(
        [
            ('"Nothing is set in stone yet.', 48, (255, 255, 255), False),
            ("This is an invite to all of you", 48, (255, 255, 255), False),
            ('to help us shape and create."', 48, (255, 255, 255), False),
            ("", 20, (0, 0, 0), False),
            ("— Nicole Glauser", 36, (160, 160, 180), False),
        ],
        path,
    )
    return path


# ── Video Assembly ─────────────────────────────────────────────────────────────

def make_image_clip(image_path, duration):
    """Create an ImageClip from a PNG file with given duration."""
    clip = ImageClip(str(image_path)).with_duration(duration)
    # Ensure correct resolution
    w, h = clip.size
    if (w, h) != (WIDTH, HEIGHT):
        clip = clip.resized((WIDTH, HEIGHT))
    return clip


def make_section_clip(section_name):
    """Create a section clip: infographic PNG + audio MP3."""
    infographic = INFOGRAPHIC_DIR / f"{section_name}.png"
    audio_path = AUDIO_DIR / f"{section_name}.mp3"

    if not infographic.exists():
        print(f"  WARNING: Missing {infographic}")
        return None
    if not audio_path.exists():
        print(f"  WARNING: Missing {audio_path}")
        return None

    audio = AudioFileClip(str(audio_path))
    clip = make_image_clip(infographic, audio.duration).with_audio(audio)
    return clip


def main():
    print("=" * 60)
    print("  Video Assembler — Meeting Recap")
    print("=" * 60)

    clips = []

    # Title card (3s) with fade in/out
    print("\n  Creating title card...")
    title_path = generate_title_card()
    title_clip = make_image_clip(title_path, 3.0).with_effects(
        [vfx.CrossFadeIn(0.5), vfx.CrossFadeOut(0.5)]
    )
    clips.append(title_clip)

    # Section clips
    for name in SECTIONS:
        print(f"  Adding section: {name}")
        clip = make_section_clip(name)
        if clip is None:
            print(f"  SKIPPING {name} — missing files")
            continue
        clips.append(clip)

    # Outro card (3s) with fade in/out
    print("  Creating outro card...")
    outro_path = generate_outro_card()
    outro_clip = make_image_clip(outro_path, 3.0).with_effects(
        [vfx.CrossFadeIn(0.5), vfx.CrossFadeOut(0.5)]
    )
    clips.append(outro_clip)

    if len(clips) < 3:
        print("\n  ERROR: Not enough clips to assemble video.")
        sys.exit(1)

    # Concatenate with crossfade transitions
    print(f"\n  Concatenating {len(clips)} clips with {CROSSFADE}s crossfade...")
    final = concatenate_videoclips(clips, padding=-CROSSFADE, method="compose")

    # Export
    output_path = OUTPUT_DIR / "meeting-recap-final.mp4"
    print(f"  Exporting to: {output_path}")
    final.write_videofile(
        str(output_path),
        fps=FPS,
        codec="libx264",
        audio_codec="aac",
        bitrate="5000k",
        audio_bitrate="192k",
        logger="bar",
    )

    # Cleanup temp card images
    title_path.unlink(missing_ok=True)
    outro_path.unlink(missing_ok=True)

    print(f"\n{'=' * 60}")
    print(f"  Done! Video: {output_path}")
    print(f"  Duration: {final.duration:.1f}s")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
