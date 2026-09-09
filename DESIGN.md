---
name: HydroSentinel AI Design System
version: 2.5.0
description: Mission-critical hydrological disaster early warning and 3D spatial twin interface tokens and guidelines.
license: Apache-2.0
author: Team Quantum Minds

tokens:
  colors:
    canvas:
      void: #07090e
      surface: #0d121d
      surface-elevated: #131b2a
      surface-glass: rgba(13, 18, 29, 0.78)
      surface-overlay: rgba(7, 9, 14, 0.88)
    borders:
      subtle: rgba(255, 255, 255, 0.08)
      medium: rgba(255, 255, 255, 0.14)
      highlight: rgba(255, 255, 255, 0.22)
      rim-top: rgba(255, 255, 255, 0.12)
    text:
      primary: #f8fafc
      secondary: #94a3b8
      tertiary: #64748b
      inverse: #07090e
    brand:
      cyan: #06b6d4
      cyan-glow: rgba(6, 182, 212, 0.28)
      cyan-subtle: rgba(6, 182, 212, 0.10)
    status:
      nominal: #10b981
      nominal-glow: rgba(16, 185, 129, 0.25)
      nominal-subtle: rgba(16, 185, 129, 0.10)
      advisory: #f59e0b
      advisory-glow: rgba(245, 158, 11, 0.25)
      advisory-subtle: rgba(245, 158, 11, 0.10)
      critical: #ef4444
      critical-glow: rgba(239, 68, 68, 0.35)
      critical-subtle: rgba(239, 68, 68, 0.12)

  typography:
    font-family:
      sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
      mono: 'JetBrains Mono', 'Space Mono', 'Fira Code', monospace
    font-size:
      xs: 0.6875rem
      sm: 0.8125rem
      base: 0.9375rem
      lg: 1.0625rem
      xl: 1.25rem
      2xl: 1.5rem
      3xl: 1.875rem
      4xl: 2.25rem
    font-weight:
      regular: 400
      medium: 500
      semibold: 600
      bold: 700
    letter-spacing:
      tighter: -0.04em
      tight: -0.02em
      normal: 0em
      wide: 0.04em
      caps: 0.08em

  spacing:
    1: 0.25rem
    2: 0.5rem
    3: 0.75rem
    4: 1rem
    5: 1.25rem
    6: 1.5rem
    8: 2rem
    10: 2.5rem
    12: 3rem

  radii:
    xs: 4px
    sm: 8px
    md: 12px
    lg: 14px
    xl: 18px
    2xl: 24px
    full: 9999px

  shadows:
    bento: 0 8px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)
    bento-hover: 0 12px 40px rgba(0, 0, 0, 0.60), 0 0 20px rgba(6, 182, 212, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.20)
    rim-top: inset 0 1px 0 0 rgba(255, 255, 255, 0.12)
    glow-cyan: 0 0 24px rgba(6, 182, 212, 0.35)
    glow-critical: 0 0 28px rgba(239, 68, 68, 0.40)

  transitions:
    fast: 150ms cubic-bezier(0.16, 1, 0.3, 1)
    normal: 240ms cubic-bezier(0.16, 1, 0.3, 1)
    slow: 400ms cubic-bezier(0.16, 1, 0.3, 1)
---

# HydroSentinel AI — Design System & Google Flow Architecture

This document establishes the official design specification and user flow architecture for **HydroSentinel AI™**, engineered according to **Google Stitch** standards and **Google UX Flow** principles for mission-critical disaster management systems.

---

## 1. Design Philosophy

### 1.1 The Mission-Critical Imperative
In emergency hydrological command centers, seconds determine survival. Interfaces must adhere to three foundational tenets:
1. **Zero Cognitive Friction**: Operators under high adrenaline must instantly discern nominal conditions from life-threatening flash flood surges without reading paragraphs of prose.
2. **Apple / Vercel Bento Box Deluxe Precision**: Visual density is structured through balanced, top-lit bento compartments featuring 18px corner radii, micro-borders, and tactile rim highlights (box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.12)).
3. **No Decorative Emojis**: Casual icons and emojis undermine civil defense authority. All indicators utilize illuminated 40x40px squircle vessels with 10% tinted backgrounds and crisp monochrome SVG geometry.

---

## 2. Google UX User Flows

The interface organizes operator cognition into five contiguous, logical stages following Google Design Flow heuristics:

`
[1. Threat Detection] --> [2. Spatial Inspection] --> [3. Hydro Triage] --> [4. Zero-Key Dispatch] --> [5. UAV Recon]
  (Lead-Time T-Minus)       (3D Digital Twin)         (Water Stage Gauges)     (SMS / Email Relay)        (Drone Swarm)
`

