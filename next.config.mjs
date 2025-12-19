/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'kvhhnrgoiaxwqbhxklfm.supabase.co' }
    ],
    localPatterns: [
      {
        pathname: '/**',
      },
    ],
  }
}

export default nextConfig
