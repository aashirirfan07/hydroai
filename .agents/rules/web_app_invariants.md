---
description: Critical fullstack web, Flask, and 3D WebGL development invariants
globs: ["**/*.py", "**/*.html", "**/*.js", "**/*.css"]
always_on: true
---

# Fullstack Web & 3D WebGL Invariants

## 1. Automated Dynamic Static Asset Cache-Busting (Flask/Jinja2)
- Never rely on hardcoded query strings (e.g. `?v=1.0`) for static files in HTML templates.
- Always implement an automated backend context processor in `app.py` that dynamically appends file modification timestamps (`st_mtime`) to `url_for('static', ...)`:
  ```python
  @app.context_processor
  def override_url_for():
      return dict(url_for=dated_url_for)

  def dated_url_for(endpoint, **values):
      if endpoint == 'static':
          filename = values.get('filename', None)
          if filename:
              file_path = os.path.join(app.root_path, endpoint, filename)
              if os.path.exists(file_path):
                  values['v'] = int(os.stat(file_path).st_mtime)
      return url_for(endpoint, **values)
  ```

## 2. Zero-Dependency Local SVG Icons (No Missing Font Glyphs)
- Never use external CDN font icon classes (e.g., `<i class="fa-solid fa-..."></i>`) that risk rendering as missing box/rectangle glyphs (`[]`).
- Always use bundled inline SVGs, local image assets (`/static/img/badges/emblem_*.svg`), or CSS masks.

## 3. Non-Blocking 3D OrbitControls (Smooth Page Scroll)
- When embedding Three.js WebGL canvases in scrollable pages:
  - Always configure `controls.enableZoom = false` (or require a modifier key like `Ctrl` for canvas zoom).
  - Apply `touch-action: pan-y` and ensure ambient overlay canvases have `pointer-events: none`.
  - Never allow WebGL canvases to swallow or block natural vertical page scrolling.

## 4. AST-Safe Code Modification (No Blind String Overwrites)
- When adding imports or modifying functions in Python files:
  - Place imports strictly at the top of the file (Line 1).
  - Avoid global text replacements on common tokens (e.g. `from flask import`) to prevent corrupting indentation in inner function scopes.
  - Always verify that all test suites pass after any modification.

## 5. Zero-Overhead Procedural Web Audio Synthesis
- Never bundle heavy, static audio assets (`.mp3`, `.wav`, `.ogg`) for interface haptic feedback, clicks, drones, or alert chirps.
- Always synthesize micro-acoustics purely through the native browser **Web Audio API** (`window.AudioContext`, `OscillatorNode`, `GainNode`, `BiquadFilterNode`):
  - Use mathematical sine/triangle envelopes with exponential decays (`gain.exponentialRampToValueAtTime(0.0001, t + duration)`).
  - Defer `AudioContext` activation until the user's first interactive gesture to ensure compliance with browser autoplay security policies.
  - Provide an accessible master mute/unmute toggle that persists preference in `localStorage`.

## 6. Multi-Lingual Speech & Voice Synchronization (i18n + TTS)
- When client-side internationalization (i18n) switches locales (e.g. `EN` ➔ `हिंदी` ➔ `മലയാളം`):
  - Synchronize both visual DOM dictionary labels (`data-i18n`) AND the native Web Speech Synthesis engine (`window.speechSynthesis`).
  - Dynamically update the utterance locale (`utterance.lang = 'hi-IN' | 'ml-IN' | 'en-US'`) so AI voice copilots speak in the user's active regional language.

## 7. Offline-First Disaster PWA & Resilient Storage
- For mission-critical emergency applications that operate during severe weather or cellular blackouts:
  - Implement a **Service Worker** with a cache-first strategy for WebGL libraries, CSS stylesheets, and core route templates.
  - Implement an **IndexedDB** persistent queue for citizen incident and SOS reports submitted while offline (`!navigator.onLine`).
  - Listen to `window.addEventListener('online', ...)` to automatically flush and broadcast all queued offline reports to the server the moment connectivity is restored.
