import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  /** Page or view title (e.g. 'Study Material', 'Online Quiz') */
  title?: string;
  /** Meta description for search engines and social sharing */
  description?: string;
  /** Keywords list */
  keywords?: string[];
  /** Canonical URL link */
  canonicalUrl?: string;
  /** OpenGraph type (website / article) */
  ogType?: 'website' | 'article';
  /** Optional custom suffix (defaults to '- Zakir Learning Hub') */
  suffix?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description = 'Computer Science & IT Learning Hub for Classes VI–XII. Chapter-wise notes, practical resources, MCQs, and online tests by Zakir Hussain.',
  keywords = [
    'Zakir Learning Hub',
    'CBSE Computer Science',
    'IT 402',
    'IP 065',
    'Typography 817',
    'Computer Applications 165',
    'Python Pandas',
    'MySQL',
    'LibreOffice',
    'Zakir Hussain'
  ],
  canonicalUrl,
  ogType = 'website',
  suffix = '- Zakir Learning Hub'
}) => {
  const fullTitle = title 
    ? `${title} ${suffix}`
    : 'Zakir Learning Hub - Computer Science & IT (Classes VI–XII)';

  return (
    <Helmet>
      {/* Dynamic Document Title */}
      <title>{fullTitle}</title>

      {/* Meta Descriptions */}
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />

      {/* OpenGraph Tags */}
      <meta property="og:site_name" content="Zakir Learning Hub" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
    </Helmet>
  );
};
