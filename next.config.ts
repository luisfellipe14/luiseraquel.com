import type { NextConfig } from 'next';
import { siteConfig } from './site.config';

const nextConfig: NextConfig = {
  output: 'export',
  // This single-page export uses in-page anchors, with public URLs prefixed in
  // the invitation itself. Keep the prerender route at /; prefix only bundles.
  assetPrefix: siteConfig.basePath,
  images: { unoptimized: true },
};

export default nextConfig;
