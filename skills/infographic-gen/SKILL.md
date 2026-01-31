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
4. **Craft prompt**: Transform content into an image generation prompt following style guidelines. **Always append "no text, no labels, no words, no letters, no writing, no captions" to every prompt** — all typography is added cleanly in the overlay step
5. **Generate image**: Run `scripts/generate_imagen.py` with the crafted prompt
6. **Overlay text**: Run `scripts/overlay_text.py` to add titles, labels, and captions with clean, readable typography (see Text Overlay Usage below)
7. **Deliver**: Present the generated image to the user

## Prompt Crafting Principles

When transforming concepts into visual prompts:

- Lead with the artistic style and medium (use "illustration" not "infographic")
- Convert abstract ideas into concrete visual metaphors — check the style guide's **Concept Difficulty Guide** for harder concepts
- Describe composition and spatial arrangement
- Include style-specific visual vocabulary from the style guide
- Specify mood, lighting, and color treatment per style
- Keep prompts focused: one clear visual concept per image
- For hard-to-visualize concepts (hierarchy, management, production), always include **human figures** in the prompt
- **Never use these words** (they cause AI to generate garbled text): `infographic`, `diagram`, `educational`, `chart`, `annotated`
- **Always end prompts with**: "no text, no labels, no words, no letters, no writing, no captions, no signs, purely visual"

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

**Style presets** (recommended — auto-configures fonts, colors, and readability):
```bash
# Use style preset — automatically picks appropriate fonts and colors
python3 scripts/overlay_text.py input.png --config-json '[
  {"text": "Title", "position": "top-center", "font_size": 72, "style": "ukiyo-e"},
  {"text": "Subtitle", "position": "bottom-center", "font_size": 32, "style": "ukiyo-e"}
]' --output final.png
```

Available presets: `ukiyo-e`, `art-nouveau`

**Auto-color:** Automatically picks light or dark text based on image brightness at the overlay position:
```bash
python3 scripts/overlay_text.py input.png --text "Title" --auto-color --output final.png
```

**Font recommendations by style:**
| Style | Title Font | Subtitle Font | Notes |
|-------|-----------|---------------|-------|
| Ukiyo-e | `copperplate` bold | `avenir-next` medium | Copperplate has an engraved quality; Avenir is clean |
| Art Nouveau | `didot` bold | `baskerville` italic | Didot's high contrast fits Mucha aesthetic; Baskerville is elegant |
| Modern/Clean | `helvetica-neue` bold | `helvetica-neue` medium | Clean and neutral |

**Additional fonts available:** `cochin`, `bodoni`, `charter`, `brush-script`, `snell-roundhand`, `zapfino`

**Text wrapping:** Use `--max-width 800` (or `"max_width": 800` in JSON) to auto-wrap text to a pixel width.

## Example Transformation

**User input**: "Explain how microservices communicate through APIs"

**Visual concept**: Services as distinct islands connected by bridges (API calls), with data flowing as boats/messengers between them

**Ukiyo-e prompt**: "Ukiyo-e woodblock print style illustration, floating islands connected by arched wooden bridges, small boats carrying scrolls traveling between islands, each island has a distinct pagoda representing a service, waves below suggest data flow, bold black sumi outlines, flat color areas in indigo blue and vermillion red, traditional Japanese cloud patterns, horizontal composition, no text, no labels, no words, no letters, no writing, no captions, no signs, purely visual"
