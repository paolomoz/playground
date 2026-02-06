# Site Analysis Brief — Output Format Reference

## Structure

The exported markdown brief follows this structure:

### 1. Title & Summary Table
- Project name as H1
- Summary table with source URL, date, counts

### 2. Site Overview
- Global voice notes (not tied to specific elements)
- Global structure table showing confirmed landmarks (header/footer/nav/etc.)

### 3. Sitemap & Templates
- Pages grouped by template label (Homepage, Article, Product, etc.)
- Per-template table showing page title, path, element count, landmark count
- Per-page landmark list with selectors

### 4. Captured Elements
- Each element as an H3 with:
  - CSS selector
  - HTML tag
  - Source page
  - Screenshot reference
  - User notes
  - HTML snippet (in code block)
  - Associated voice notes (as blockquotes)

### 5. Block Mapping Suggestions
- Table mapping source elements to suggested EDS block types
- Auto-suggested based on element tag, label, and selector patterns

### 6. Voice Transcript Log
- Chronological table of all voice transcripts
- Includes timestamp, page context, and full text

### 7. Analysis Metadata
- Tool version, generation timestamp, project creation time
- Summary counts for pages, elements, transcripts, landmarks

## EDS Block Mapping Patterns

| Source Pattern | Suggested EDS Block |
|---------------|-------------------|
| hero, banner, jumbotron | Hero |
| nav, menu, navigation | Navigation / Header |
| footer | Footer |
| card, tile, teaser | Cards |
| carousel, slider | Carousel |
| accordion, faq | Accordion |
| tabs, tabbed | Tabs |
| form, input | Form |
| table | Table |
| video, player | Video / Embed |
| image, gallery | Image / Gallery |
| cta, button, action | Call-to-Action |
| sidebar, aside | Sidebar |
| list | List |
| heading, title | Section Heading |
| text, paragraph, article | Text / Columns |

## Notes for Processing

- Selectors are generated with priority: ID > data-attribute > tag.class > nth-child path
- HTML snippets are truncated to ~500 characters
- Screenshots are captured as base64 PNG (stored in extension, referenced in brief)
- Landmarks are only included if user-confirmed (auto-detected ones that were dismissed are excluded)
- Template labels are user-assigned; "Unlabeled" is the default group
