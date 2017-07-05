const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const {
    AureliaPlugin,
    ModuleDependenciesPlugin
} = require('aurelia-webpack-plugin');
const {
    optimize: {
        CommonsChunkPlugin
    },
    ProvidePlugin
} = require('webpack')
const {
    TsConfigPathsPlugin,
    CheckerPlugin
} = require('awesome-typescript-loader');
const pkg = require('./package.json');

// config helpers:
const ensureArray = (config) => config && (Array.isArray(config) ? config : [config]) || []
const when = (condition, config, negativeConfig) =>
    condition ? ensureArray(config) : ensureArray(negativeConfig)

// primary config:
const title = 'AAA Flag & Banner';
const outDir = path.resolve(__dirname, 'dist');
const srcDir = path.resolve(__dirname, 'src');
const nodeModulesDir = path.resolve(__dirname, 'node_modules');
const baseUrl = '/';

const publicPathBuild = '/' + pkg.version + '/';
// const publicPathBuild = '/test/';

const cssRules = [{
    loader: 'css-loader'
},
{
    loader: 'postcss-loader',
    options: {
        plugins: () => [require('autoprefixer')({
            browsers: ['last 2 versions']
        })]
    }
}
]

module.exports = ({
    production,
    server,
    extractCss,
    coverage
} = {}) => ({
        resolve: {
            extensions: ['.ts', '.js'],
            modules: [srcDir, 'node_modules'],
            // alias: {
            //     '$': path.resolve(__dirname, 'node_modules/jquery/dist/jquery.js'),
            //     'jquery': path.resolve(__dirname, 'node_modules/jquery/dist/jquery.js')
            // }
        },
        entry: {
            app: ['aurelia-bootstrapper'],
            // vendor: ['bluebird'],
            // vendor: ['bluebird', 'jquery'],
        },
        output: {
            path: outDir,
            // publicPath: baseUrl,
            publicPath: production ? publicPathBuild : "",
            // filename: production ? '[name].[chunkhash].bundle.js' : '[name].[hash].bundle.js',
            // sourceMapFilename: production ? '[name].[chunkhash].bundle.map' : '[name].[hash].bundle.map',
            // chunkFilename: production ? '[chunkhash].chunk.js' : '[hash].chunk.js',
            filename: production ? '[name].bundle.js' : '[name].bundle.js',
            sourceMapFilename: production ? '[name].bundle.map' : '[name].bundle.map',
            chunkFilename: production ? 'chunk.js' : 'chunk.js',
        },
        devServer: {
            // contentBase: [baseUrl],
            host: '0.0.0.0',
            disableHostCheck: true,
            port: 82,
            // https: true,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
            }
            // staticOptions: {
            //     root: 'resources'
            // }
        },
        // build: {
        //     assetsPublicPath: '/',
        //     assetsSubDirectory: 'resources'
        // },
        // externals: {
        //     jquery: 'jQuery'
        // },
        module: {
            rules: [
                {
                    test: /\.scss$/,
                    loader: 'style-loader!css-loader!sass-loader'
                },
                // CSS required in JS/TS files should use the style-loader that auto-injects it into the website
                // only when the issuer is a .js/.ts file, so the loaders are not applied inside html templates
                {
                    test: /\.css$/i,
                    issuer: [{
                        not: [{
                            test: /\.html$/i
                        }]
                    }],
                    use: extractCss ? ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use: cssRules,
                    }) : ['style-loader', ...cssRules],
                },
                {
                    test: /\.css$/i,
                    issuer: [{
                        test: /\.html$/i
                    }],
                    // CSS required in templates cannot be extracted safely
                    // because Aurelia would try to require it again in runtime
                    use: cssRules,
                },
                {
                    test: /\.html$/i,
                    loader: 'html-loader'
                },
                {
                    test: /\.ts$/i,
                    loader: 'awesome-typescript-loader',
                    exclude: nodeModulesDir
                },
                {
                    test: /\.json$/i,
                    loader: 'json-loader'
                },
                // use Bluebird as the global Promise implementation:
                {
                    test: /[\/\\]node_modules[\/\\]bluebird[\/\\].+\.js$/,
                    loader: 'expose-loader?Promise'
                },
                // exposes jQuery globally as $ and as jQuery:
                {
                    test: require.resolve('jquery'),
                    loader: 'expose-loader?$!expose-loader?jQuery'
                },
                // embed small images and fonts as Data Urls and larger ones as files:
                {
                    test: /\.(png|gif|jpg|cur)$/i,
                    loader: 'url-loader',
                    options: {
                        limit: 8192
                    }
                },
                {
                    test: /\.woff2(\?v=[0-9]\.[0-9]\.[0-9])?$/i,
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        mimetype: 'application/font-woff2'
                    }
                },
                {
                    test: /\.woff(\?v=[0-9]\.[0-9]\.[0-9])?$/i,
                    loader: 'url-loader',
                    options: {
                        limit: 10000,
                        mimetype: 'application/font-woff'
                    }
                },
                // load these fonts normally, as files:
                {
                    test: /\.(ttf|eot|svg|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/i,
                    loader: 'file-loader'
                },

                ...when(coverage, {
                    test: /\.[jt]s$/i,
                    loader: 'istanbul-instrumenter-loader',
                    include: srcDir,
                    exclude: [/\.{spec,test}\.[jt]s$/i],
                    enforce: 'post',
                    options: {
                        esModules: true
                    },
                })
            ]
        },
        plugins: [
            new AureliaPlugin({
                features: {
                    ie: boolean = false, // Don't remove IE support
                    svg: boolean = true, // Remove SVG binding support
                }
            }),
            new ProvidePlugin({
                'Promise': 'bluebird',
                // '$': 'jquery',
                // 'jQuery': 'jquery',
                // 'window.$': 'jquery',
                // 'window.jQuery': 'jquery',
            }),
            // new ModuleDependenciesPlugin({
            //     "aurelia-materialize-bridge": [
            //         './input/input',
            //         './input/input-prefix',
            //         './input/input-update-service',
            //         './scrollspy/scrollspy',
            //         './sidenav/sidenav',
            //         './sidenav/sidenav-collapse',
            //         './slider/slider',
            //         './tooltip/tooltip'
            //     ]
            // }),
            // new ModuleDependenciesPlugin({
            //     "aurelia-framework": ['aurelia-dialog'],
            //     "aurelia-dialog": ['./ai-dialog', './ai-dialog-header', './ai-dialog-body',
            //         './ai-dialog-footer', './attach-focus'
            //     ]
            // }),
            new TsConfigPathsPlugin(),
            new CheckerPlugin(),
            new HtmlWebpackPlugin({
                template: 'index.ejs',
                minify: production ? {
                    removeComments: true,
                    collapseWhitespace: true
                } : undefined,
                metadata: {
                    // available in index.ejs //
                    title,
                    server,
                    baseUrl
                },
            }),
            ...when(extractCss, new ExtractTextPlugin({
                // filename: production ? '[contenthash].css' : '[id].css',
                filename: production ? 'styles.css' : '[id].css',
                allChunks: true,
            })),
            ...when(production, new CommonsChunkPlugin({
                name: ['common']
            })),
            ...when(production, new CopyWebpackPlugin([{
                from: 'static/favicon.ico',
                to: 'favicon.ico'
            }]))
        ],
    })
