/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Cloudinary is the media host (see CLAUDE.md). Remote patterns added when imagery lands.
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'placehold.co' },
    ],
  },
  // R3F / three ships ESM; keep transpile list ready for when 3D atmosphere lands.
  transpilePackages: ['three'],
};

export default nextConfig;
