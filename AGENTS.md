Here is the updated **Project Requirement Specification** reflecting the workspace file switcher, top autohiding header, decoupled color themes, and spacing optimization requirements:

---

# 🚀 Project Requirement Specification: Instant MD/MDX Viewer & Converter

## 1. Executive Summary

Build a fast, zero-friction web application and open-source Node.js core engine where users can drag, drop, or paste Markdown (`.md`) and MDX (`.mdx`) files to **instantly preview beautified, styled documentation**. The initial release focuses purely on instant client-side rendering and export, with editing features deferred to a future phase.

---

## 2. Core User Experience (MVP Flow)

```
┌────────────────────────────────────────────────────────┐
│             Top Autohiding Sticky Header               │
│   [ Back ]  Viewing: file.md    [ Edit ] [ Layout ]    │
│   [ Files (N) ]  [ Copy ]  [ PDF ]  [ Download HTML ]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  # Rendered Output                                     │
│  Clean, full-width documentation card...               │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 3. Key Functional Requirements

* **Drag-and-Drop File Upload:** Supports `.md`, `.mdx`, and `.txt` files via a simple dropzone or text paste area using browser file APIs (`FileReader`).
* **Multi-File Workspace Switcher**:
  * Supports uploading multiple files at once.
  * Allows toggling documents in a click-activated files switcher popover in the top-right header.
  * Individual files can be removed from workspace or new ones uploaded dynamically via "+ Add Files".
* **Autohiding Sticky Top Header Menu**:
  * Action controls sit in a sticky header at the top of the viewport.
  * Header slides upwards out of view (`translate-y-[-100%]`) on scroll down to maximize reading space.
  * Header slides back down into view (`translate-y-0`) on scroll up.
  * Header stays locked in place if any dropdown list (theme or files) is currently open.
* **Instant HTML/MDX Rendering:**
  * Compiles MDX dynamically in the client browser using `@mdx-js/mdx` (`evaluate`).
  * Evaluates standard Markdown safely using lightweight parsers (`marked` / `markdown-it` + `DOMPurify`).
* **Theme Switcher:** Allows visitors to toggle between pre-designed styling templates (e.g., *Split Book*, *Dashboard Deck*, *Stepped Guide*).
* **One-Click Exports:**
  * Download compiled standalone `.html` bundle.
  * Copy raw HTML string to clipboard.
  * Save/Export as PDF.

---

## 4. Technical Architecture & Color Theme Rules

* **Frontend Framework:** Next.js / React.
* **Decoupled Color Themes**:
  * The **App Theme** handles the skin of the application shell (header background, home landing page, dropzone, uploader borders, and footer). Three app themes are supported: **Teal Lagoon (Default)**, **Indigo Breeze**, and **Midnight Dark** (saves to `localStorage`).
  * The **Document Layout Theme** handles the presentation style of the rendered markdown (e.g. *Split Book*).
  * **Rule**: The app theme and document layout theme must be decoupled. The document preview card does not inherit the dark/light mode properties of the application shell, preventing color conflicts (like unreadable black text on a forced dark background).
* **Execution Model:** **100% Client-Side.** All parsing and rendering occur directly in the user's browser, guaranteeing instant load times, complete privacy, and zero server computing costs.
* **Open-Source Engine:** Core parsing logic packaged as a public `npm` Node.js module to drive top-of-funnel developer traffic to the web tool.

---

## 5. Spacing & Layout Standards

* **Content Alignment**: First-child elements of the markdown body must reset `margin-top` to `0 !important` to eliminate blank gaps inside container cards.
* **Asymmetric Padding**: Viewport cards must use snug top offsets (`pt-6` / `pt-8` inside cards) and loose horizontal/bottom margins (`px-14 pb-16`) to maintain premium scannability.