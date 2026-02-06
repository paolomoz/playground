---
title: "Cerebras Capacity Reservation — Adobe 2026"
topic: "technical/business"
data_type: "data/metrics"
complexity: "complex"
point_count: 12
source_language: "en"
user_language: "en"
---

## Main Topic
Cerebras inference capacity requirements for Adobe's AI-generated content platform, covering 100 demo sites and 10 production sites. Each page generation triggers 7 API calls across 3 models, with peak demand reaching ~7,350 RPM and ~26.4M tokens/min.

## Learning Objectives
After viewing this infographic, the viewer should understand:
1. Which AI models Adobe needs reserved on Cerebras and their roles (gpt-oss-120b, llama-3.3-70b, llama-3.1-8b, zai-glm-4.7)
2. The scale of requests per minute and tokens per minute at different load scenarios (demo, sustained, peak, worst case)
3. How cacheability (62% prompt prefix + 20-40% query response) dramatically reduces actual uncached capacity needs

## Target Audience
- **Knowledge Level**: Expert (infrastructure/capacity planning teams at Cerebras)
- **Context**: Evaluating a capacity reservation request from Adobe
- **Expectations**: Clear, quantified resource requirements with model-level breakdowns

## Content Type Analysis
- **Data Structure**: Multi-dimensional metrics (per-model, per-scenario), with caching as a cross-cutting concern
- **Key Relationships**: Models → roles → RPM/TPM; Scenarios escalate from demo → sustained → peak → worst case; Caching reduces uncached demand by ~61%
- **Visual Opportunities**: Big numbers for headline metrics (7,350 RPM, 26.4M TPM, 62% cache rate), bar/gauge charts for per-model breakdown, scenario escalation visualization

## Key Data Points (Verbatim)
- "gpt-oss-120b": Reasoning, ~13,500 tokens/call, 1 call/page, 85% cacheable
- "llama-3.3-70b": Content generation, ~2,240 tokens/call avg, 5 calls/page, 30% cacheable
- "llama-3.1-8b": Classification, ~430 tokens/call, 1 call/page, 71% cacheable
- "zai-glm-4.7": Under evaluation, capacity TBD
- "gpt-oss-120b + llama-3.3-70b represent >99% of token volume"
- RPM: Demo peak 35, Prod sustained 406, Prod realistic peak 7,350, Prod worst case 35,000
- Tokens/Min: Demo peak 126K, Prod sustained 1.46M, Prod realistic peak 26.4M, Prod worst case 126M
- Uncached Tokens/Min: Prod sustained ~568K, Prod realistic peak ~10.3M, Prod worst case ~49M
- Prompt prefix caching: 62% of input tokens
- Query response cache (production): 20-40%
- Net uncached rate in production: ~23-30% of total
- Monthly volume: ~7M requests, ~25.1B tokens

## Layout × Style Signals
- Content type: data/metrics → suggests dashboard
- Tone: technical, precise, capacity planning → suggests technical-schematic or ikea-manual
- Audience: expert infrastructure teams → suggests clean, professional, data-forward
- Complexity: complex (12+ data points) → suggests dense layout with clear sections
- User instruction: "minimal style" → suggests ikea-manual, ui-wireframe, or technical-schematic

## Design Instructions (from user input)
- Minimal style with clean lines
- Muted colors
- Strong data hierarchy
- Data-focused layout

## Recommended Combinations
1. **dashboard + technical-schematic** (Recommended): Best match for metrics-heavy content. Blueprint-style precision with clean geometry gives a minimal, data-forward feel. Grid pattern provides structure for multiple KPI widgets.
2. **dashboard + ikea-manual**: Ultra-minimal line art. Black lines on white with numbered sections. Maximum clarity, zero visual noise. Excellent for "just the numbers" presentation.
3. **bento-grid + ui-wireframe**: Modular grid in grayscale wireframe. Each cell holds a metric group. Clean separation of concerns with understated palette.
