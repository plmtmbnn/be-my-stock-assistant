// Controller
import { Request, Response } from 'express';
import { alertController } from '../controller/AlertController';

const express = require('express');
const router = express.Router();

// health check endpoint
router.get(['/health', ''], (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'N3Y Service API is live.'
  });
});

router.post('/n3y-alert', alertController.n3yScreener);

// Return 404 to all unidentified path URLs
router.get('*', function (req: Request, res: Response) {
  console.log('error? get');
  res.status(404).json();
});
router.post('*', function (req: Request, res: Response) {
  console.log('error? post');
  res.status(404).json();
});

module.exports = router;
