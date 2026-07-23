import type { Metadata } from 'next';
import { WorkspaceApp } from '@/components/WorkspaceApp';

export const metadata: Metadata = {
  title: 'Markdown Viewer & Reader — Full-Width Documentation Preview',
  description: 'Fast, client-side Markdown reader supporting GFM tables, syntax highlighting, Mermaid diagrams, and decoupled theme templates.',
  keywords: ['markdown viewer', 'markdown reader', 'gfm viewer', 'open markdown file', 'view markdown online'],
  alternates: {
    canonical: '/markdown-viewer',
  },
  openGraph: {
    title: 'Markdown Viewer & Reader — Full-Width Documentation Preview',
    description: 'Fast, client-side Markdown reader supporting GFM tables, syntax highlighting, Mermaid diagrams, and decoupled theme templates.',
    url: '/markdown-viewer',
    siteName: 'MD Preview',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Markdown Viewer & Reader — Full-Width Documentation Preview',
    description: 'Fast, client-side Markdown reader supporting GFM tables, syntax highlighting, and Mermaid diagrams.',
  },
};

export default function MarkdownViewerPage() {
  return (
    <WorkspaceApp
      initialMode="preview"
      initialTemplate="md"
      customTitle="Markdown Viewer & Reader"
      customDescription="Preview and navigate full-length Markdown documentation with instant client-side rendering."
    />
  );
}
