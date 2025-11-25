import { execSync } from "child_process";
import { writeFile } from "fs/promises";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    webpack: (config, { webpack, buildId, isServer }) => {
        config.plugins.push(
            new webpack.DefinePlugin({
                'process.env.BUILD_ID': JSON.stringify(buildId)
            })
        );
        return config
    },
    turbopack: {

    },
    async generateBuildId() {
        const id = execSync('git rev-parse HEAD').toString().trim();
        writeFile("./app/api/version/version.json", JSON.stringify({ buildid: id }))
        return id
    },
    cacheComponents: false,
    productionBrowserSourceMaps: true,
    logging: {
        fetches: {
            fullUrl: true
        }
    }
};

export default nextConfig;
