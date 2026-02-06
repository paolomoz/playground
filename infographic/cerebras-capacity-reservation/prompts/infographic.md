Create a professional infographic following these specifications:

## Image Specifications

- **Type**: Infographic — capacity reservation request summary
- **Layout**: dashboard
- **Style**: technical-schematic
- **Aspect Ratio**: 16:9 (landscape)
- **Language**: English

## Core Principles

- This infographic must prominently answer 4 specific questions for Cerebras capacity planning. Each question = one dashboard widget, clearly labeled.
- Follow the layout structure precisely for information architecture
- Apply style aesthetics consistently throughout
- Keep information concise, highlight keywords and core concepts
- Use ample whitespace for visual clarity
- Maintain clear visual hierarchy — the 4 answer boxes should be the dominant visual elements

## Text Requirements

- All text must match the specified style treatment
- Main title prominent and readable at top
- Key numbers (7,350 RPM, ~12M uncached TPM) should be the LARGEST text elements
- Labels clear and appropriately sized
- ALL-CAPS for section headers

## Layout Guidelines

Dashboard layout with 4 primary widgets arranged in a 2×2 grid, each answering one of the 4 capacity planning questions. A thin banner at top provides context (what we're building). Each widget has a clear header matching the question being answered.

### Structure
- Top banner: context strip (what we're building, why)
- Widget 1 (top-left): MODELS OF INTEREST
- Widget 2 (top-right): REQUESTS PER MINUTE
- Widget 3 (bottom-left): UNCACHED TOKENS PER MINUTE
- Widget 4 (bottom-right): CACHEABILITY

### Visual Elements
- Big numbers for headline KPIs
- Clean data tables inside widgets
- Percentage gauges or bars for cacheability
- Color-coded model tiles

## Style Guidelines

Technical diagrams with engineering precision and clean geometry.

### Color Palette
- Primary: Blues (#2563EB), teals, grays, white lines
- Background: Deep blue (#1E3A5F) with subtle grid
- Accents: Amber/gold (#F59E0B) for key headline numbers, cyan for callouts
- Model cards: slight color differentiation per model

### Visual Treatment
- Geometric precision, clean vector shapes
- Subtle grid pattern in background
- Blueprint aesthetic — precise, engineering feel
- Consistent stroke weights
- Minimal ornamentation — let the data speak

### Typography
- Clean sans-serif
- ALL-CAPS section headers
- Headline numbers very large and bold (amber/gold)
- Table text clean and legible

---

Generate the infographic based on the content below:

# CEREBRAS CAPACITY RESERVATION — ADOBE 2026

## CONTEXT BANNER (top strip)

What we're building: AI-generated product/recipe/support pages on AEM Edge Delivery Services.
Each page = 7 Cerebras calls across 3 models.
Capacity needed for 100 demo sites + 10 production sites.

---

## WIDGET 1: MODELS OF INTEREST (top-left)

Answer the question: "Which models does Adobe need reserved?"

Four models, two primary + one lightweight + one under evaluation:

| Model | Role | Per-Page Profile |
|-------|------|-----------------|
| gpt-oss-120b | Reasoning (block selection, intent, journey) | 1 call/page, ~13,500 tokens (heaviest) |
| llama-3.3-70b | Content generation (HTML blocks, hero, suggestions) | 5 calls/page, ~2,240 tokens avg |
| llama-3.1-8b | Classification (intent type, entities, stage) | 1 call/page, ~430 tokens (lightweight) |
| zai-glm-4.7 | UNDER EVALUATION | Potential replacement for reasoning or content roles |

Note for zai-glm-4.7: Reserving eval capacity equivalent to whichever role it fills + 20% headroom for A/B testing.

Total per page: 7 calls, ~25,000 tokens

---

## WIDGET 2: REQUESTS PER MINUTE (top-right)

Answer the question: "How many RPM does Adobe need?"

Realistic peak scenario (2-3 sites peaking simultaneously):

| Model | RPM |
|-------|-----|
| gpt-oss-120b | 1,050 |
| llama-3.3-70b | 5,250 |
| llama-3.1-8b | 1,050 |
| **TOTAL** | **7,350 RPM** |

Show 7,350 as the dominant headline number in this widget. Visualize per-model breakdown as horizontal bars.

---

## WIDGET 3: UNCACHED TOKENS PER MINUTE (bottom-left)

Answer the question: "How many uncached tokens/min does Adobe need?"

After prompt prefix caching (62% of input tokens are cacheable):

| Model | Uncached TPM |
|-------|-------------|
| gpt-oss-120b | ~3.6M |
| llama-3.3-70b | ~8.3M |
| llama-3.1-8b | ~133K |
| **TOTAL** | **~12M** |

Show ~12M as the dominant headline number. Per-model bars below.
Callout: "62% of input tokens are identical across requests (system prompts, product catalog, block templates)"

---

## WIDGET 4: CACHEABILITY (bottom-right)

Answer the question: "What is the cacheability across experimentation and production?"

Two phases with different cache effectiveness:

| Phase | Net Cacheable Rate | What's Included |
|-------|-------------------|-----------------|
| Experimentation | ~65-70% | Prompt prefix cache + some query overlap |
| Production | ~70-77% | Prompt prefix cache + 20-40% query-level dedup |

Underlying cache layers:
- Prompt prefix: 62% of input tokens (system prompts, product catalog, block templates)
- Query response cache: 20-40% RPM reduction (production, not yet implemented)

Optimization levers not yet pulled:
- Query-level response caching (20-40% RPM reduction)
- Tiered generation — skip reasoning for simple queries (~15% of traffic)
- Block-level output caching
- Reasoning prompt compression (~30% reducible)

Show the experimentation vs production cacheability as two prominent gauges or bars (65-70% vs 70-77%). List optimization levers as a compact bullet list below.

---

Text labels (in English):

Title: "CEREBRAS CAPACITY RESERVATION — ADOBE 2026"
Context: "AI-generated pages on AEM Edge Delivery | 7 calls × 3 models per page | 100 demo + 10 production sites"
Widget 1 header: "MODELS OF INTEREST"
Widget 2 header: "REQUESTS PER MINUTE"
Widget 3 header: "UNCACHED TOKENS PER MINUTE"
Widget 4 header: "CACHEABILITY"
Headline numbers: "7,350 RPM", "~12M UNCACHED TPM", "65-70%", "70-77%"
