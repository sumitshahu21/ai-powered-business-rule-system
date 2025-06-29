module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['example.com'], // Add your image domains here
  },
  env: {
    AI_API_KEY: process.env.AI_API_KEY, // Example of using environment variables
  },
};