import 'server-only';
import { SquareClient, SquareEnvironment } from 'square';

const isProd = process.env.SQUARE_ENV === 'production';

export const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN ?? '',
  environment: isProd ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
});

export const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID ?? '';
