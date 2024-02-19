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
  products: [String],
  price: Number,
  active: Boolean,
});

const salesOrderSchema = new mongoose.Schema({
  offer: String,
  quantity: Number,
  status: String,
});

export const Supplier = mongoose.model("Supplier", supplierSchema);
export const Product = mongoose.model("Product", productSchema);
export const Offer = mongoose.model("Offer", offerSchema);
export const SalesOrder = mongoose.model("SalesOrder", salesOrderSchema);
