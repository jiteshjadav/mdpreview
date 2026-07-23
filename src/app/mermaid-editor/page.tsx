import type { Metadata } from 'next';
import { WorkspaceApp } from '@/components/WorkspaceApp';

export const metadata: Metadata = {
  title: 'Live Mermaid Diagram Editor — Flowcharts & Sequence Diagrams',
  description: 'Write and preview Mermaid diagrams with interactive pan, zoom, and fullscreen overlay support inside Markdown documents.',
  keywords: ['mermaid editor', 'mermaid diagram preview', 'mermaid flowchart editor', 'sequence diagram editor', 'mermaid to html'],
  alternates: {
    canonical: '/mermaid-editor',
  },
  openGraph: {
    title: 'Live Mermaid Diagram Editor — Flowcharts & Sequence Diagrams',
    description: 'Write and preview Mermaid diagrams with interactive pan, zoom, and fullscreen overlay support inside Markdown documents.',
    url: '/mermaid-editor',
    siteName: 'MD Preview',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Mermaid Diagram Editor — Flowcharts & Sequence Diagrams',
    description: 'Write and preview Mermaid diagrams with interactive pan, zoom, and fullscreen overlay support.',
  },
};

export default function MermaidEditorPage() {
  return (
    <WorkspaceApp
      initialMode="editor"
      initialTemplate="mermaid"
      customTitle="Mermaid Diagram Live Editor"
      customDescription="Create flowcharts, sequence diagrams, and architecture maps with instant interactive pan-zoom preview."
    />
  );
}
