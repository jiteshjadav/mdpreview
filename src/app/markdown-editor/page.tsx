import type { Metadata } from 'next';
import { WorkspaceApp } from '@/components/WorkspaceApp';

export const metadata: Metadata = {
  title: 'Free Markdown Editor — Real-Time Side-by-Side Preview',
  description: 'Clean, distraction-free online Markdown editor with live preview, custom styling themes, Mermaid diagrams, and one-click HTML download.',
  keywords: ['markdown editor', 'free markdown editor', 'distraction free markdown', 'markdown web editor', 'markdown tool'],
  alternates: {
    canonical: '/markdown-editor',
  },
  openGraph: {
    title: 'Free Markdown Editor — Real-Time Side-by-Side Preview',
    description: 'Clean, distraction-free online Markdown editor with live preview, custom styling themes, Mermaid diagrams, and one-click HTML download.',
    url: '/markdown-editor',
    siteName: 'MD Preview',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Markdown Editor — Real-Time Side-by-Side Preview',
    description: 'Clean, distraction-free online Markdown editor with live preview and custom styling themes.',
  },
};

export default function MarkdownEditorPage() {
  return (
    <WorkspaceApp
      initialMode="editor"
      initialTemplate="md"
      customTitle="Free Online Markdown Editor"
      customDescription="Compose and format markdown documents with an interactive live editor and beautiful presentation styles."
    />
  );
}
