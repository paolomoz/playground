#!/usr/bin/env python3
"""
Generate images using Google Imagen 3 API.

Usage:
    python3 generate_imagen.py "your prompt here" --output output.png
    
Environment:
    GOOGLE_API_KEY: Your Google AI API key
"""

import argparse
import base64
import os
import sys
from pathlib import Path

try:
    import google.generativeai as genai
except ImportError:
    print("Installing google-generativeai...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "google-generativeai"])
    import google.generativeai as genai


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
    
    genai.configure(api_key=api_key)
    
    # Use Imagen 3 model
    imagen = genai.ImageGenerationModel("imagen-3.0-generate-002")
    
    # Generate image
    result = imagen.generate_images(
        prompt=prompt,
        number_of_images=1,
        aspect_ratio=aspect_ratio,
        safety_filter_level="block_only_high",
        person_generation="allow_adult",
    )
    
    if not result.images:
        raise RuntimeError("No image was generated")
    
    # Save the image
    image = result.images[0]
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    # Save image data
    with open(output_file, "wb") as f:
        f.write(image._image_bytes)
    
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
