# A/B Style Generation Learnings

## Results Summary

| Method | Count | % |
|--------|-------|---|
| Method A preferred | 10 | 18% |
| Method B preferred | 31 | 55% |
| Discarded | 15 | 27% |

Method B wins **3:1** over Method A. The formal process produces better results in the majority of cases.

---

## 1. When Method A Wins (10 styles)

**Styles:** airline-travel-poster, atomic-age, bold-graphic, fantasy-map, golden-age-comics, googie, kandinsky, keith-haring, ligne-claire, constructivism

**Common characteristics:**
- **Iconic, pop-culture-dominant styles** with strong brand identity the LLM deeply understands
- **Bold, unambiguous visual signatures** — thick outlines, primary colors, few-element compositions
- **Well-known cultural movements** with extensive training data (mid-century modern, comics, propaganda art)
- **No close siblings in the library** that they need to be differentiated from

**Why Method A works here:** The LLM already has rich, accurate priors for these styles. The additional research and calibration of Method B adds verbosity but not new information. Method A's directness produces tighter, more confident descriptions that translate better to image generation.

**Example — Keith Haring:** Method A's anti-patterns are concise and punchy ("NOT thin lines — THE thick black outline is EVERYTHING"). Method B's are more exhaustive but the extra 4 anti-patterns didn't produce noticeably different images.

---

## 2. When Method B Wins (31 styles)

**Styles include:** art-nouveau, bauhaus, charley-harper, de-stijl, dia-de-muertos, futurism, isotype, jack-kirby, matsumoto, moebius, osamu-tezuka, patent-drawing, pop-art-lichtenstein, saul-bass, sumi-e, superflat, synthwave, tibetan-thangka...

**Common characteristics:**
- **Styles with close siblings** that need explicit differentiation (art-nouveau vs art-nouveau-mucha, bauhaus vs de-stijl, sumi-e vs shan-shui)
- **Artist-specific styles** for less universally-known artists (charley-harper, moebius, jack-kirby, matsumoto)
- **Cultural traditions** where LLM priors may be shallow (tibetan-thangka, dia-de-muertos, rinpa)
- **Technical/instructional styles** requiring precise specification (patent-drawing, isometric-technical, axonometric, isotype)

**Why Method B works here:** Two specific steps make the difference:

### Step 2: Format Calibration (reading existing styles)
Produces consistent structure — proper Palette Combinations tables with scene descriptions, correctly formatted Variants tables, matching section ordering. Method A styles often have slightly different structures that break visual consistency across the library.

### Step 3: Anti-Pattern Differentiation (cross-referencing adjacent styles)
**This is the single most impactful difference.** Method B anti-patterns:
- Name specific adjacent styles by ID ("NOT atomic-age/mid-century generic", "NOT Paul Rand", "NOT corporate Memphis")
- Include quantitative thresholds ("If you can count more than 10 shapes in one animal, it is TOO detailed")
- Repeat key constraints with aggressive emphasis ("Flat. Flat. Flat.", "ZERO gradients anywhere")
- Add 2-4x more anti-patterns than Method A

**Example — Charley Harper:**
- Method A: 5 generic anti-patterns ("NO realistic animal illustration", "NO gradients")
- Method B: 13 specific anti-patterns naming adjacent styles, with quantitative thresholds and repeated emphasis per constraint
- Result: Method B produces more distinctly "Harper" images that don't drift toward generic mid-century illustration

### Steps 1, 4, 5 (research, validation, reference images)
Lower impact. Web research rarely surfaces information the LLM doesn't already know. Validation catches minor formatting issues. Reference images from Unsplash are photos (not illustrations) and can actually add noise for illustration styles.

---

## 3. Discard Patterns (15 styles)

**Discarded:** botanical-illustration, chalkboard, claymation, corporate-memphis, craft-handmade, cubism, daniel-clowes, dr-seuss, kawaii, paul-rand, pixel-art, rinpa, subway-map, technical-schematic, treasure-map

**Categories of failure:**

| Category | Styles | Issue |
|----------|--------|-------|
| **Medium, not style** | chalkboard, claymation, craft-handmade | Describes a rendering technique, not a visual vocabulary. Produces generic images "rendered as chalk" |
| **Too generic/corporate** | corporate-memphis, technical-schematic | Indistinct from default illustration styles. No strong differentiating visual identity |
| **Too narrow for infographics** | pixel-art, subway-map, rinpa | Work for one layout type but fail badly across diverse content structures |
| **Redundant with better options** | cubism (→futurism), paul-rand (→saul-bass), botanical-illustration (→storybook-watercolor) | Similar visual territory covered by a style that scored better |
| **Not distinctive enough** | daniel-clowes, dr-seuss, kawaii, treasure-map | Generated images looked too similar to generic illustration or to other kept styles |

**Pre-flight gate:** Before generating any style, ask: "Can this style produce a recognizably different image for a bento-grid layout, a linear-progression layout, AND a tree-branching layout?" If no → skip.

---

## 4. Recommended Workflow for Future Style Generation

### "Method A+" (recommended default)

1. **Write from LLM knowledge** (like Method A) — fast, confident, captures core vocabulary
2. **Read 1 existing style file** for format calibration — ensures consistent structure (30s)
3. **Write aggressive Anti-Patterns** naming 3-5 specific adjacent styles in the library — the single most impactful quality differentiator (60s)
4. **Skip web research** — rarely adds value for well-known styles
5. **Skip Unsplash reference images** — photos add noise for illustration styles

**Estimated time:** ~150s per style (vs ~100s Method A, ~400s Method B)
**Expected quality:** ~90% of Method B at ~40% of the cost

### When to use full Method B

- The style is from a non-Western tradition the LLM may not deeply know (e.g., Tibetan thangka, Día de Muertos)
- The style is for a lesser-known artist where specific visual details matter (e.g., a specific illustrator's eye shape, line weight, or composition habit)
- The style has 3+ close siblings already in the library that must be clearly differentiated

### Anti-Pattern Writing Rules

1. **Name adjacent styles by ID**: "NOT bauhaus", "NOT de-stijl", "NOT constructivism"
2. **Include quantitative thresholds**: "maximum 6 shapes per figure", "at least 30% negative space"
3. **Repeat the #1 constraint 3x**: "Flat fills only. NO gradients. ZERO shading. Flat. Flat. Flat."
4. **Minimum 8 anti-patterns** for styles with close siblings, 5 for unique styles
5. **End with a grounding sentence**: "This must look like [specific real-world artifact]"

### Pre-Flight Quality Gate (before starting any new style)

Ask these 3 questions:
1. Can this style produce recognizably different images across 3+ layout types? (No → skip)
2. Is this a visual **style** or a rendering **medium**? (Medium → skip)
3. Does this overlap with an existing style in the library? (Yes → only proceed if explicitly differentiated)

---

## 5. Library Statistics After Curation

| Metric | Count |
|--------|-------|
| Total styles in sumi | 42 |
| Method A definitions | 10 |
| Method B definitions | 31 |
| Unchanged (ukiyo-e) | 1 |
| Discarded from original 57 | 15 |
| New styles added (from test batch) | 11 |
| Acceptance rate | 73% |
