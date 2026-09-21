# THE MIRROR — Master Design System Specification
> Generated with UI/UX Pro Max Design Intelligence (`ui_ux_pro_max`)

## 1. Product Identity & Design Archetype
- **Product Name:** The Mirror
- **Domain:** Cognitive Mapping / AI Thought Planetarium / Personal Intellectual Journal
- **Primary Design Style:** **Soft UI Evolution + Modern Glassmorphism**
- **Mood / Atmosphere:** Ethereal, intellectual, luminous, tactile, editorial luxury
- **Target Accessibility:** WCAG AAA (Minimum 4.5:1 text contrast, focus-visible outlines, reduced-motion compliance)

---

## 2. Color System & Semantic Tokens

### 2.1 Primary & Functional Palettes
| Semantic Role | Light Mode (Default) | Dark Mode (Cosmos) | Purpose / Usage |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#F8FAFC` (Alabaster) | `#080808` (Obsidian) | Main viewport canvas background |
| **Card / Surface** | `#FFFFFF` (Pure White) | `#121212` (Onyx) | Cards, panels, dialog surfaces |
| **Surface Translucent** | `rgba(255,255,255,0.88)` | `rgba(18,18,18,0.92)` | Frosted glass panels (`backdrop-filter: blur(20px)`) |
| **Surface Subtle** | `#F1F5F9` (Slate Tint) | `#1A1A1A` (Charcoal) | Input backgrounds, hover strips, chip pills |
| **Primary Brand** | `#7C3AED` (Royal Violet) | `#A8FF3E` (Neon Lime) | Primary action buttons, active tabs, glowing accents |
| **Primary Dim** | `rgba(124,58,237,0.08)` | `rgba(168,255,62,0.15)` | Active button backgrounds, hover glows |
| **Text Primary** | `#0F172A` (Slate Navy) | `#F8FAFC` (Warm White) | Headings, labels, primary readable text (AAA) |
| **Text Secondary** | `#334155` (Mid Slate) | `rgba(248,250,252,0.72)` | Body paragraphs, excerpt citations |
| **Text Muted** | `#64748B` (Cool Slate) | `rgba(248,250,252,0.42)` | Metadata, dates, secondary icons |
| **Border Translucent** | `rgba(15,23,42,0.08)` | `rgba(248,250,252,0.12)` | Glass card edges, dividers, button outlines |
| **Border Hover** | `rgba(124,58,237,0.35)` | `rgba(168,255,62,0.35)` | Interactive focus & hover perimeter |

### 2.2 Saturated Jewel Cluster Palettes
| Cluster Name | Color Hex | CSS Variable | Semantic Meaning |
| :--- | :--- | :--- | :--- |
| **Career & Ambition** | `#7C3AED` | `--cluster-violet` | Ambition, leadership, strategic execution |
| **Technology & Craft** | `#0284C7` | `--cluster-cyan` | Deep systems, architecture, coding, tools |
| **Philosophy & Mind** | `#059669` | `--cluster-emerald` | Solitude, meditation, cognitive clarity |
| **Creative Projects** | `#E11D48` | `--cluster-rose` | Writing, side projects, visual creation |
| **Health & Vitality** | `#D97706` | `--cluster-amber` | Physical energy, morning routine, endurance |
| **Orange Sunset** | `#EA580C` | `--cluster-orange` | Emerging non-obvious cross-connections |

---

## 3. Typography Scale & Hierarchy

### 3.1 Font Families
- **Editorial Luxury Headings:** `'Playfair Display', Georgia, serif`
- **Modern UI Text & Controls:** `'Plus Jakarta Sans', -apple-system, sans-serif`
- **Handcrafted Manuscript Slips:** `'Instrument Serif', Georgia, serif`
- **Data Metrics & Timestamps:** `'Space Mono', monospace`

### 3.2 Type Scale
- **Display 1 (Hero Title):** `clamp(48px, 7.5vw, 82px)` · Weight 700 / Italic · Line-height 1.05
- **Heading 1 (Section Titles):** `clamp(28px, 4vw, 42px)` · Weight 600 / Italic · Line-height 1.25
- **Heading 2 (Card / Panel Titles):** `20px–24px` · Weight 600 · Line-height 1.3
- **Body Large:** `16px` · Weight 400 · Line-height 1.65
- **Body Regular:** `14px` · Weight 400 · Line-height 1.6
- **Caption / Metric:** `11px–12px` · Weight 600 / Monospace · Letter-spacing `0.08em`

---

## 4. Elevation & Shadow Tokens
```css
--shadow-xs: 0 1px 2px rgba(15, 23, 42, 0.04);
--shadow-sm: 0 2px 8px rgba(15, 23, 42, 0.06);
--shadow-md: 0 12px 28px -6px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(15, 23, 42, 0.04);
--shadow-lg: 0 24px 48px -12px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.05);
--shadow-xl: 0 36px 80px -16px rgba(15, 23, 42, 0.16);
```

---

## 5. Border Radius & Shape Tokens
```css
--radius-xs: 4px;
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-full: 9999px;
```

---

## 6. Motion & Micro-Interaction Guidelines
- **Hover Transitions:** `all 0.18s cubic-bezier(0.16, 1, 0.3, 1)`
- **Tactile Active Press:** `transform: scale(0.97)` on `:active`
- **Card Lift:** `transform: translateY(-4px)` on `:hover`
- **Focus Rings:** `outline: none; box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.35);`
- **Accessibility:** `@media (prefers-reduced-motion: reduce)` disables scale and pulse transitions.

---

## 7. Anti-Patterns Avoided (Checklist)
- [x] **No Emojis as Functional Navigation Icons**: Replaced with clean inline SVGs.
- [x] **No Unstyled Focus States**: Every button and control has an accessible focus ring.
- [x] **No Low-Contrast Grey Text**: All body text strictly exceeds 4.5:1 WCAG contrast.
- [x] **No Layout Shifts**: Fixed dimensions for media and icons to prevent cumulative layout shift.
- [x] **No Dead Buttons**: Every interactive chip, pill, and button provides visual feedback and `cursor: pointer`.
