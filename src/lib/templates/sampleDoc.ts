export const DEFAULT_SAMPLE_MDX = `# 🚀 Instant MD/MDX Viewer & Converter

Welcome to the **Instant MD/MDX Viewer & Converter**! Drag & drop any \`.md\` or \`.mdx\` file, or paste raw text below to instantly preview beautified, styled documentation and download standalone HTML.

---

## ⚡ Key Features

<Callout type="info" title="100% Client-Side Privacy">
  All parsing and HTML export operations happen **directly inside your browser**. Your files and text are never uploaded to any remote server!
</Callout>

- **Instant Preview**: Zero-latency live rendering for Markdown & MDX.
- **Custom MDX UI**: Pre-registered interactive components like \`<Callout>\`, \`<Badge>\`, and \`<TabGroup>\`.
- **4 Beautiful Themes**: Switch seamlessly between *Modern Dark Glass*, *GitHub Docs*, *Technical Slate*, and *Nordic Cyan*.
- **1-Click HTML Bundle Export**: Download a single self-contained \`.html\` file ready for hosting or offline reading.

---

## 🎨 Interactive MDX Components

You can embed rich React components directly inside your MDX documents:

### Status Badges
Status: <Badge variant="success">Completed</Badge> <Badge variant="warning">In Review</Badge> <Badge variant="danger">High Priority</Badge> <Badge variant="primary">v2.4.0</Badge>

### Tabbed Code Block

<TabGroup labels={["TypeScript", "Python", "cURL"]}>
  \`\`\`typescript
  import { convertMarkdownToHtml } from 'md-instant-engine';

  const rawMd = '# Hello World';
  const html = await convertMarkdownToHtml(rawMd, { theme: 'glass-dark' });
  console.log(html);
  \`\`\`

  \`\`\`python
  import requests

  # 100% Browser Client-Side Engine
  print("Processing Markdown locally...")
  \`\`\`

  \`\`\`bash
  # Install the open-source CLI engine
  npm install -g md-instant-engine
  md-instant convert README.md --out dist/index.html
  \`\`\`
</TabGroup>

---

## 📊 Formatted Tables & Task Lists

### Feature Matrix

| Feature | Instant MD Viewer | Traditional Tools |
| :--- | :---: | :---: |
| **Speed** | ⚡ Instant (0ms latency) | ⏳ 2-5s build step |
| **Privacy** | 🔒 100% Browser Local | 🌐 Server Uploads |
| **MDX Support** | ✅ Yes (Interactive UI) | ❌ Standard MD only |
| **Standalone HTML Export** | ✅ 1-Click Self-Contained | ⚠️ Requires Build Tool |

### Development Checklist

- [x] High-speed client-side Markdown parser
- [x] MDX component scope evaluation
- [x] Theme Switcher (Dark & Light modes)
- [x] Standalone HTML bundle generator with inline styles
- [x] One-click PDF & Print export

---

## 💡 Code Syntax Highlighting

\`\`\`javascript
// Client-side HTML export engine
function generateStandaloneBundle(renderedHtml, themeCss) {
  return \`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Exported Documentation</title>
  <style>\${themeCss}</style>
</head>
<body class="markdown-body">
  \${renderedHtml}
</body>
</html>\`;
}
\`\`\`

> *"Documentation is a love letter that you write to your future self."* — **Developer Proverb**

---

<Callout type="success" title="Ready to Convert?">
  Click the **Download HTML** button in the header toolbar to download this document as a standalone \`.html\` file!
</Callout>
`;

export const PRESET_TEMPLATES = [
  {
    id: "sample-mdx",
    name: "🚀 Overview & MDX Showcase",
    content: DEFAULT_SAMPLE_MDX,
  },
  {
    id: "readme",
    name: "📝 Project README Template",
    content: `# My Awesome Project

<Badge variant="primary">v1.0.0</Badge> <Badge variant="success">Build Passing</Badge> <Badge variant="warning">License: MIT</Badge>

A modern, high-performance application built for speed and simplicity.

## Quick Start

\`\`\`bash
npm install my-awesome-project
npm start
\`\`\`

<Callout type="warning" title="Prerequisite">
  Node.js v18.0.0 or higher is required.
</Callout>

## Features
- Fast performance
- Simple API
- Zero dependencies
`,
  },
  {
    id: "api-docs",
    name: "📚 API Specification",
    content: `# Authentication API Reference

## GET /api/v1/user/profile

Retrieves profile details for the authenticated user.

### Request Headers
| Header | Type | Description |
| :--- | :--- | :--- |
| \`Authorization\` | \`Bearer <token>\` | Required JWT bearer token |
| \`Content-Type\` | \`application/json\` | Payload format |

<Callout type="info" title="Rate Limit">
  Maximum 100 requests per minute per IP.
</Callout>

### Response Example

\`\`\`json
{
  "status": "success",
  "data": {
    "id": "usr_9921",
    "name": "Jane Developer",
    "email": "jane@example.com",
    "role": "admin"
  }
}
\`\`\`
`,
  },
];
