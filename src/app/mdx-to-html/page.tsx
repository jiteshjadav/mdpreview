import type { Metadata } from 'next';
import { WorkspaceApp } from '@/components/WorkspaceApp';

export const metadata: Metadata = {
  title: 'MDX to HTML Converter — Compile MDX to Standalone HTML',
  description: 'Evaluate MDX content and export standalone, fully styled HTML bundles directly in your web browser with zero setup.',
  keywords: ['mdx to html', 'convert mdx to html', 'mdx exporter', 'mdx standalone html', 'mdx converter'],
  alternates: {
    canonical: '/mdx-to-html',
  },
  openGraph: {
    title: 'MDX to HTML Converter — Compile MDX to Standalone HTML',
    description: 'Evaluate MDX content and export standalone, fully styled HTML bundles directly in your web browser with zero setup.',
    url: '/mdx-to-html',
    siteName: 'MD Preview',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MDX to HTML Converter — Compile MDX to Standalone HTML',
    description: 'Evaluate MDX content and export standalone, fully styled HTML bundles directly in your web browser.',
  },
};

export default function MdxToHtmlPage() {
  return (
    <WorkspaceApp
      initialMode="preview"
      initialTemplate="mdx"
      customTitle="MDX to HTML Converter"
      customDescription="Compile interactive MDX files into responsive HTML pages with styled components and embedded scripts."
    />
  );
}
