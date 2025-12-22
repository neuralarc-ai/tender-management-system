/** @type {import('next').NextConfig} */
const nextConfig = {
    // Increase API route timeouts for AI generation
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },
};

module.exports = nextConfig;


