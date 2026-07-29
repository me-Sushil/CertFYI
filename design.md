---
version: alpha
name: "Welike Light"
description: "Welike is a productivity app landing page built on a single typeface (Plus Jakarta Sans) with a strong weight-based hierarchy. The design uses an off-white (#f3f3f3) background, near-black (#111213) text, and a warm orange-to-coral accent palette for CTAs and headline highlights. Pill-shaped buttons (50px radius) and soft multi-layer shadows define the elevation language. The hero section features an oversized 84px bold headline with a gradient-colored accent phrase, centered layout, and a prominent download CTA."
colors:
  accent-blue: "#1a83ff"
  accent-green: "#0eb579"
  accent-orange: "#ff440f"
  accent-peach: "#fe8f57"
  pure-white: "#ffffff"
  surface-base: "#f3f3f3"
  heading-black: "#111213"
  paragraph-text: "#111213"
  border-subtle: "#111213"
typography:
  hero-display:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "84px"
    fontWeight: "800"
    lineHeight: "90.72px"
    letterSpacing: "-1px"
  section-heading:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "60px"
    fontWeight: "800"
    lineHeight: "67.2px"
    letterSpacing: "-1px"
  sub-heading-large:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "74px"
    fontWeight: "800"
    lineHeight: "74px"
    letterSpacing: "-1px"
  card-heading:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "30px"
    fontWeight: "800"
    lineHeight: "36px"
    letterSpacing: "-0.8px"
  small-heading:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "22px"
    fontWeight: "800"
    lineHeight: "28.6px"
    letterSpacing: "-0.5px"
  body-default:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "18px"
    fontWeight: "400"
    lineHeight: "30.6px"
  body-medium:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "18px"
    fontWeight: "500"
    lineHeight: "25.2px"
  body-bold:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "18px"
    fontWeight: "700"
    lineHeight: "25.2px"
  label-semibold:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "15px"
    fontWeight: "600"
    lineHeight: "19.5px"
  caption-small:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "12px"
    fontWeight: "500"
    lineHeight: "15.6px"
  nav-link:
    fontFamily: "Plus Jakarta Sans"
    fontSize: "16px"
    fontWeight: "400"
    lineHeight: "27.2px"
rounded:
  pill: "50px"
  card: "20px"
  badge: "48px"
spacing:
  xs: "5px"
  sm: "8px"
  md-1: "10px"
  md-2: "12px"
  md-3: "14px"
  md-4: "15px"
  md-5: "17px"
  md-6: "18px"
  lg-1: "20px"
  lg-2: "22px"
  lg-3: "25px"
  lg-4: "28px"
  xl-1: "33px"
  xl-2: "38px"
  xl-3: "40px"
  xl-4: "45px"
components:
  announcement-badge:
    rounded: "{rounded.badge}"
    backgroundColor: "rgb(255, 255, 255)"
    fontSize: "15px"
    fontWeight: "600"
    padding: "6px 10px"
  button-dark-fill-nav:
    backgroundColor: "rgb(17, 18, 19)"
    textColor: "rgb(255, 255, 255)"
    rounded: "{rounded.pill}"
    padding: "22px 38px"
    fontSize: "18px"
    fontWeight: "600"
    boxShadow: "rgba(17, 18, 19, 0.12) 0px 22px 40px -5px"
  button-white-fill-hero:
    backgroundColor: "rgb(255, 255, 255)"
    textColor: "rgb(17, 18, 19)"
    rounded: "{rounded.pill}"
    padding: "22px 38px"
    fontSize: "18px"
    fontWeight: "600"
    boxShadow: "rgba(17, 18, 19, 0.12) 0px 22px 40px -5px"
  card:
    rounded: "{rounded.card}"
    backgroundColor: "rgb(255, 255, 255)"
    boxShadow: "rgba(17, 18, 19, 0.04) 0px 18px 35px -5px"
    padding: "{spacing.lg-3}"
  display-text:
    fontSize: "84px"
    fontWeight: "800"
    lineHeight: "90.72px"
    letterSpacing: "-1px"
    textColor: "rgb(17, 18, 19)"
  hero:
    padding: "200px 25px 0px"
    backgroundColor: "rgba(0, 0, 0, 0)"
    fontSize: "18px"
    textColor: "rgba(17, 18, 19, 0.7)"
  navigation:
    backgroundColor: "rgba(243, 243, 243, 0)"
    padding: "22px 35px"
    borderWidth: "0px 0px 1px"
    fontSize: "18px"
    textColor: "rgba(17, 18, 19, 0.7)"
