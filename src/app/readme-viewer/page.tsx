import type { Metadata } from 'next';
import { WorkspaceApp } from '@/components/WorkspaceApp';

export const metadata: Metadata = {
  title: 'GitHub README.md Viewer & Previewer — Online GFM Reader',
  description: 'Instant GitHub Flavored Markdown (GFM) README previewer. Preview repository documentation with badges, code blocks, and tables.',
  keywords: ['readme viewer', 'github readme previewer', 'gfm reader', 'readme.md viewer', 'preview readme online'],
  alternates: {
    canonical: '/readme-viewer',
  },
  openGraph: {
    title: 'GitHub README.md Viewer & Previewer — Online GFM Reader',
    description: 'Instant GitHub Flavored Markdown (GFM) README previewer. Preview repository documentation with badges, code blocks, and tables.',
    url: '/readme-viewer',
    siteName: 'MD Preview',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GitHub README.md Viewer & Previewer — Online GFM Reader',
    description: 'Instant GitHub Flavored Markdown (GFM) README previewer. Preview repository documentation with badges.',
  },
};

export default function ReadmeViewerPage() {
  return (
    <WorkspaceApp
      initialMode="preview"
      initialTemplate="readme"
      customTitle="GitHub README.md Viewer"
      customDescription="Preview repository README documentation in clean, publication-grade GFM formatting."
    />
  );
}