### Flow 1: Rapid Threat Recognition (< 3 Seconds)
- **Goal**: Operator immediately absorbs current maximum danger level across monitored river basins upon dashboard load.
- **Visual Anchor**: The top hero banner displays the Peak Surge Lead Time (3.8 Hours T-Minus), current severe precipitation rate (74.2 mm/h), and physics model precision (98.58% R²).
- **Heuristic**: Prominent status badge (BASIN NODE 0x760 • HIMALAYAN SECTOR) establishes immediate geographic context.

### Flow 2: Geospatial 3D Digital Twin Inspection
- **Goal**: Explore catchments spatially to correlate upstream cloudburst zones with downstream vulnerable population centers.
- **Interaction**:
  - Interactive 3D WebGL Earth globe rotates smoothly with orbital satellite tracks and glowing hazard nodes.
  - Selecting presets (**Himalayas**, **Satellites**, **Reset**) re-centers the focal perspective smoothly with spring damping.
  - Hovering over hazard beacons presents live telemetry HUD overlays.

### Flow 3: Catchment Hydrological Triage & Stage Thresholds
- **Goal**: Assess exact breach margins across individual hydrological monitoring stations.
- **Visual Meters**: Each basin card displays a dual-metric water stage progress meter:
  - Nominal (<50%): Emerald track (#10b981) — River within safe conveyance capacity.
  - Advisory (50% - 80%): Amber track (#f59e0b) — Spillway watch, riparian warnings.
  - Critical (>80%): Pulsing Crimson track (#ef4444) — Immediate bank breach imminent, evacuation mandatory.
- **Topographic Context**: Every basin exposes slope steepness (38.0°), current precipitation rate (74 mm/h), and soil saturation index (88%).

### Flow 4: Zero-Key Rapid Alert Broadcast
- **Goal**: Authorize and transmit mass early warnings to ground personnel without external API dependency roadblocks.
- **Layout**: Full-width dedicated Mission Ribbon (.emergency-dispatch-ribbon) located immediately below the 3 bento cards.
- **Dual Channels**:
  - **SMS / WhatsApp**: Direct phone broadcast with instant deep-link to WhatsApp Web for emergency group broadcasts.
  - **Civil Defense Email**: Transmits machine-readable CAP v1.2 alerts directly to institutional dispatch centers (dm-ops@gov.in).

### Flow 5: Autonomous Tactical Reconnaissance
- **Goal**: Dispatch autonomous UAV swarms to survey inundation contours and locate trapped civilians.
- **Integration**: One-click access to the Drone Mission Planner with pre-computed river corridor and lawnmower waypoint patterns.

---

## 3. Bento Box Deluxe Component Specifications

### 3.1 Bento Card Container
- **Class**: .bento-card
- **Background**: #0d121d with subtle vertical gradient linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0) 100%).
- **Border**: 1px solid rgba(255, 255, 255, 0.08).
- **Rim Highlight**: box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.12).
- **Corner Radius**: 18px.
- **Equal Height Ratio**: Flexbox flex: 1 1 0; display: flex; flex-direction: column; ensures Card 1, Card 2, and Card 3 maintain identical height across all desktop viewports.

### 3.2 Water Stage Progress Meter
- Progress track styling with rounded pills and status-coded gradient fills.
- High-contrast numerical readouts indicating current gauge height against maximum danger capacity.

### 3.3 Squircle Telemetry Vessels
- **Dimensions**: 40px x 40px with 10px border-radius.
- **Fill**: 10% tinted background matching the semantic channel color.
- **Icon**: High-precision SVG icon rendered in matching 100% saturation accent.

---

## 4. Accessibility & Contrast (WCAG 2.1 AAA)

- Text Primary (#f8fafc) on Void (#07090e): 18.2:1 (AAA)
- Text Secondary (#94a3b8) on Card Base (#0d121d): 7.9:1 (AAA)
- Status Emerald (#10b981) on Card Base: 7.1:1 (AAA)
- Status Amber (#f59e0b) on Card Base: 8.4:1 (AAA)
- Status Crimson (#ef4444) on Card Base: 5.8:1 (AA)
- Live Mesh Cyan (#06b6d4) on Card Base: 8.1:1 (AAA)

---

## 5. Google Stitch MCP Synchronization

When integrating with **Google Stitch**:
1. Run base64 -w 0 DESIGN.md to encode this design system specification.
2. Call upload_design_md on StitchMCP with the target projectId.
3. Call create_design_system_from_design_md to synchronize tokens, components, and screen layouts.
