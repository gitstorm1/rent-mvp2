import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    serverExternalPackages: ["pdf-parse"],
    experimental: {
        serverActions: {
            bodySizeLimit: "30mb",
        },
        proxyClientMaxBodySize: "30mb",
    }
};

export default nextConfig;
