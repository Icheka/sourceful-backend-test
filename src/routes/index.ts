import { Router } from 'express';

import { route as Checkout } from './checkout';

export const baseRouter = Router();
baseRouter.use('/checkout', Checkout);