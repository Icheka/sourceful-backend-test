import { Router } from 'express';

import { processProductsBill } from '../models/product';

export const route = Router();

// @route POST /checkout
// @desc Process bill
// @access Public
route.post('/', async (req, res) => {
    let products: Array<string> = req.body.cart;
    if (!products) return res.status(406).send({
        message: 'Invalid request'
    });

    res.send(await processProductsBill(products));
});