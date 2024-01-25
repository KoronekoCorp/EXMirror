/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { webpack, buildId, isServer }) => {
        config.plugins.push(
            new webpack.DefinePlugin({
                'process.env.BUILD_ID': JSON.stringify(buildId)
            })
        );
        return config
    }
}

module.exports = nextConfig
