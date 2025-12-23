/** @type {import('next').NextConfig} */
const nextConfig = {
    // Increase API route timeouts for AI generation
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },
    // Disable API route timeout for long-running AI operations
    // This allows the AI generation to take as long as needed
    api: {
        responseLimit: false,
        externalResolver: true,
    },
};

module.exports = nextConfig;
