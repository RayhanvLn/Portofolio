import type { Metadata } from 'next';
import { portfolio } from '@/data/portfolio';
import { ContactHero } from '@/components/Contact/ContactHero';

export const metadata: Metadata = { title: 'Contact' };

export default function ContactPage() {
  return <ContactHero contact={portfolio.contact} profile={portfolio.profile} socials={portfolio.socials} />;
}
