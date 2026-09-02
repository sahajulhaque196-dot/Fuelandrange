// src/pages/sitemap-main.xml.ts
// Static & Core Landing Pages Sitemap
import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const today = new Date().toISOString().split('T')[0];

  const coreUrls = [
    { loc: 'https://rangeandfuel.ca/', priority: '1.0', changefreq: 'daily' },
    { loc: 'https://rangeandfuel.ca/search', priority: '0.9', changefreq: 'daily' },
    { loc: 'https://rangeandfuel.ca/recalls', priority: '0.9', changefreq: 'daily' },
    { loc: 'https://rangeandfuel.ca/about', priority: '0.8', changefreq: 'monthly' },
    { loc: 'https://rangeandfuel.ca/contact', priority: '0.8', changefreq: 'monthly' },
    { loc: 'https://rangeandfuel.ca/privacy', priority: '0.6', changefreq: 'monthly' },
    { loc: 'https://rangeandfuel.ca/terms', priority: '0.6', changefreq: 'monthly' },
    { loc: 'https://rangeandfuel.ca/disclaimer', priority: '0.6', changefreq: 'monthly' },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${coreUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
