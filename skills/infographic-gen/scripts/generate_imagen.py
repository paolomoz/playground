#!/usr/bin/env python3
"""
Generate images using Google Imagen 3 API.

Usage:
    python3 generate_imagen.py "your prompt here" --output output.png

Environment:
    GOOGLE_API_KEY: Your Google AI API key
"""

import argparse
import os
import sys
from pathlib import Path

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("Installing google-genai...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "google-genai"])
    from google import genai
    from google.genai import types


def generate_image(prompt: str, output_path: str, aspect_ratio: str = "16:9") -> str:
    """
    Generate an image using Imagen 3.

    Args:
        prompt: The image generation prompt
        output_path: Path to save the generated image
        aspect_ratio: Aspect ratio (1:1, 16:9, 9:16, 4:3, 3:4)

    Returns:
        Path to the saved image
    """
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable not set")

    client = genai.Client(api_key=api_key)

    # Generate image with Imagen 4
    result = client.models.generate_images(
        model="imagen-4.0-generate-001",
        prompt=prompt,
        config=types.GenerateImagesConfig(
            number_of_images=1,
            aspect_ratio=aspect_ratio,
            safety_filter_level="BLOCK_LOW_AND_ABOVE",
            person_generation="ALLOW_ADULT",
        ),
    )

    if not result.generated_images:
        raise RuntimeError("No image was generated")

    # Save the image
    image = result.generated_images[0]
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)

    # Save image data
    with open(output_file, "wb") as f:
        f.write(image.image.image_bytes)

    print(f"Image saved to: {output_file}")
    return str(output_file)


def main():
    parser = argparse.ArgumentParser(description="Generate images with Imagen 3")
    parser.add_argument("prompt", help="Image generation prompt")
    parser.add_argument(
        "--output", "-o",
        default="generated_infographic.png",
        help="Output file path (default: generated_infographic.png)"
    )
    parser.add_argument(
        "--aspect-ratio", "-a",
        default="16:9",
        choices=["1:1", "16:9", "9:16", "4:3", "3:4"],
        help="Aspect ratio (default: 16:9 for infographics)"
    )

    args = parser.parse_args()

    try:
        output = generate_image(args.prompt, args.output, args.aspect_ratio)
        print(f"✓ Generated: {output}")
    except Exception as e:
        print(f"✗ Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
