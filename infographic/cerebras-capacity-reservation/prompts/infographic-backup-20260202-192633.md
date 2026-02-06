Create a professional infographic following these specifications:

## Image Specifications

- **Type**: Infographic
- **Layout**: dashboard
- **Style**: technical-schematic
- **Aspect Ratio**: 16:9 (landscape)
- **Language**: English

## Core Principles

- Follow the layout structure precisely for information architecture
- Apply style aesthetics consistently throughout
- If content involves sensitive or copyrighted figures, create stylistically similar alternatives
- Keep information concise, highlight keywords and core concepts
- Use ample whitespace for visual clarity
- Maintain clear visual hierarchy

## Text Requirements

- All text must match the specified style treatment
- Main titles should be prominent and readable
- Key concepts should be visually emphasized
- Labels should be clear and appropriately sized
- Use English for all text content

## Layout Guidelines

Multi-metric display with charts, numbers, and KPI indicators.

### Structure
- Multiple data widgets arranged in a grid
- Charts, graphs, numbers as primary elements
- Grid or modular layout
- Key metrics prominent
- Status indicators for emphasis

### Visual Elements
- Chart types (bar, line, pie, gauge)
- Big numbers for KPIs
- Trend arrows (up/down)
- Color-coded status
- Clean data visualization

### Text Placement
- Title at top
- Widget titles above each section
- Metric labels and values
- Units clearly shown

## Style Guidelines

Technical diagrams with engineering precision and clean geometry.

### Color Palette
- Primary: Blues (#2563EB), teals, grays, white lines
- Background: Deep blue (#1E3A5F) or light gray with subtle grid
- Accents: Amber highlights (#F59E0B) for key numbers, cyan callouts

### Visual Treatment
- Geometric precision throughout
- Subtle grid pattern in background
- Dimension lines and measurements feel
- Technical symbols and annotations
- Clean vector shapes
- Consistent stroke weights
- Blueprint aesthetic: clean, precise, engineering feel

### Typography
- Technical stencil or clean sans-serif
- ALL-CAPS labels for section headers
- Measurement-style annotations for data points
- Floating labels

## Additional Design Instructions

- Minimal style: clean lines, no ornamentation, muted colors
- Strong data hierarchy: headline numbers large and bold
- Each of the 4 sections occupies a dashboard widget
- Highlight the realistic peak scenario (7,350 RPM, 26.4M TPM, 10.3M uncached) as the primary planning numbers
- Use blue/teal for model-related data, amber/gold for cacheability percentages

---

Generate the infographic based on the content below:

# Cerebras Capacity Reservation — Adobe 2026

## SECTION 1: MODELS OF INTEREST (top-left widget)

Four AI models with distinct roles. Two dominate >99% of token volume:

| Model | Role | Tokens/Call | Calls/Page | Cache Rate |
|-------|------|-------------|------------|------------|
| gpt-oss-120b | Reasoning | ~13,500 | 1 | 85% |
| llama-3.3-70b | Content Gen | ~2,240 | 5 | 30% |
| llama-3.1-8b | Classification | ~430 | 1 | 71% |
| zai-glm-4.7 | Under Eval | TBD | TBD | TBD |

Callout: gpt-oss-120b + llama-3.3-70b = >99% of token volume
Per page: 7 API calls, ~25,000 tokens total

## SECTION 2: REQUESTS PER MINUTE (top-right widget)

Escalating RPM across 4 scenarios:

- Demo Peak: 35 RPM
- Prod Sustained: 406 RPM
- Prod Realistic Peak: 7,350 RPM ← PRIMARY PLANNING NUMBER
- Prod Worst Case: 35,000 RPM

Show as horizontal bars or ascending gauge. Emphasize 7,350 as the key number.

## SECTION 3: UNCACHED TOKENS PER MINUTE (bottom-left widget)

Prompt prefix caching reduces raw demand by 61%:

| Scenario | Total TPM | Uncached TPM | Savings |
|----------|-----------|--------------|---------|
| Prod Sustained | 1.46M | ~568K | 61% |
| Prod Realistic Peak | 26.4M | ~10.3M | 61% |
| Prod Worst Case | 126M | ~49M | 61% |

Visualize total vs uncached as paired/stacked bars. Show 61% reduction prominently.

## SECTION 4: CACHEABILITY (bottom-right widget)

Two layers of caching compound to reduce net demand:

Layer 1 — Prompt Prefix Cache: 62% of input tokens
- gpt-oss-120b: 85%
- llama-3.3-70b: 30%
- llama-3.1-8b: 71%

Layer 2 — Query Response Cache:
- Experimentation: 10-20%
- Production: 20-40%

Net uncached rate in production: ~23-30% of total

Show as percentage gauges or layered reduction funnel.

---

Text labels (in English):

Title: "CEREBRAS CAPACITY RESERVATION — ADOBE 2026"
Section 1: "MODELS OF INTEREST"
Section 2: "REQUESTS PER MINUTE"
Section 3: "UNCACHED TOKENS PER MINUTE"
Section 4: "CACHEABILITY"
Key callouts: ">99% token volume", "7,350 RPM", "26.4M TPM", "10.3M uncached", "62% prefix cache", "61% savings", "~23-30% net uncached"
