import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://mdpreview.ca';

  const routes = [
    '',
    '/md-editor',
    '/markdown-editor',
    '/mdx-editor',
    '/md-viewer',
    '/markdown-viewer',
    '/markdown-to-html',
    '/mdx-to-html',
    '/mermaid-editor',
    '/readme-viewer',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
