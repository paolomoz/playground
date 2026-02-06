# Site Analyzer — Process Analysis Brief

## Trigger

User provides a Site Analysis Brief (markdown file exported from the Site Analyzer Chrome Extension) and asks to process it, create a migration plan, or generate EDS blocks.

## Context

The Site Analysis Brief contains structured data captured during a live browsing session:
- Pages visited with template classifications
- DOM elements captured with CSS selectors and HTML snippets
- Semantic landmarks (header, footer, nav, etc.) with selectors
- Voice narration transcripts with page/element context
- Block mapping suggestions (auto-generated)

See `references/output-format.md` for the full brief structure.

## Processing Steps

### 1. Parse the Brief

Extract from the markdown:
- **Project metadata**: source URL, date, page/element counts
- **Sitemap**: pages grouped by template type
- **Landmarks**: confirmed semantic elements with selectors
- **Elements**: each captured element with selector, HTML, notes, and suggested block mapping
- **Voice notes**: user narration providing intent and context

### 2. Build Migration Plan

Using the extracted data, create a structured migration plan:

**a. Template Inventory**
- List each template type with representative pages
- Map template structure (header → sections → footer) using landmarks

**b. Block Inventory**
- For each captured element, refine the block mapping suggestion
- Consider the HTML structure, user notes, and voice context
- Group similar elements across pages into reusable blocks
- Identify which blocks are standard EDS blocks vs. custom

**c. Content Structure**
- Map the source site's content hierarchy to EDS document structure
- Identify content sections that map to EDS sections
- Note any content patterns (e.g., repeating card grids, alternating text/image)

### 3. Generate Output

Produce one of the following based on user request:

**Migration Brief** (default):
- Executive summary with scope and approach
- Template-by-template breakdown with block mapping
- Content structure recommendations
- Priority order for implementation
- Estimated block inventory (standard vs. custom)

**EDS Block Code**:
- If user asks for specific blocks, generate Edge Delivery Services block code
- Use the captured HTML snippets as reference for structure
- Follow EDS Content-Driven Development patterns
- Include block CSS and JS as needed

**Import Mapping**:
- If user asks for import configuration, generate selector-to-block mapping rules
- Format as import rules compatible with EDS importer

## Voice Note Interpretation

Voice notes provide crucial context that may not be in the DOM:
- Business intent ("this section should be the hero with a CTA")
- Migration decisions ("we want to merge these two sections")
- Priority signals ("this is the most important block")
- Design notes ("match this style but simplify")

Always incorporate voice note context when refining block mappings and migration plans.

## Example Interaction

```
User: Here's my site analysis brief [attaches markdown]. Create a migration plan.

Agent: I'll analyze your brief and create a structured migration plan...

[Parses brief, identifies 3 templates, 12 unique blocks, 8 standard + 4 custom]

# Migration Plan: [Project Name]

## Scope
- Source: example.com (15 pages, 3 templates)
- Target: Edge Delivery Services

## Templates
1. **Homepage** — Hero + Cards grid + CTA + Footer
2. **Article** — Header + Content + Sidebar + Related
3. **Product** — Gallery + Details + Specs + Reviews

## Block Inventory
| Block | Type | Pages | Priority |
|-------|------|-------|----------|
| Hero | Standard | Homepage, Landing | P0 |
| Cards | Standard | Homepage, Category | P0 |
| ...
```
