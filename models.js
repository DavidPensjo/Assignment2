import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
  name: String,
  contact: String,
  email: String,
});

const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  cost: Number,
  stock: Number,
  supplier: String,
});

const offerSchema = new mongoose.Schema({
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  price: Number,
  cost: Number,
  active: Boolean,
});

const salesOrderSchema = new mongoose.Schema({
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Offer",
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  quantity: Number,
  status: String,
  date: {
    type: Date,
    default: Date.now,
  },
  totalPrice: Number,
  totalRevenue: Number,
  revenuePerOffer: Number,
  totalProfit: Number,
  profitPerOffer: Number,
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

export const Supplier = mongoose.model("Supplier", supplierSchema);
export const Product = mongoose.model("Product", productSchema);
export const Offer = mongoose.model("Offer", offerSchema);
export const SalesOrder = mongoose.model("SalesOrder", salesOrderSchema);
export const Category = mongoose.model("Category", categorySchema);