---

## Overview

Welike is a productivity app landing page built on a single typeface (Plus Jakarta Sans) with a strong weight-based hierarchy. The design uses an off-white (#f3f3f3) background, near-black (#111213) text, and a warm orange-to-coral accent palette for CTAs and headline highlights. Pill-shaped buttons (50px radius) and soft multi-layer shadows define the elevation language. The hero section features an oversized 84px bold headline with a gradient-colored accent phrase, centered layout, and a prominent download CTA.

**Signature traits:**
- Single-family weight hierarchy: Builds hierarchy from Plus Jakarta Sans across 5 weights rather than multiple families.
- Soft, rounded geometry: Generous corner rounding up to 50px.
- Layered elevation: Depth comes from 3 validated shadow tokens.

## Colors

The palette uses 9 validated color tokens across 1 theme profile. Semantic roles stay attached to observed usage so generation agents can choose accents without inventing new color meaning.

**Semantic naming:**
- **content-text** maps to `heading-black`: Role "text" is grounded by usage context "Primary heading and body text color; used across all text elements".
- **surface-background** maps to `surface-base`: Role "background" is grounded by usage context "Page and section background; off-white neutral surface".
- **action-background** maps to `pure-white`: Role "background" is grounded by usage context "Card and button fill surfaces; nav and CTA button backgrounds".
- **content-background** maps to `accent-peach`: Role "background" is grounded by usage context "Secondary warm accent; gradient partner to accent orange".

### Text Scale
- **Heading Black** (#111213): Primary heading and body text color; used across all text elements. Role: text. {authored: rgb(17, 18, 19), space: rgb, alpha: 0}
- **Paragraph Text** (#111213): Body paragraph text at 70% opacity via --paragraphs variable. Role: text. {authored: rgb(17, 18, 19), space: rgb, alpha: 0}

### Interactive
- **Border Subtle** (#111213): Hairline borders at 15% opacity via CSS variable --border. Role: border. {authored: rgb(17, 18, 19), space: rgb, alpha: 0}

### Surface & Shadows
- **Accent Blue** (#1a83ff): Cool accent for feature highlights and iconography. Role: background. {authored: rgb(26, 131, 255), space: rgb, alpha: 0.15}
- **Accent Green** (#0eb579): Success/positive accent for feature badges or status indicators. Role: background. {authored: rgb(14, 181, 121), space: rgb, alpha: 0.15}
- **Accent Orange** (#ff440f): Primary accent used on CTA buttons, headline highlights, and brand marks. Role: background. {authored: rgb(255, 68, 15), space: rgb, alpha: 0.15}
- **Accent Peach** (#fe8f57): Secondary warm accent; gradient partner to accent orange. Role: background. {authored: rgb(254, 143, 87), space: rgb, alpha: 0.15}
- **Pure White** (#ffffff): Card and button fill surfaces; nav and CTA button backgrounds. Role: background. {authored: rgb(255, 255, 255), space: rgb, alpha: 0.7}
- **Surface Base** (#f3f3f3): Page and section background; off-white neutral surface. Role: background. {authored: rgb(243, 243, 243), space: rgb, alpha: 0}

## Typography

Typography uses Plus Jakarta Sans across extracted hierarchy roles. Keep hierarchy mapped to these token rows before adding decorative type styles.

Uses Plus Jakarta Sans throughout for a uniform feel. Weight range spans bold, regular, medium, semi-bold. Sizes range from 12px to 84px.

### Font Roles
- **Headline Font**: Plus Jakarta Sans
- **Body Font**: Plus Jakarta Sans

### Type Scale Evidence
| Role | Font | Size | Weight | Line Height | Letter Spacing | Stack / Features | Notes |
|------|------|------|--------|-------------|----------------|------------------|-------|
| Primary hero headline; largest display text on the page | Plus Jakarta Sans | 84px | 800 | 90.72px | -1px | Plus Jakarta Sans, sans-serif | Extracted token |
| Section-level headings below the hero | Plus Jakarta Sans | 60px | 800 | 67.2px | -1px | Plus Jakarta Sans, sans-serif | Extracted token |
| Alternate large display heading variant | Plus Jakarta Sans | 74px | 800 | 74px | -1px | Plus Jakarta Sans, sans-serif | Extracted token |
| Card and feature block headings | Plus Jakarta Sans | 30px | 800 | 36px | -0.8px | Plus Jakarta Sans, sans-serif | Extracted token |
| Small section or callout headings | Plus Jakarta Sans | 22px | 800 | 28.6px | -0.5px | Plus Jakarta Sans, sans-serif | Extracted token |
| Primary body copy and nav link text | Plus Jakarta Sans | 18px | 400 | 30.6px | normal | Plus Jakarta Sans, sans-serif | Extracted token |
| Emphasized body text and secondary descriptions | Plus Jakarta Sans | 18px | 500 | 25.2px | normal | Plus Jakarta Sans, sans-serif | Extracted token |
| Bold inline body emphasis | Plus Jakarta Sans | 18px | 700 | 25.2px | normal | Plus Jakarta Sans, sans-serif | Extracted token |
| Button labels and UI control text | Plus Jakarta Sans | 15px | 600 | 19.5px | normal | Plus Jakarta Sans, sans-serif | Extracted token |
| Badges, tags, and small metadata labels | Plus Jakarta Sans | 12px | 500 | 15.6px | normal | Plus Jakarta Sans, sans-serif | Extracted token |
| Navigation menu items | Plus Jakarta Sans | 16px | 400 | 27.2px | normal | Plus Jakarta Sans, sans-serif | Extracted token |

## Layout

Layout rhythm is inferred from spacing tokens and responsive breakpoint evidence.

This system uses a 5px base grid with scale values 5, 8, 10, 12, 14, 15, 17, 18, 20, 22, 25, 28, 33, 38, 40, 45, 55, 65, 92.

### Spacing System
| Token | Value | Px | Notes |
|------|-------|----|-------|
| xs | 5px | 5 | Extracted spacing token |
| sm | 8px | 8 | Extracted spacing token |
| md-1 | 10px | 10 | Extracted spacing token |
| md-2 | 12px | 12 | Extracted spacing token |
| md-3 | 14px | 14 | Extracted spacing token |
| md-4 | 15px | 15 | Extracted spacing token |
| md-5 | 17px | 17 | Extracted spacing token |
| md-6 | 18px | 18 | Extracted spacing token |
| lg-1 | 20px | 20 | Extracted spacing token |
| lg-2 | 22px | 22 | Extracted spacing token |
| lg-3 | 25px | 25 | Extracted spacing token |
| lg-4 | 28px | 28 | Extracted spacing token |
| xl-1 | 33px | 33 | Extracted spacing token |
| xl-2 | 38px | 38 | Extracted spacing token |
| xl-3 | 40px | 40 | Extracted spacing token |
| xl-4 | 45px | 45 | Extracted spacing token |
| 2xl-1 | 55px | 55 | Extracted spacing token |
| 2xl-2 | 65px | 65 | Extracted spacing token |
| 3xl | 92px | 92 | Extracted spacing token |
| hero-top | 200px | 200 | Extracted spacing token |

## Elevation & Depth

Keep depth flat unless validated shadow or interaction evidence appears in the extraction payload. Do not invent shadows beyond this evidence boundary.

### Shadow Evidence
| Shadow Token | Layers | Details |
|--------------|--------|---------|
| shadow-subtle | 1 | 0px 18px 35px -5px rgba(17, 18, 19, 0.04) |
| shadow-medium | 1 | 0px 22px 40px -5px rgba(17, 18, 19, 0.12) |
| shadow-large | 1 | 0px 50px 70px 0px rgba(17, 18, 19, 0.12) |

### Interaction Signals
| Theme | Signal | Evidence |
|-------|--------|----------|
| Light | backdrop-filter | blur(30px) |
| Light | outline-color | rgba(17, 18, 19, 0.7) ; rgb(17, 18, 19) ; rgb(0, 0, 238) |
| Light | outline-width | 3px |
| Light | outline-offset | 0px |
| Light | transform | matrix(1, 0, 0, 1, 0, 0) ; matrix(1.3, 0, 0, 1.3, 0, 0) ; matrix(0.981627, -0.190809, 0.190809, 0.981627, 0, 0) |

## Shapes

Shape language maps directly to rounded tokens. Keep component corners consistent with the role mapping below before introducing bespoke geometry.

### Radius Roles
| Token | Value | Px | Role Mapping |
|------|-------|----|--------------|
| card | 20px | 20 | Card corner |
| badge | 48px | 48 | Large surface corner |
| pill | 50px | 50 | Large surface corner |

### Geometry Evidence
| Radius Token | Shape | Units |
|--------------|-------|-------|
| pill | 50px | px |
| card | 20px | px |
| badge | 48px | px |

## Components

Components should be recreated from token references first, then tuned with variant notes and probe-backed state guidance.
- **Primary CTA Button**: Pill-shaped download/action button with white background, strong shadow, and icon prefix
- **Release Badge**: Pill-shaped inline badge combining a muted label with a highlighted CTA link; used above hero headline
- **Navbar**: Transparent top navigation bar with logo left, nav links center, and CTA button right
- **Hero Section**: Full-width centered hero with oversized headline, subheadline, body copy, and CTA button; large top padding
- **Hero Headline**: Oversized 84px extra-bold headline with a warm gradient accent on key phrase
- **Feature Card**: Rounded card with subtle shadow used to showcase app features

### Announcement Badge

**Default**
- rounded: 48px
- backgroundColor: rgb(255, 255, 255)
- fontSize: 15px
- fontWeight: 600
- padding: 6px 10px
- State guidance: Two-part pill: left segment shows version label, right segment shows 'See what's new' with arrow; overall pill shape ~48px radius

### Button

**Dark Fill (Nav)**
- backgroundColor: rgb(17, 18, 19)
- textColor: rgb(255, 255, 255)
- rounded: 50px
- padding: 22px 38px
- fontSize: 18px
- fontWeight: 600
- boxShadow: rgba(17, 18, 19, 0.12) 0px 22px 40px -5px
- State guidance: Used in navbar; dark background (#111213), white text, pill radius 50px, padding 22px 38px

**White Fill (Hero)**
- backgroundColor: rgb(255, 255, 255)
- textColor: rgb(17, 18, 19)
- rounded: 50px
- padding: 22px 38px
- fontSize: 18px
- fontWeight: 600
- boxShadow: rgba(17, 18, 19, 0.12) 0px 22px 40px -5px
- State guidance: Used in hero section; white background, near-black text, pill radius 50px, same shadow

### Card

**Default**
- rounded: 20px
- backgroundColor: rgb(255, 255, 255)
- boxShadow: rgba(17, 18, 19, 0.04) 0px 18px 35px -5px
- padding: 25px
- State guidance: 20px border radius, shadow-subtle or shadow-medium, white background, internal padding ~25-40px

### Display Text

**Default**
- fontSize: 84px
- fontWeight: 800
- lineHeight: 90.72px
- letterSpacing: -1px
- textColor: rgb(17, 18, 19)
- State guidance: 84px w800, -1px letter-spacing, #111213 base color; accent phrase uses warm orange gradient (#ff7a22 → #ff4ab9 or similar)

### Hero

**Default**
- padding: 200px 25px 0px
- backgroundColor: rgba(0, 0, 0, 0)
- fontSize: 18px
- textColor: rgba(17, 18, 19, 0.7)
- State guidance: 200px top padding, 25px horizontal padding, transparent background, 84px w800 headline with gradient accent phrase

### Navigation

**Default**
- backgroundColor: rgba(243, 243, 243, 0)
- padding: 22px 35px
- borderWidth: 0px 0px 1px
- fontSize: 18px
- textColor: rgba(17, 18, 19, 0.7)
- State guidance: Transparent background, 22px 35px padding, 1px bottom border at 0 opacity (invisible), 18px body text for links

## Do's and Don'ts

Guardrails protect Single-family weight hierarchy, Soft, rounded geometry, Layered elevation without adding unsupported visual claims.

| Do | Don't |
|----|---------|
| Do maintain consistent spacing using the base grid | Don't make unsupported claims about absent visual features |
| Do maintain WCAG AA contrast ratios (4.5:1 for normal text) | Don't mix rounded and sharp corners in the same view |
| Do use the primary color only for the single most important action per screen |  |
| Do verify evidence before writing new design-system guidance |  |

## Responsive Evidence

### Breakpoints

No distinct responsive breakpoints were extracted.

## Agent Prompt Guide

### Example Component Prompts
- Create Feature Card variant that preserves Rounded card with subtle shadow used to showcase app features.
- Create Hero Headline variant that preserves Oversized 84px extra-bold headline with a warm gradient accent on key phrase.
- Create Hero Section variant that preserves Full-width centered hero with oversized headline, subheadline, body copy, and CTA button; large top padding.

### Iteration Guide
1. Start with extracted palette and typography roles only.
2. Map spacing and radius directly from token tables before visual polish.
3. Apply component patterns one section at a time and compare against source intent.
4. Keep elevation claims tied to explicit evidence in output.
5. Iterate with smallest diffs and re-check section hierarchy after each change.




@theme {
  /* Colors */
  --color-heading-black: #111213;
  --color-surface-base: #f3f3f3;
  --color-pure-white: #ffffff;
  --color-accent-orange: #ff440f;
  --color-accent-peach: #fe8f57;
  --color-accent-blue: #1a83ff;
  --color-accent-green: #0eb579;
  --color-border-subtle: #111213;
  --color-paragraph-text: #111213;

  /* Spacing */
  --spacing-xs: 5px;
  --spacing-sm: 8px;
  --spacing-md-1: 10px;
  --spacing-md-2: 12px;
  --spacing-md-3: 14px;
  --spacing-md-4: 15px;
  --spacing-md-5: 17px;
  --spacing-md-6: 18px;
  --spacing-lg-1: 20px;
  --spacing-lg-2: 22px;
  --spacing-lg-3: 25px;
  --spacing-lg-4: 28px;
  --spacing-xl-1: 33px;
  --spacing-xl-2: 38px;
  --spacing-xl-3: 40px;
  --spacing-xl-4: 45px;
  --spacing-2xl-1: 55px;
  --spacing-2xl-2: 65px;
  --spacing-3xl: 92px;
  --spacing-hero-top: 200px;

  /* Border Radius */
  --radius-pill: 50px;
  --radius-card: 20px;
  --radius-badge: 48px;

  /* Fonts */
  --font-plus-jakarta-sans: "Plus Jakarta Sans", sans-serif;

}





:root {
  /* Colors */
  --color-heading-black: #111213;
  --color-surface-base: #f3f3f3;
  --color-pure-white: #ffffff;
  --color-accent-orange: #ff440f;
  --color-accent-peach: #fe8f57;
  --color-accent-blue: #1a83ff;
  --color-accent-green: #0eb579;
  --color-border-subtle: #111213;
  --color-paragraph-text: #111213;

  /* Typography */
  --font-hero-display-family: Plus Jakarta Sans;
  --font-hero-display-size: 84px;
  --font-hero-display-weight: 800;
  --font-hero-display-line-height: 90.72px;
  --font-hero-display-letter-spacing: -1px;
  --font-section-heading-family: Plus Jakarta Sans;
  --font-section-heading-size: 60px;
  --font-section-heading-weight: 800;
  --font-section-heading-line-height: 67.2px;
  --font-section-heading-letter-spacing: -1px;
  --font-sub-heading-large-family: Plus Jakarta Sans;
  --font-sub-heading-large-size: 74px;
  --font-sub-heading-large-weight: 800;
  --font-sub-heading-large-line-height: 74px;
  --font-sub-heading-large-letter-spacing: -1px;
  --font-card-heading-family: Plus Jakarta Sans;
  --font-card-heading-size: 30px;
  --font-card-heading-weight: 800;
  --font-card-heading-line-height: 36px;
  --font-card-heading-letter-spacing: -0.8px;
  --font-small-heading-family: Plus Jakarta Sans;
  --font-small-heading-size: 22px;
  --font-small-heading-weight: 800;
  --font-small-heading-line-height: 28.6px;
  --font-small-heading-letter-spacing: -0.5px;
  --font-body-default-family: Plus Jakarta Sans;
  --font-body-default-size: 18px;
  --font-body-default-weight: 400;
  --font-body-default-line-height: 30.6px;
  --font-body-medium-family: Plus Jakarta Sans;
  --font-body-medium-size: 18px;
  --font-body-medium-weight: 500;
  --font-body-medium-line-height: 25.2px;
  --font-body-bold-family: Plus Jakarta Sans;
  --font-body-bold-size: 18px;
  --font-body-bold-weight: 700;
  --font-body-bold-line-height: 25.2px;
  --font-label-semibold-family: Plus Jakarta Sans;
  --font-label-semibold-size: 15px;
  --font-label-semibold-weight: 600;
  --font-label-semibold-line-height: 19.5px;
  --font-caption-small-family: Plus Jakarta Sans;
  --font-caption-small-size: 12px;
  --font-caption-small-weight: 500;
  --font-caption-small-line-height: 15.6px;
  --font-nav-link-family: Plus Jakarta Sans;
  --font-nav-link-size: 16px;
  --font-nav-link-weight: 400;
  --font-nav-link-line-height: 27.2px;

  /* Spacing */
  --spacing-xs: 5px;
  --spacing-sm: 8px;
  --spacing-md-1: 10px;
  --spacing-md-2: 12px;
  --spacing-md-3: 14px;
  --spacing-md-4: 15px;
  --spacing-md-5: 17px;
  --spacing-md-6: 18px;
  --spacing-lg-1: 20px;
  --spacing-lg-2: 22px;
  --spacing-lg-3: 25px;
  --spacing-lg-4: 28px;
  --spacing-xl-1: 33px;
  --spacing-xl-2: 38px;
  --spacing-xl-3: 40px;
  --spacing-xl-4: 45px;
  --spacing-2xl-1: 55px;
  --spacing-2xl-2: 65px;
  --spacing-3xl: 92px;
  --spacing-hero-top: 200px;

  /* Border Radius */
  --radius-pill: 50px;
  --radius-card: 20px;
  --radius-badge: 48px;

}



{
  "color": {
    "Heading Black": {
      "$type": "color",
      "$value": "#111213",
      "$description": "Primary heading and body text color; used across all text elements"
    },
    "Surface Base": {
      "$type": "color",
      "$value": "#f3f3f3",
      "$description": "Page and section background; off-white neutral surface"
    },
    "Pure White": {
      "$type": "color",
      "$value": "#ffffff",
      "$description": "Card and button fill surfaces; nav and CTA button backgrounds"
    },
    "Accent Orange": {
      "$type": "color",
      "$value": "#ff440f",
      "$description": "Primary accent used on CTA buttons, headline highlights, and brand marks"
    },
    "Accent Peach": {
      "$type": "color",
      "$value": "#fe8f57",
      "$description": "Secondary warm accent; gradient partner to accent orange"
    },
    "Accent Blue": {
      "$type": "color",
      "$value": "#1a83ff",
      "$description": "Cool accent for feature highlights and iconography"
    },
    "Accent Green": {
      "$type": "color",
      "$value": "#0eb579",
      "$description": "Success/positive accent for feature badges or status indicators"
    },
    "Border Subtle": {
      "$type": "color",
      "$value": "#111213",
      "$description": "Hairline borders at 15% opacity via CSS variable --border"
    },
    "Paragraph Text": {
      "$type": "color",
      "$value": "#111213",
      "$description": "Body paragraph text at 70% opacity via --paragraphs variable"
    }
  },
  "typography": {
    "Hero Display": {
      "$type": "typography",
      "$value": {
        "fontFamily": "Plus Jakarta Sans",
        "fontSize": "84px",
        "fontWeight": 800,
        "lineHeight": "90.72px",
        "letterSpacing": "-1px"
      },
      "$description": "Primary hero headline; largest display text on the page"
    },
    "Section Heading": {
      "$type": "typography",
      "$value": {
        "fontFamily": "Plus Jakarta Sans",
        "fontSize": "60px",
        "fontWeight": 800,
        "lineHeight": "67.2px",
        "letterSpacing": "-1px"
      },
      "$description": "Section-level headings below the hero"
    },
    "Sub Heading Large": {
      "$type": "typography",
      "$value": {
        "fontFamily": "Plus Jakarta Sans",
        "fontSize": "74px",
        "fontWeight": 800,
        "lineHeight": "74px",
        "letterSpacing": "-1px"
      },
      "$description": "Alternate large display heading variant"
    },
    "Card Heading": {
      "$type": "typography",
      "$value": {
        "fontFamily": "Plus Jakarta Sans",
        "fontSize": "30px",
        "fontWeight": 800,
        "lineHeight": "36px",
        "letterSpacing": "-0.8px"
      },
      "$description": "Card and feature block headings"
    },
    "Small Heading": {
      "$type": "typography",
      "$value": {
        "fontFamily": "Plus Jakarta Sans",
        "fontSize": "22px",
        "fontWeight": 800,
        "lineHeight": "28.6px",
        "letterSpacing": "-0.5px"
      },
      "$description": "Small section or callout headings"
    },
    "Body Default": {
      "$type": "typography",
      "$value": {
        "fontFamily": "Plus Jakarta Sans",
        "fontSize": "18px",
        "fontWeight": 400,
        "lineHeight": "30.6px",
        "letterSpacing": "normal"
      },
      "$description": "Primary body copy and nav link text"
    },
    "Body Medium": {
      "$type": "typography",
      "$value": {
        "fontFamily": "Plus Jakarta Sans",
        "fontSize": "18px",
        "fontWeight": 500,
        "lineHeight": "25.2px",
        "letterSpacing": "normal"
      },
      "$description": "Emphasized body text and secondary descriptions"
    },
    "Body Bold": {
      "$type": "typography",
      "$value": {
        "fontFamily": "Plus Jakarta Sans",
        "fontSize": "18px",
        "fontWeight": 700,
        "lineHeight": "25.2px",
        "letterSpacing": "normal"
      },
      "$description": "Bold inline body emphasis"
    },
    "Label Semibold": {
      "$type": "typography",
      "$value": {
        "fontFamily": "Plus Jakarta Sans",
        "fontSize": "15px",
        "fontWeight": 600,
        "lineHeight": "19.5px",
        "letterSpacing": "normal"
      },
      "$description": "Button labels and UI control text"
    },
    "Caption Small": {
      "$type": "typography",
      "$value": {
        "fontFamily": "Plus Jakarta Sans",
        "fontSize": "12px",
        "fontWeight": 500,
        "lineHeight": "15.6px",
        "letterSpacing": "normal"
      },
      "$description": "Badges, tags, and small metadata labels"
    },
    "Nav Link": {
      "$type": "typography",
      "$value": {
        "fontFamily": "Plus Jakarta Sans",
        "fontSize": "16px",
        "fontWeight": 400,
        "lineHeight": "27.2px",
        "letterSpacing": "normal"
      },
      "$description": "Navigation menu items"
    }
  },
  "spacing": {
    "xs": {
      "$type": "dimension",
      "$value": "5px"
    },
    "sm": {
      "$type": "dimension",
      "$value": "8px"
    },
    "md-1": {
      "$type": "dimension",
      "$value": "10px"
    },
    "md-2": {
      "$type": "dimension",
      "$value": "12px"
    },
    "md-3": {
      "$type": "dimension",
      "$value": "14px"
    },
    "md-4": {
      "$type": "dimension",
      "$value": "15px"
    },
    "md-5": {
      "$type": "dimension",
      "$value": "17px"
    },
    "md-6": {
      "$type": "dimension",
      "$value": "18px"
    },
    "lg-1": {
      "$type": "dimension",
      "$value": "20px"
    },
    "lg-2": {
      "$type": "dimension",
      "$value": "22px"
    },
    "lg-3": {
      "$type": "dimension",
      "$value": "25px"
    },
    "lg-4": {
      "$type": "dimension",
      "$value": "28px"
    },
    "xl-1": {
      "$type": "dimension",
      "$value": "33px"
    },
    "xl-2": {
      "$type": "dimension",
      "$value": "38px"
    },
    "xl-3": {
      "$type": "dimension",
      "$value": "40px"
    },
    "xl-4": {
      "$type": "dimension",
      "$value": "45px"
    },
    "2xl-1": {
      "$type": "dimension",
      "$value": "55px"
    },
    "2xl-2": {
      "$type": "dimension",
      "$value": "65px"
    },
    "3xl": {
      "$type": "dimension",
      "$value": "92px"
    },
    "hero-top": {
      "$type": "dimension",
      "$value": "200px"
    }
  },
  "borderRadius": {
    "pill": {
      "$type": "dimension",
      "$value": "50px"
    },
    "card": {
      "$type": "dimension",
      "$value": "20px"
    },
    "badge": {
      "$type": "dimension",
      "$value": "48px"
    }
  }
}


