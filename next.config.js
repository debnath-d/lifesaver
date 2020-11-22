module.exports = {
    basePath: '/lifesaver',
    assetPrefix: '/lifesaver',
    webpack: (config, options) => {
        config.node = {
            fs: 'empty',
        };

        return config;
    },
};
