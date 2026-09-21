# THE MIRROR — Master Design System Specification
> Built with UI/UX Pro Max Design Intelligence (`ui_ux_pro_max`)

## 1. Product Identity & Design Archetype
- **Product Name:** The Mirror
- **Domain:** Cognitive Mapping / AI Thought Planetarium / Personal Intellectual Journal
- **Primary Design Style:** **Soft UI Evolution + Modern Glassmorphism & Artisanal Luxury**
- **Mood / Atmosphere:** Ethereal, intellectual, luminous, tactile, editorial luxury
- **Target Accessibility:** WCAG AAA (Minimum 4.5:1 text contrast, focus-visible outlines, reduced-motion compliance)

---

## 2. Color System & Semantic Tokens

### 2.1 Primary & Functional Palettes
| Semantic Role | Light Mode (Champagne Alabaster) | Dark Mode (Cosmic Abyss) | Purpose / Usage |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#FDFBF7` (Warm Alabaster) | `#08080A` (Deep Abyss) | Main viewport canvas background |
| **Card / Surface** | `#FFFFFF` (Pure White) | `#121317` (Onyx) | Cards, panels, dialog surfaces |
| **Surface Translucent** | `rgba(255,255,255,0.88)` | `rgba(18,19,23,0.88)` | Frosted glass panels (`backdrop-filter: blur(20px)`) |
| **Paper Cream** | `#FAF5EB` (Warm Linen) | `#15161A` (Dark Parchment) | Manuscript slips, quote blocks, tactile cards |
| **Primary Brand** | `#7C3AED` (Royal Violet) | `#A8FF3E` (Neon Lime) | Primary action buttons, active tabs, glowing accents |
| **Primary Dim** | `rgba(124,58,237,0.08)` | `rgba(168,255,62,0.14)` | Active button backgrounds, hover glows |
| **Text Primary** | `#0F172A` (Slate Navy) | `#F8FAFC` (Snow White) | Headings, labels, primary readable text (AAA) |
| **Text Secondary** | `#334155` (Mid Slate) | `rgba(248,250,252,0.72)` | Body paragraphs, excerpt citations |
| **Text Muted** | `#64748B` (Cool Slate) | `rgba(248,250,252,0.42)` | Metadata, dates, secondary icons |
| **Border Translucent** | `rgba(15,23,42,0.08)` | `rgba(248,250,252,0.12)` | Glass card edges, dividers, button outlines |
| **Border Hover** | `rgba(124,58,237,0.35)` | `rgba(168,255,62,0.35)` | Interactive focus & hover perimeter |

### 2.2 Saturated Jewel Cluster Palettes
| Cluster Name | Color Hex | CSS Variable | Semantic Meaning |
| :--- | :--- | :--- | :--- |
| **Career & Ambition** | `#7C3AED` | `--c0` | Ambition, leadership, strategic execution |
| **Health & Vitality** | `#D97706` | `--c1` | Physical energy, morning routine, endurance |
| **Creative Projects** | `#E11D48` | `--c2` | Writing, side projects, visual creation |
| **Technology & Craft** | `#0284C7` | `--c3` | Deep systems, architecture, coding, tools |
| **Philosophy & Mind** | `#059669` | `--c4` | Solitude, meditation, cognitive clarity |
| **Orange Sunset** | `#EA580C` | `--c6` | Emerging non-obvious cross-connections |

---

## 3. Typography Scale & Hierarchy

### 3.1 Font Families
- **Editorial Luxury Headings:** `'Playfair Display', Georgia, serif`
- **Modern UI Text & Controls:** `'Plus Jakarta Sans', -apple-system, sans-serif`
- **Handcrafted Manuscript Slips:** `'Instrument Serif', Georgia, serif`
- **Data Metrics & Timestamps:** `'Space Mono', monospace`

### 3.2 Type Scale
- **Display 1 (Hero Title):** `clamp(52px, 8vw, 92px)` · Weight 400 / Italic · Line-height 1.04
- **Heading 1 (Section Titles):** `clamp(28px, 4vw, 44px)` · Weight 600 / Italic · Line-height 1.25
- **Heading 2 (Card / Panel Titles):** `20px–24px` · Weight 600 · Line-height 1.3
- **Body Large:** `16px–18px` · Weight 400 · Line-height 1.7
- **Body Regular:** `14px` · Weight 400 · Line-height 1.6
- **Caption / Metric:** `10px–12px` · Weight 700 / Monospace · Letter-spacing `0.1em`

---

## 4. Elevation & Shadow Tokens
- **`--shadow-xs`**: `0 1px 2px rgba(15, 23, 42, 0.04)`
- **`--shadow-sm`**: `0 2px 8px rgba(15, 23, 42, 0.06)`
- **`--shadow-md`**: `0 12px 28px -6px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 23, 42, 0.04)`
- **`--shadow-lg`**: `0 24px 48px -12px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.05)`
- **`--shadow-xl`**: `0 36px 80px -16px rgba(15, 23, 42, 0.16)`

---

## 5. Signature Components & Micro-Interactions

### 5.1 Floating Island Navigation Dock
- Centered floating glass pill header (`position: fixed; top: 16px; left: 50%; transform: translateX(-50%)`).
- Translucent frosted glass with `backdrop-filter: blur(20px)` and subtle rim border.
- Integrated pulsing live planetarium indicator, companion cat toggle, and theme switch.

### 5.2 Live Interactive Hero Constellation
- High-performance HTML5 Canvas simulation directly inside the hero.
- 10 interactive cognitive nodes with physics drift, velocity bounce, and cursor proximity response.
- Hovering or clicking nodes displays a sleek glassmorphic popover with title, cluster, and quotation excerpt.

### 5.3 Instant Thought Simulator Sandbox
- Embedded reflection tester on the landing page with sample chip presets.
- Interactive extraction simulation displaying real-time cognitive clusters, connection confidence, and Claude mirror observations.

### 5.4 Artisanal Paper Studio
- Deckled cotton paper card with embossed wax seal stamp (`MIRROR EST.26`).
- Tabbed interactive journal entries ("06:15 AM Sunrise", "00:42 AM Studio", "04:30 PM Rain").
- Letterpress and fountain pen ink aesthetics.

### 5.5 Curated Visual Memories Exhibition
- Fine art Polaroid-style photo cards with subtle organic tilt angles (`-1.2deg`, `+1.4deg`).
- Integrated camera aperture and lens metadata tags (`35mm f/1.8`, `50mm f/1.4`).
- Instant full-screen immersive lightbox modal with backdrop blur.

### 5.6 Canvas Synaptic Engine
- **Bloom Halos:** Multi-layer radial gradients around concept stars.
- **Traveling Energy Pulses:** Dynamic light packets traveling along active quadratic bezier curves.
- **Orbital Guide Rings:** Concentric dashed circles marking cognitive cluster perimeters.
- **Orbiting Photons:** High-speed orbital light beads circling selected thoughts.

### 5.7 Floating Cat Companion Dock (`oneko.js`)
- Floating micro-pod displaying the pixel cat avatar and status ("Hunting cursor", "Sleeping").
- Instant tactile toggle synchronized across navigation and floating HUD.
