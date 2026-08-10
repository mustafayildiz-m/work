import { Controller, Get, Header, Res } from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Language } from '../languages/entities/language.entity';

@Controller('sitemap')
export class QaSitemapController {
  constructor(
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
  ) {}

  @Get('questions.xml')
  async generateSitemap(@Res() res: Response) {
    const languages = await this.languageRepository.find({
      where: { status: Not('not_published') },
      select: ['iso639_3', 'englishName', 'questionCount'],
      order: { questionCount: 'DESC' },
    });

    const baseUrl = 'https://islamicwindows.com';
    const now = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${baseUrl}/feed/questions</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;

    for (const lang of languages) {
      if (!lang.iso639_3) continue;
      xml += `  <url>
    <loc>${baseUrl}/feed/questions/${lang.iso639_3}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
`;
      // Add hreflang alternates for all active languages
      for (const altLang of languages) {
        if (altLang.iso639_3) {
          xml += `    <xhtml:link rel="alternate" hreflang="${altLang.iso639_3}" href="${baseUrl}/feed/questions/${altLang.iso639_3}" />\n`;
        }
      }
      xml += `  </url>\n`;
    }

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  }
}
