import type { Metadata, Viewport } from 'next';
import { Archivo, Noto_Sans_JP } from 'next/font/google';
import type { ReactNode } from 'react';
import { portfolio } from '@/data/portfolio';
import { Providers } from '@/components/Providers/Providers';
import { Preloader } from '@/components/Preloader/Preloader';
import { CustomCursor } from '@/components/CustomCursor/CustomCursor';
import { Navigation } from '@/components/Navigation/Navigation';
import { Footer } from '@/components/Footer/Footer';
import { pageTransitionConfig } from '@/config/pageTransition';
import { cursorConfig } from '@/config/cursor';
import './globals.css';

// One family, two personalities: expanded heavy for display, normal width for reading.
const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
});
// Japanese (hiragana / katakana / kanji), e.g. the "こんにちは" greeting on /contact.
// Not preloaded: the browser only downloads the characters a page actually uses.
const notoJP = Noto_Sans_JP({
  variable: '--font-jp',
  display: 'swap',
  preload: false,
});

/**
 * SEO. Icons and the link-preview image are files in src/app/ (icon.svg, favicon.ico,
 * apple-icon.png, opengraph-image.png) — regenerate them with `node scripts/generate-icons.mjs`.
 * Set NEXT_PUBLIC_SITE_URL (e.g. in .env.local or your host's settings) to your live domain so
 * link previews get absolute image URLs.
 */
/**
 * Live address of the site from NEXT_PUBLIC_SITE_URL, made forgiving: spaces, quotes and
 * a trailing slash are removed and a missing "https://" is added. If it still is not a
 * valid address, Vercel's own production address is used (or localhost), so a typo can
 * never fail the build.
 */
function siteUrl() {
  const clean = (v?: string) => (v ?? '').trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '');
  const candidates = [process.env.NEXT_PUBLIC_SITE_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_URL];
  for (const raw of candidates) {
    const v = clean(raw);
    if (!v) continue;
    try {
      const url = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
      if (url.hostname.includes('.') || url.hostname === 'localhost') return url;
    } catch {
      // not a usable address; try the next one
    }
  }
  return new URL('http://localhost:3000');
}

export const metadata: Metadata = {
  metadataBase: siteUrl(),
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

// Runs before hydration: skip the preloader on repeat visits this session, and stop the browser from
// jumping back to the old scroll position on refresh (the page always opens at the top, on the hero).
// The browser decides that with the setting saved when the page was LEFT, so it is also set on pagehide;
// TransitionProvider switches it back on after the intro so Back/Forward inside the site keep their position.
const bootScript = `(function(){try{if('scrollRestoration' in history){history.scrollRestoration='manual';addEventListener('pagehide',function(){history.scrollRestoration='manual'})}if(!location.hash){window.scrollTo(0,0)}}catch(e){}try{if(sessionStorage.getItem('pf:intro')==='1'){document.documentElement.setAttribute('data-preloaded','true')}}catch(e){}})();`;

// SVG graphics paths from the data file, exposed to CSS (masks/backgrounds).
// Emitted as a <style> rule rather than an inline style on <body>: inline body
// styles are often rewritten by browser extensions, which triggers hydration warnings.
const graphicsCss = `:root{--svg-contour-1:url('${portfolio.graphics.contours[0]}');--svg-contour-2:url('${portfolio.graphics.contours[1]}');--svg-arrow:url('${portfolio.graphics.arrow}')}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scene="dark" className={`${archivo.variable} ${notoJP.variable} is-locked`} suppressHydrationWarning>
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
          {cursorConfig.enabled ? <CustomCursor /> : null}
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
