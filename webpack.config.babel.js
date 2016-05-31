import path from 'path';
import webpack from 'webpack';

const TARGET = process.env.npm_lifecycle_event;

function getWebpackConfig() {
  if (TARGET === 'start') {
    return {
      entry: [
        'webpack-dev-server/client?http://localhost:8080',
        './examples/simple.jsx'
      ],
      inline: true,
      output: {
        filename: 'simple.js'
      },
      module: {
        loaders: [
          {
            test: /\.jsx$|\.js$/,
            loader: 'babel',
            include: [ path.join(__dirname, 'src'), path.join(__dirname, 'examples') ]
          },
          { test: /\.less$/, loader: 'style!css!less' }
        ]
      },
      resolve: {
        extensions: ['', '.js', '.jsx']
      },
      plugins: [
        new webpack.HotModuleReplacementPlugin()
      ],
      devServer: {
        contentBase: 'examples/',
        hot: true
      }
    };
  }
}

export default getWebpackConfig();
