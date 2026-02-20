const express = require('express');
const rateLimit = require('express-rate-limit');
const { auth: protect } = require('../middleware/auth');
const Subscription = require('../models/Subscription');
const { initiateSTKPush } = require('../services/mpesa');

const router = express.Router();

const paymentLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

const PLANS = {
  monthly: { amount: 299, duration: 30, label: 'Monthly' },
  annual: { amount: 2499, duration: 365, label: 'Annual' },
};

// GET /api/payments/subscription
router.get('/subscription', protect, async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({ user: req.user._id });
    if (!sub || !sub.isActive()) return res.json({ subscribed: false });
    res.json({ subscribed: true, plan: sub.plan, endDate: sub.endDate, status: sub.status });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/subscribe — initiate M-Pesa STK push
router.post('/subscribe', protect, paymentLimiter, async (req, res, next) => {
  try {
    const { phone, plan } = req.body;
    if (!phone || !plan || !PLANS[plan]) {
      return res.status(400).json({ message: 'phone and plan (monthly|annual) are required' });
    }

    // Validate phone format (Kenyan numbers)
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!/^(\+?254|0)[17]\d{8}$/.test(cleanPhone)) {
      return res.status(400).json({ message: 'Enter a valid Kenyan phone number (e.g. 0712345678)' });
    }

    const { amount, duration } = PLANS[plan];

    const result = await initiateSTKPush({
      phone: cleanPhone,
      amount,
      accountRef: `TRAILS-${req.user._id.toString().slice(-6).toUpperCase()}`,
      description: `Trails ${plan} subscription`,
    });

    if (result.ResponseCode !== '0') {
      return res.status(400).json({ message: result.ResponseDescription || 'STK push failed' });
    }

    await Subscription.findOneAndUpdate(
      { user: req.user._id },
      {
        user: req.user._id,
        plan,
        status: 'pending',
        checkoutRequestId: result.CheckoutRequestID,
        phone: cleanPhone,
        amount,
        updated_at: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({
      message: 'A payment prompt has been sent to your phone. Enter your M-Pesa PIN to complete.',
      checkoutRequestId: result.CheckoutRequestID,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/mpesa/callback — Safaricom payment callback (no auth)
router.post('/mpesa/callback', async (req, res, next) => {
  try {
    const callbackData = req.body?.Body?.stkCallback;
    if (!callbackData) return res.json({ ResultCode: 0 });

    const { CheckoutRequestID, ResultCode } = callbackData;

    if (ResultCode !== 0) {
      await Subscription.findOneAndUpdate(
        { checkoutRequestId: CheckoutRequestID, status: 'pending' },
        { $set: { status: 'expired', updated_at: new Date() } }
      );
      return res.json({ ResultCode: 0 });
    }

    const items = callbackData.CallbackMetadata?.Item || [];
    const getItem = (name) => items.find((i) => i.Name === name)?.Value;
    const receiptNumber = getItem('MpesaReceiptNumber');

    const sub = await Subscription.findOne({ checkoutRequestId: CheckoutRequestID });
    if (!sub) return res.json({ ResultCode: 0 });

    const now = new Date();
    const duration = PLANS[sub.plan]?.duration || 30;
    const endDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);

    await Subscription.findByIdAndUpdate(sub._id, {
      $set: {
        status: 'active',
        startDate: now,
        endDate,
        mpesaReceiptNumber: receiptNumber,
        updated_at: new Date(),
      },
    });

    res.json({ ResultCode: 0 });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/verify — poll status after STK push
router.post('/verify', protect, async (req, res, next) => {
  try {
    const { checkoutRequestId } = req.body;
    if (!checkoutRequestId) {
      return res.status(400).json({ message: 'checkoutRequestId required' });
    }
    const sub = await Subscription.findOne({ user: req.user._id, checkoutRequestId });
    if (!sub) return res.json({ status: 'not_found' });
    res.json({ status: sub.status, subscribed: sub.isActive() });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
