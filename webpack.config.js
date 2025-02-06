import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  entry: [path.resolve(__dirname, './src/main.js')],
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'main.js',
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