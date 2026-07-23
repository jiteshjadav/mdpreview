import type { Metadata } from 'next';
import { WorkspaceApp } from '@/components/WorkspaceApp';

export const metadata: Metadata = {
  title: 'Online Markdown Editor — Instant Live Preview & HTML Export',
  description: 'Free, fast, and private online Markdown editor. Write GFM markdown with real-time preview, diagram support, and instant standalone HTML/PDF export. 100% browser-based.',
  keywords: ['md editor', 'online markdown editor', 'markdown live preview', 'browser markdown editor', 'gfm editor', 'markdown exporter'],
  alternates: {
    canonical: '/md-editor',
  },
  openGraph: {
    title: 'Online Markdown Editor — Instant Live Preview & HTML Export',
    description: 'Write GFM markdown with real-time preview, diagram support, and instant standalone HTML/PDF export. 100% browser-based.',
    url: '/md-editor',
    siteName: 'MD Preview',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online Markdown Editor — Instant Live Preview & HTML Export',
    description: 'Write GFM markdown with real-time preview, diagram support, and instant standalone HTML/PDF export.',
  },
};

export default function MdEditorPage() {
  return (
    <WorkspaceApp
      initialMode="editor"
      initialTemplate="md"
      customTitle="Online Markdown Editor"
      customDescription="Write, format, and preview Markdown instantly in your browser with real-time rendering and zero server tracking."
    />
  );
}
