import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
    images: {
        domains: ["cdn.discordapp.com"],
    },
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default config;
