# Cerebras Capacity Reservation — Adobe 2026

## Overview
Adobe requires Cerebras inference capacity to power AI-generated content across 100 demo sites and 10 production sites. Each page generation triggers 7 API calls across 3 models, demanding up to ~7,350 RPM and ~26.4M tokens/min at realistic peak.

## Learning Objectives
The viewer will understand:
1. Which models Adobe needs and their roles/token profiles
2. The scale of RPM and TPM demand across escalating scenarios
3. How prompt prefix and query response caching reduce uncached capacity needs

---

## Section 1: Models of Interest

**Key Concept**: Four models serve distinct roles; two dominate >99% of token volume.

**Content**:
- gpt-oss-120b: Reasoning (block selection, intent analysis, journey planning). ~13,500 tokens/call. 1 call/page. Heaviest per-call usage.
- llama-3.3-70b: Content generation (HTML blocks, hero, follow-up suggestions). ~2,240 tokens/call avg. 5 calls/page. Most frequent.
- llama-3.1-8b: Classification (intent type, entities, journey stage). ~430 tokens/call. 1 call/page. Lightest.
- zai-glm-4.7: Under evaluation. Potential replacement for reasoning or content roles. Capacity TBD.
- gpt-oss-120b + llama-3.3-70b = >99% of token volume

**Visual Element**:
- Type: icon cards / model profile tiles
- Subject: 4 model cards showing role, tokens/call, calls/page
- Treatment: Each model as a labeled tile with key stats; gpt-oss-120b and llama-3.3-70b visually emphasized as dominant

**Text Labels**:
- Headline: "Models of Interest"
- Labels: "gpt-oss-120b", "llama-3.3-70b", "llama-3.1-8b", "zai-glm-4.7"
- Callout: ">99% of token volume"

---

## Section 2: Requests Per Minute (RPM)

**Key Concept**: RPM scales from 35 (demo) to 7,350 (realistic peak) to 35,000 (worst case).

**Content**:
- Demo peak: 35 RPM
- Prod sustained: 406 RPM
- Prod realistic peak: 7,350 RPM (2-3 sites peaking + 8 at baseline)
- Prod worst case: 35,000 RPM (all 10 sites at peak)

**Visual Element**:
- Type: horizontal bar chart or escalating gauge
- Subject: 4 scenario bars showing RPM scale
- Treatment: Logarithmic or stepped scale highlighting realistic peak (7,350) as the primary planning number

**Text Labels**:
- Headline: "Requests Per Minute"
- Labels: "Demo Peak: 35", "Prod Sustained: 406", "Prod Realistic Peak: 7,350", "Prod Worst Case: 35,000"

---

## Section 3: Uncached Tokens Per Minute

**Key Concept**: Prompt prefix caching reduces raw token demand by ~61%, cutting realistic peak from 26.4M to ~10.3M uncached tokens/min.

**Content**:
- Prod sustained: 1.46M total → ~568K uncached
- Prod realistic peak: 26.4M total → ~10.3M uncached
- Prod worst case: 126M total → ~49M uncached
- Savings: 61% reduction via prompt prefix caching

**Visual Element**:
- Type: paired bars or waterfall chart
- Subject: Total vs uncached tokens side by side for each scenario
- Treatment: Cached portion shown as reduced/faded; uncached portion bold/highlighted

**Text Labels**:
- Headline: "Uncached Tokens Per Minute"
- Labels: "Total: 26.4M → Uncached: 10.3M", "61% savings"
- Subhead: "After prompt prefix caching"

---

## Section 4: Cacheability

**Key Concept**: 62% of input tokens are cacheable via prompt prefix; an additional 20-40% of production queries can be cached at the response level.

**Content**:
- Overall prompt prefix caching: 62% of input tokens
- Per-model: gpt-oss-120b 85% cacheable, llama-3.3-70b 30% cacheable, llama-3.1-8b 71% cacheable
- Query response cache (experimentation): 10-20%
- Query response cache (production): 20-40%
- Net uncached rate in production: ~23-30% of total

**Visual Element**:
- Type: percentage gauges or stacked bar
- Subject: Cache rates per model + overall; layered caching effect
- Treatment: Two-layer visualization — prompt prefix cache (62%) then query response cache (20-40%) showing compounding reduction

**Text Labels**:
- Headline: "Cacheability"
- Labels: "Prompt Prefix: 62%", "gpt-oss-120b: 85%", "llama-3.3-70b: 30%", "llama-3.1-8b: 71%"
- Callout: "Net uncached: ~23-30%"

---

## Data Points (Verbatim)

### Statistics
- "7 API calls per page generation"
- "~25,000 tokens per page"
- "7,350 RPM at realistic peak"
- "26.4M tokens/min at realistic peak"
- "~10.3M uncached tokens/min at realistic peak"
- "62% of input tokens cacheable via prompt prefix"
- "85% cache rate for gpt-oss-120b"
- "30% cache rate for llama-3.3-70b"
- "71% cache rate for llama-3.1-8b"
- "20-40% query response cache rate in production"
- "~23-30% net uncached rate in production"
- "~7M monthly requests"
- "~25.1B monthly tokens"
- ">99% of token volume from gpt-oss-120b + llama-3.3-70b"

### Key Terms
- **Prompt prefix caching**: Reuse of identical prompt prefixes (system prompts, catalogs, templates) across requests
- **Query response caching**: Caching entire generated pages by normalized query (not yet implemented)
- **RPM**: Requests per minute
- **TPM**: Tokens per minute

---

## Design Instructions

### Style Preferences
- Minimal style — clean lines, no ornamentation
- Muted color palette
- Strong data hierarchy — headline numbers large and prominent

### Layout Preferences
- Data-focused dashboard layout
- Clear section separation
- Metrics as primary visual element

### Other Requirements
- English language
- Landscape (16:9) or portrait (9:16) orientation
- Target audience: technical capacity planning teams
