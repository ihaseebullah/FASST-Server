const Checkout = require('../Controllers/MarketPlace/Checkout');

const MarketPlaceRouter = require('express').Router();

MarketPlaceRouter.post('/market-place/checkout', Checkout)

module.exports = MarketPlaceRouter;