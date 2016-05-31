import path from 'path';
// import webpack from 'webpack';

const TARGET = process.env.npm_lifecycle_event;

function getWebpackConfig() {
  if (TARGET === 'start') {
    return {
      entry: [
        'webpack-dev-server/client?http://localhost:3000',
        'webpack/hot/only-dev-server',
        './examples/simple.jsx'
      ],
      inline: true,
      output: {
        path: path.join(__dirname, 'examples'),
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
      ]
    };
  }
}

export default getWebpackConfig();
