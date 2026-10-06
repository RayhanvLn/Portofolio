import { FooterShowcase } from './FooterShowcase';

/** Closing section on every page. Content: src/data/contactSection.ts. Year is computed on the server. */
export function Footer() {
  return <FooterShowcase year={new Date().getFullYear()} />;
}
