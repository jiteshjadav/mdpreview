import type { Metadata } from 'next';
import { WorkspaceApp } from '@/components/WorkspaceApp';

export const metadata: Metadata = {
  title: 'Online MDX Editor — Interactive Component Sandbox & Previewer',
  description: 'Evaluate and edit MDX documents with embedded React components, alert callouts, and code blocks directly in your browser.',
  keywords: ['mdx editor', 'online mdx editor', 'mdx sandbox', 'react mdx preview', 'evaluate mdx online'],
  alternates: {
    canonical: '/mdx-editor',
  },
  openGraph: {
    title: 'Online MDX Editor — Interactive Component Sandbox & Previewer',
    description: 'Evaluate and edit MDX documents with embedded React components, alert callouts, and code blocks directly in your browser.',
    url: '/mdx-editor',
    siteName: 'MD Preview',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online MDX Editor — Interactive Component Sandbox & Previewer',
    description: 'Evaluate and edit MDX documents with embedded React components and alert callouts.',
  },
};

export default function MdxEditorPage() {
  return (
    <WorkspaceApp
      initialMode="editor"
      initialTemplate="mdx"
      customTitle="Interactive MDX Component Editor"
      customDescription="Build and evaluate MDX documentation with custom UI components and live browser compilation."
    />
  );
}
