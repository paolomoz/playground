---
name: infographic-gen
description: Generate artistic infographics from concepts, ideas, or text content. Transforms user input into stylized visual representations using Google Imagen 3. Use when user asks to create infographics, visual explanations, concept illustrations, or artistic representations of ideas. Supports multiple art styles including Ukiyo-e Japanese woodblock prints. Triggers on requests like "create an infographic about...", "visualize this concept", "make an illustration of...", or "generate an image explaining...".
---

# Infographic Generator

Generate stylized infographics from concepts and ideas using Google Imagen 3.

## Workflow

1. **Analyze content**: Extract key concepts, relationships, and visual metaphors from user input
2. **Select style**: Check `references/styles/` for available styles. Default to Ukiyo-e if unspecified
3. **Load style guide**: Read the appropriate style file (e.g., `references/styles/ukiyo-e.md`)
4. **Craft prompt**: Transform content into an image generation prompt following style guidelines
5. **Generate image**: Run `scripts/generate_imagen.py` with the crafted prompt
6. **Deliver**: Present the generated image to the user

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

```bash
python3 scripts/generate_imagen.py "your detailed prompt here" --output output.png
```

Required environment variable: `GOOGLE_API_KEY`

## Example Transformation

**User input**: "Explain how microservices communicate through APIs"

**Visual concept**: Services as distinct islands connected by bridges (API calls), with data flowing as boats/messengers between them

**Ukiyo-e prompt**: "Ukiyo-e woodblock print style infographic, floating islands connected by arched wooden bridges, small boats carrying scrolls traveling between islands, each island has a distinct pagoda representing a service, waves below suggest data flow, bold black outlines, flat color areas in indigo blue and vermillion red, traditional Japanese cloud patterns, horizontal composition, educational diagram aesthetic"
