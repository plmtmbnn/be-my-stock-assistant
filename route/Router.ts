// Controller
import { Request, Response } from 'express';
import { screenerController } from '../controller/ScreenerController';
import { watchlistController } from '../controller/WatchlistController';
import { customerController } from '../controller/CustomerController';
import { holdingCompositionController } from '../controller/HoldingCompositionController';

const express = require('express');
const router = express.Router();

// health check endpoint
router.get(['/health', ''], (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'N3Y Service API is live.'
  });
});

router.post('/n3y-alert', screenerController.n3yScreener);
router.post('/n3y-alert/support-resist', screenerController.n3yScreenerSupportAndResist);
router.get('/watchlist/get', watchlistController.getWatchlist);
router.post('/watchlist/upsert', watchlistController.upsertWatchlist);
router.post('/watchlist/upsert/all-in-one', watchlistController.upsertWatchlistAllInOne);
router.post('/watchlist/delete', watchlistController.deleteWatchlist);
router.get('/holding', holdingCompositionController.writeHoldingComposition);

// customer
router.post('/customer/verify', customerController.verify);
router.get('/customer/get/all', customerController.getAllCustomer);

// Return 404 to all unidentified path URLs
router.get('*', function (req: Request, res: Response) {
  res.status(404).json();
});
router.post('*', function (req: Request, res: Response) {
  res.status(404).json();
});

module.exports = router;
