import path from 'path';
import webpack from 'webpack';
import merge from 'webpack-merge';

const TARGET = process.env.npm_lifecycle_event;
process.env.BABEL_ENV = TARGET;

const sharedConfig = {
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
      { test: /\.less$/, loader: 'style!css!less' }
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
        filename: 'Beacon.js'
      }
    };
  } else if (TARGET === 'test' || TARGET === 'test:watch') {
    return {
      target: 'node'
    };
  }
}

export default merge(getWebpackConfig(), sharedConfig);
