import path from 'path';
import webpack from 'webpack';
import merge from 'webpack-merge';
import webpackUMDExternal from 'webpack-umd-external';

const TARGET = process.env.npm_lifecycle_event;
process.env.BABEL_ENV = TARGET;

export const sharedConfig = {
  module: {
    loaders: [
      {
        test: /\.jsx$|\.js$/,
        loader: 'babel',
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'examples'),
          path.resolve(__dirname, 'test')
        ]
      },
      { test: /\.styl$/, loader: 'style!css!stylus' }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  }
};

function getWebpackConfig() {
  if (TARGET === 'start') {
    return {
      entry: [
        'webpack-dev-server/client?http://localhost:8080',
        'webpack/hot/only-dev-server',
        './examples/simple.jsx'
      ],
      inline: true,
      output: {
        filename: 'simple.js'
      },
      plugins: [
        new webpack.HotModuleReplacementPlugin()
      ],
      devServer: {
        contentBase: 'examples/'
      }
    };
  } else if (TARGET === 'build:lib') {
    return {
      entry: './src/Beacon.jsx',
      output: {
        path: path.resolve(__dirname, 'lib'),
        filename: 'Beacon.js',
        library: 'Beacon',
        libraryTarget: 'umd',
        umdNamedDefine: true
      },
      externals: webpackUMDExternal({
        react: 'React',
        'react-dom': 'ReactDOM'
      })
    };
  } else if (TARGET === 'test' || TARGET === 'test:watch') {
    return {
      target: 'node'
    };
  }
}

export default merge(getWebpackConfig(), sharedConfig);
