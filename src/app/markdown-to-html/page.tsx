import type { Metadata } from 'next';
import { WorkspaceApp } from '@/components/WorkspaceApp';

export const metadata: Metadata = {
  title: 'Markdown to HTML Converter — Export Standalone Web Pages',
  description: 'Convert Markdown (.md) files to standalone, single-file HTML pages with bundled styles, navigation sidebar, and print-ready PDF output.',
  keywords: ['markdown to html', 'convert md to html', 'markdown to html converter', 'export markdown html', 'standalone html generator'],
  alternates: {
    canonical: '/markdown-to-html',
  },
  openGraph: {
    title: 'Markdown to HTML Converter — Export Standalone Web Pages',
    description: 'Convert Markdown (.md) files to standalone, single-file HTML pages with bundled styles, navigation sidebar, and print-ready PDF output.',
    url: '/markdown-to-html',
    siteName: 'MD Preview',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Markdown to HTML Converter — Export Standalone Web Pages',
    description: 'Convert Markdown (.md) files to standalone, single-file HTML pages with bundled styles.',
  },
};

export default function MarkdownToHtmlPage() {
  return (
    <WorkspaceApp
      initialMode="preview"
      initialTemplate="md"
      customTitle="Markdown to HTML Converter"
      customDescription="Transform raw Markdown files into styled, self-contained HTML documents ready to host anywhere."
    />
  );
}
