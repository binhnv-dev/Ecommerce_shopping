const express = require("express");
const router = express.Router();

const auth = require("../../middleware/auth");
const Cart = require("../../models/cart");
const Order = require("../../models/order");
const Payment = require("../../models/payment");
const { filterMonth } = require("../../services/payment");
const key = require("../../config/keys");
const mailgun = require("../../services/mailgun");

const stripe = require("stripe")(key.stripe.secret);

router.post("/create-payment-intent", auth, async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const customer = await stripe.customers.create();

    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2020-08-27" }
    );

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      customer: customer.id,
    });

    res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/mobile/success", auth, async function (req, res) {
  const { userId, productId, orderId,  provider, amount } = req.body;

  try {
    await Order.updateOne(
      { _id: orderId },
      {
        isPaid: true,
      }
    );

    const foundCart = await Cart.findOne({ "products._id": productId });
    const foundCartProduct = foundCart.products.find((p) => p._id == productId);

    if (foundCartProduct.status == "Not processed") {
      await Cart.updateOne(
        { "products._id": productId },
        {
          "products.$.status": "Paid",
        }
      );
    }

    const payment = new Payment({
      user: userId,
      product: productId,
      order: orderId,
      total: amount,
      provider,
    });

    const newPayment = await payment.save();

    await mailgun.sendEmail(
      req.user.email,
      "payment-success",
      req.headers.host,
      newPayment
    );

    res.status(201).json({
      success: true,
      message: "Your order has been paid successfully!",
    });
  } catch (err) {
    res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    });
  }
});

router.post("/success", auth, async function (req, res) {
  const { userId, productId, orderId, data, provider, tokenId, amount } =
    req.body;

  try {
    if (provider.toLowerCase() === "credit") {
      stripe.charges.create(
        {
          source: tokenId,
          amount: amount,
          currency: "USD",
        },
        (stripeErr) => {
          if (stripeErr) {
            res.status(500).json(stripeErr);
          }
        }
      );
    }
    await Order.updateOne(
      { _id: orderId },
      {
        isPaid: true,
      }
    );

    const foundCart = await Cart.findOne({ "products._id": productId });
    const foundCartProduct = foundCart.products.find((p) => p._id == productId);

    if (foundCartProduct.status == "Not processed") {
      await Cart.updateOne(
        { "products._id": productId },
        {
          "products.$.status": "Paid",
        }
      );
    }

    const payment = new Payment({
      user: userId,
      product: productId,
      order: orderId,
      total: amount,
      data,
      provider,
    });

    const newPayment = await payment.save();

    await mailgun.sendEmail(
      req.user.email,
      "payment-success",
      req.headers.host,
      newPayment
    );

    res.status(201).json({
      success: true,
      message: "Your order has been paid successfully!",
    });
  } catch (err) {
    res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const admin = req.user.role === "ROLE_ADMIN";
    const payments = admin
      ? await Payment.find({})
      : await Payment.aggregate([
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "user",
              as: "users",
            },
          },
          {
            $unwind: {
              path: "$users",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: {
              user: req.user._id,
            },
          },
        ]);

    res.status(200).json(payments);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something was wrong!" });
  }
});

router.get("/analyst", auth, async function (req, res) {
  try {
    const admin = req.user.role === "ROLE_ADMIN";

    const analyst = admin
      ? await Payment.find({})
      : await Payment.aggregate([
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "user",
              as: "users",
            },
          },
          {
            $unwind: {
              path: "$users",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: {
              user: req.user._id,
            },
          },
        ]);

    const dec = filterMonth(analyst, 12);
    const jan = filterMonth(analyst, 1);
    const feb = filterMonth(analyst, 2);
    const mar = filterMonth(analyst, 3);
    res.status(200).json({ jan, feb, dec, mar });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
