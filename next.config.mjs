/** @type {import('next').NextConfig} */
const nextConfig = {
  
  images: {
    
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  serverExternalPackages: ['mongoose'],
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
};

export default nextConfig;