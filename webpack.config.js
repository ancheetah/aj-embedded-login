import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  entry: {
    main: [path.resolve(__dirname, './src/main.js')],
    styles: [path.resolve(__dirname, './src/styles.css')],
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  devServer: {
    port: 3000,
    host: 'localhost',
    open: false,
    client: {
      overlay: false,
    },
    headers: {
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Origin': 'null',
      'Content-Security-Policy': 'upgrade-insecure-requests',
    },
    static: {
      directory: path.resolve(__dirname, './src/public'),
    },
  },
};

export default config;