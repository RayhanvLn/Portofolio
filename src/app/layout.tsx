import type { Metadata, Viewport } from 'next';
import { Archivo } from 'next/font/google';
import type { ReactNode } from 'react';
import { portfolio } from '@/data/portfolio';
import { Providers } from '@/components/Providers/Providers';
import { Preloader } from '@/components/Preloader/Preloader';
import { CustomCursor } from '@/components/CustomCursor/CustomCursor';
import { Navigation } from '@/components/Navigation/Navigation';
import { Footer } from '@/components/Footer/Footer';
import { pageTransitionConfig } from '@/config/pageTransition';
import './globals.css';

// One family, two personalities: expanded heavy for display, normal width for reading.
const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
});

/**
 * SEO. Icons and the link-preview image are files in src/app/ (icon.svg, favicon.ico,
 * apple-icon.png, opengraph-image.png) — regenerate them with `node scripts/generate-icons.mjs`.
 * Set NEXT_PUBLIC_SITE_URL (e.g. in .env.local or your host's settings) to your live domain so
 * link previews get absolute image URLs.
 */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: portfolio.seo.title, template: `%s — ${portfolio.profile.name}` },
  description: portfolio.seo.description,
  applicationName: portfolio.profile.name,
  openGraph: {
    type: 'website',
    siteName: portfolio.profile.name,
    title: portfolio.seo.title,
    description: portfolio.seo.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: portfolio.seo.title,
    description: portfolio.seo.description,
  },
};

export const viewport: Viewport = {
  themeColor: '#111112',
  width: 'device-width',
  initialScale: 1,
};

// Runs before hydration: skip the preloader on repeat visits this session.
const bootScript = `(function(){try{if(sessionStorage.getItem('pf:intro')==='1'){document.documentElement.setAttribute('data-preloaded','true')}}catch(e){}})();`;

// SVG graphics paths from the data file, exposed to CSS (masks/backgrounds).
// Emitted as a <style> rule rather than an inline style on <body>: inline body
// styles are often rewritten by browser extensions, which triggers hydration warnings.
const graphicsCss = `:root{--svg-contour-1:url('${portfolio.graphics.contours[0]}');--svg-contour-2:url('${portfolio.graphics.contours[1]}');--svg-arrow:url('${portfolio.graphics.arrow}')}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scene="dark" className={`${archivo.variable} is-locked`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <style dangerouslySetInnerHTML={{ __html: graphicsCss }} />
        <noscript>
          <style>{`.page-transition,.preloader{display:none!important}html.is-locked{overflow:auto!important}`}</style>
        </noscript>
      </head>
      {/* suppressHydrationWarning: ignore attributes injected by browser extensions (one level only). */}
      <body suppressHydrationWarning>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Providers>
          {pageTransitionConfig.intro === 'counter' ? <Preloader /> : null}
          <CustomCursor />
          <Navigation />
          {/* data-page-content: faded out/in by the page transition */}
          <main id="main" tabIndex={-1} data-page-content>
            {children}
          </main>
          <div data-page-content>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
