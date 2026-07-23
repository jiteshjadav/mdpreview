import type { Metadata } from 'next';
import { WorkspaceApp } from '@/components/WorkspaceApp';

export const metadata: Metadata = {
  title: 'Instant MD Viewer — Clean Document Reader',
  description: 'View Markdown (.md) files in a clean, high-readability documentation layout without uploading to external servers.',
  keywords: ['md viewer', 'online md viewer', 'read md file', 'open md file online', 'markdown reader'],
  alternates: {
    canonical: '/md-viewer',
  },
  openGraph: {
    title: 'Instant MD Viewer — Clean Document Reader',
    description: 'View Markdown (.md) files in a clean, high-readability documentation layout without uploading to external servers.',
    url: '/md-viewer',
    siteName: 'MD Preview',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Instant MD Viewer — Clean Document Reader',
    description: 'View Markdown (.md) files in a clean, high-readability documentation layout.',
  },
};

export default function MdViewerPage() {
  return (
    <WorkspaceApp
      initialMode="preview"
      initialTemplate="md"
      customTitle="Instant MD Document Viewer"
      customDescription="Read and present Markdown documents in sleek, publication-grade layout templates."
    />
  );
}
