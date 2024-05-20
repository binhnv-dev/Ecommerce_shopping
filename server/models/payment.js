const Mongoose = require("mongoose");
const { Schema } = Mongoose;

const paymentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    provider: {
      type: String,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    total: {
      type: Number,
    },
    data: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Mongoose.model("Payment", paymentSchema);
