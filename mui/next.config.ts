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
    cacheComponents: false,
    logging: {
        fetches: {
            fullUrl: true
        }
    }
};

export default nextConfig;
