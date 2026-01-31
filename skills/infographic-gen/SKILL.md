---
name: infographic-gen
description: Generate artistic infographics from concepts, ideas, or text content. Transforms user input into stylized visual representations using Google Imagen 4. Use when user asks to create infographics, visual explanations, concept illustrations, or artistic representations of ideas. Supports multiple art styles including Ukiyo-e Japanese woodblock prints. Triggers on requests like "create an infographic about...", "visualize this concept", "make an illustration of...", or "generate an image explaining...".
---

# Infographic Generator

Generate stylized infographics from concepts and ideas using Google Imagen 4.

## Workflow

1. **Analyze content**: Extract key concepts, relationships, and visual metaphors from user input
2. **Select style**: Check `references/styles/` for available styles. Default to Ukiyo-e if unspecified
3. **Load style guide**: Read the appropriate style file (e.g., `references/styles/ukiyo-e.md`)
4. **Craft prompt**: Transform content into an image generation prompt following style guidelines. **Avoid including text or labels in the prompt** — these will be added cleanly in the overlay step
5. **Generate image**: Run `scripts/generate_imagen.py` with the crafted prompt
6. **Overlay text**: Run `scripts/overlay_text.py` to add titles, labels, and captions with clean, readable typography (see Text Overlay Usage below)
7. **Deliver**: Present the generated image to the user

## Prompt Crafting Principles

When transforming concepts into visual prompts:

- Lead with the artistic style and medium
- Convert abstract ideas into concrete visual metaphors
- Describe composition and spatial arrangement
- Include style-specific visual vocabulary from the style guide
- Specify mood, lighting, and color treatment per style
- Keep prompts focused: one clear visual concept per image

## Available Styles

Check `references/styles/` for style guides. Each contains:
- Visual characteristics and techniques
- Color palette guidelines
- Compositional patterns
- Prompt templates and vocabulary
- Example prompt structures

## Script Usage

### Image Generation

```bash
python3 scripts/generate_imagen.py "your detailed prompt here" --output output.png
```

Required environment variable: `GOOGLE_API_KEY`

### Text Overlay Usage

Add clean, readable text on top of generated images. Supports single-element CLI mode, inline JSON, or a JSON config file.

```bash
# Single text element
python3 scripts/overlay_text.py input.png --text "Title" --position top-center \
  --font-size 64 --color white --outline-color black --output final.png

# Multiple elements via inline JSON
python3 scripts/overlay_text.py input.png --config-json '[
  {"text": "Title", "position": "top-center", "font_size": 64,
   "color": "white", "outline_color": "black", "outline_width": 3},
  {"text": "Subtitle here", "position": "bottom-center", "font_size": 32,
   "color": "white", "shadow": true}
]' --output final.png

# Multiple elements via JSON file
python3 scripts/overlay_text.py input.png --config overlays.json --output final.png
```

**Positions:** `top-left`, `top-center`, `top-right`, `center-left`, `center`, `center-right`, `bottom-left`, `bottom-center`, `bottom-right`, or explicit `[x, y]` pixel coordinates.

**Readability options** (combinable):
- **Outline** (recommended default): `--outline-color black --outline-width 2`
- **Drop shadow**: `--shadow` (or `"shadow": true` in JSON)
- **Background box**: `--bg-color "#00000088"` (semi-transparent rounded rect behind text)

**Font recommendations by style:**
| Style | Recommended Font | Weight |
|-------|-----------------|--------|
| Ukiyo-e | `avenir-next` | `bold` |
| Art Nouveau | `palatino` | `bold` or `italic` |
| Modern/Clean | `helvetica-neue` | `medium` or `bold` |

**Text wrapping:** Use `--max-width 800` (or `"max_width": 800` in JSON) to auto-wrap text to a pixel width.

## Example Transformation

**User input**: "Explain how microservices communicate through APIs"

**Visual concept**: Services as distinct islands connected by bridges (API calls), with data flowing as boats/messengers between them

**Ukiyo-e prompt**: "Ukiyo-e woodblock print style infographic, floating islands connected by arched wooden bridges, small boats carrying scrolls traveling between islands, each island has a distinct pagoda representing a service, waves below suggest data flow, bold black outlines, flat color areas in indigo blue and vermillion red, traditional Japanese cloud patterns, horizontal composition, educational diagram aesthetic"
