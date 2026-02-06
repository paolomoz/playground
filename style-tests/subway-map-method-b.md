# subway-map

Bold colored lines snapping to 45-degree and 90-degree angles on a clean white or pale cream field — the unmistakable language of Harry Beck's 1931 London Underground diagram, where geography surrenders to topology. Thick parallel-sided route lines in saturated primary and secondary colors intersect at interchange stations marked by bold circles or pips, station names set in crisp Johnston-style sans-serif along the routes. The River Thames reduced to a single pale blue curve. No terrain, no scale, no street-level reality — just the elegant abstraction of connections, transfers, and destinations compressed into a diagram that a million commuters can parse in seconds.

## Color Palette

- Primary: Line red (#E32017), line blue (#003688), line yellow (#FFD300), line green (#00782A)
- Extended Lines: Orange (#EE7C0E), purple/violet (#9B0056), teal/cyan (#0098D4), brown (#B36305), magenta/pink (#F3A9BB), grey (#A0A5A9), black (#000000)
- Background: Clean white (#FFFFFF) or very pale warm grey (#F4F3F1) — the diagram space, never colored
- Stations: White circle with colored ring (interchange), tick mark or pip (regular stop)
- Water: Pale blue (#C4E1F5) for river curves — the only geographic concession
- Text: Dense black (#1A1A1A) for station names, route names in their line color

### Palette Combinations

| Combination | Colors |
|-------------|--------|
| Classic London | Red + blue + yellow + green + brown + black lines on white, pale blue Thames curve |
| New York | Orange + blue + green + red + purple + yellow numbered routes on white, bold circles at stops |
| Tokyo Metro | Multiple saturated line colors (teal, orange, vermillion, violet, green, brown) on white, numbered circles at stations |
| Minimal | Two or three bold line colors only (red + blue + green) on white — maximum clarity, minimum palette |
| Dark Mode | Bold colored lines on dark charcoal (#2D2D2D) background — lines glow against the dark field |

## Variants

| Variant | Focus | Visual Emphasis |
|---------|-------|-----------------|
| **Beck Classic** | Original London Underground topology — lines at 45/90 degrees, interchange circles, station ticks | Thick colored lines making sharp angular turns at exactly 45 or 90 degrees, white interchange circles where lines cross, small perpendicular tick marks for regular stations, station names in horizontal Johnston-style sans-serif |
| **Vignelli Modern** | New York-inspired modernist clarity — bold Helvetica, colored route bullets | Cleaner, straighter lines favoring horizontal and vertical over diagonals, large bold colored circles with route numbers/letters, station names in Helvetica, more geometric grid feeling |
| **Multi-Modal** | Mixed transit types — rail, bus, ferry shown as different line styles | Solid lines for rail, dashed for bus, dotted for ferry, different line weights for express vs. local, mode-change symbols at transfer points |
| **Network Diagram** | Pure topological abstraction — no geographic reference at all | Lines and nodes arranged for maximum readability regardless of physical position, no river, no zone boundaries, pure graph theory made visual |

## Visual Elements

- **Thick route lines in saturated solid colors**: Each route a distinct bold color, lines maintain consistent width (4-6pt equivalent), running in straight segments connected by sharp turns at exactly 45 or 90 degrees — NEVER curved, NEVER freeform, NEVER at arbitrary angles
- **Interchange stations as bold circles**: Where two or more lines cross or meet, a white circle with a thick black or colored outline marks the transfer point — this is the visual anchor of the diagram
- **Regular stations as perpendicular tick marks**: Small bars crossing the route line at right angles, like hash marks on a ruler — simple, uniform, instantly readable
- **Station names in crisp horizontal sans-serif**: Johnston, Gill Sans, Helvetica, or similar — always horizontal (or at a consistent 45-degree angle along diagonal route segments), never rotated to follow the line
- **Lines running parallel when sharing a corridor**: When two or more routes share track, their colored lines run precisely parallel with a thin gap between them, creating a ribbon effect
- **Pale blue river or water feature**: The only geographic element permitted — a single smooth curve representing water, rendered in pale blue with no detail
- **Zone boundaries as thin concentric rings or dashed lines**: Fare zones shown as subtle circular boundaries, never dominant
- **Legend/key panel**: A clean rectangular box listing all line colors with their route names, set in the same sans-serif
- **Direction arrows at line termini**: Small arrows or enlarged terminal station circles at the end of each route
- **NO topography, NO streets, NO buildings, NO scale bars** — this is topology, not geography
- **NO gradients on route lines** — every line is a solid flat color, constant width
- **NO decorative elements, NO illustrations, NO icons beyond station markers** — pure diagrammatic abstraction
- **NO organic curves** — every line segment is ruler-straight, every turn is a sharp angular snap

## Compositional Patterns

| Content Structure | Composition | Reference |
|---|---|---|
| Hierarchy/levels | Express lines rendered thicker or in bolder colors, local lines thinner — the main trunk route dominates the center, branch lines radiate to edges | Central line as the backbone, feeder routes branching outward |
| Flow/process | Single route line with sequential station stops from start to finish — the most natural subway map reading: follow the line | Journey from origin to destination, station by station |
| Connections | Multiple colored lines intersecting at interchange circles — the power of the map is showing WHERE things connect | The Tube map's essence: which lines meet at which stations |
| Cycles | Circular or loop route (like London's Circle Line) enclosing other routes — the ring as containing structure | Circle Line encircling the core network |
| Comparison | Two parallel route lines running side by side with different stations — visual comparison of two paths to the same destination | Express vs. local routes, old plan vs. new plan |
| Categories | Different line colors representing different categories, all intersecting at shared interchange points | Each color = a category, interchanges = shared attributes |
| Growth | Route extending from its original terminus, new stations appearing as the line grows — historical or projected expansion | Network expansion over time, new branches sprouting |
| Networks | The full multi-line map with all interchanges — the complete system diagram showing all relationships simultaneously | The full network as a single coherent topological diagram |

## Visual Metaphor Mappings

| Abstract Concept | Subway Map Metaphor |
|---|---|
| Data/information | Stations — each stop is a data point, each named and positioned along its route |
| Processes | A single route line from origin to terminus, each station a step in sequence |
| Systems | The full multi-line network — all routes, all interchanges, all zones visible at once |
| Connections | Interchange circles where multiple colored lines converge — the transfer point |
| Growth | New stations and route extensions appearing, the network branching outward |
| Time | Station sequence along a line — earlier stations on the left, later on the right |
| Hierarchy | Line thickness or color saturation distinguishing express from local, major from minor |
| Protection | Zone boundaries — concentric rings defining fare zones around the center |
| Speed | Express routes that skip stations — the line passes through without a tick mark |
| Stability | Major interchange hubs — large circles where many lines converge, the anchors of the network |
| Users/people | Passenger icons at station entrances (if any), or simply implied by the network's human-centered design |
| Ideas | Terminus stations — the destination, the endpoint, where the journey was heading |
| Energy | The density of lines in the central core — more routes converging = more energy and activity |
| Branching/decisions | Fork in a route line — one color splitting into two directions, a decision point on the journey |

## Typography

- Johnston, Gill Sans, Helvetica, or a clean geometric sans-serif — the typeface IS the identity
- Station names always horizontal when possible, or at consistent 45 degrees along diagonal segments
- Medium weight for station names, bold for interchange stations and route names
- Title and legend set in the same typeface family, slightly larger weight
- Route identifiers (letters or numbers) displayed inside colored circles or rounded rectangles
- ALL-CAPS for line names and major interchanges, mixed case for regular stations
- Tight but comfortable letter-spacing — designed for rapid scanning, not leisurely reading
- NO decorative fonts, NO serif faces, NO hand-lettering, NO italic — pure functional sans-serif
- Text color: black for station names, white reversed out of colored circles for route identifiers

## Anti-Patterns

- **NOT a geographic map** — Subway maps deliberately distort geography for topological clarity. No accurate distances, no true-north orientation, no street grids, no terrain. If it looks like it could navigate you by car, it is wrong.
- **NOT a flowchart** — Flowcharts use boxes and decision diamonds. Subway maps use colored lines and station marks. No rectangular process boxes, no diamond decision nodes, no "yes/no" branching.
- **NOT an infographic with colored lines** — The lines must snap to 45/90-degree angles. Freeform curves, arbitrary angles, or organic swooping lines break the entire aesthetic. The angular constraint IS the style.
- **NOT a mind map** — Mind maps radiate organically from a center. Subway maps are structured topological diagrams with specific routes and interchange rules. No organic branching, no free-association layout.
- **NOT isometric or 3D** — Subway maps are flat 2D diagrams. No depth, no perspective, no raised platforms, no three-dimensional rendering of any kind.
- **NOT London Underground fan art** — This is not about reproducing the Tube map specifically. It is about using the LANGUAGE of transit diagrams (angular lines, station marks, interchange circles, bold route colors) as an information design tool for any subject.
- **NOT a circuit diagram or technical schematic** — While both are abstract diagrams, circuit schematics use specific electronic symbols (resistors, capacitors). Subway maps use transit-specific symbols (stations, interchanges, termini).
- This must look like a transit authority produced it as an official system diagram — clean, authoritative, scannable in seconds, every element serving wayfinding rather than decoration.

## Best For

Process flows and sequential steps, organizational structures and reporting lines, project roadmaps with milestones, system architectures showing connections, decision trees with clear paths, onboarding journeys, curriculum progressions, anything where the relationship between stops/steps matters more than the physical distance between them.
