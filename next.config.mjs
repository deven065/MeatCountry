/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'kvhhnrgoiaxwqbhxklfm.supabase.co' },
      { protocol: 'https', hostname: 'www.meatcountry.in' },
      { protocol: 'https', hostname: 'kyzmybdosgscumnxersb.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.co' }
    ],
    localPatterns: [
      {
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: true, // This bypasses the IP check for Supabase
  },
  // Explicitly configure experimental features for Next.js 16
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Suppress middleware deprecation warning - middleware is still needed for auth
  onDemandEntries: {
    // Suppress middleware deprecation warning
  },
}

export default nextConfig
