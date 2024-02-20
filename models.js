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
      ref: "Product", // Ensure this matches the name you used when calling mongoose.model() for Products
    },
  ],
  price: Number,
  active: Boolean,
  // other fields as necessary
});

const salesOrderSchema = new mongoose.Schema({
  offer: String,
  quantity: Number,
  status: String,
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
});

export const Supplier = mongoose.model("Supplier", supplierSchema);
export const Product = mongoose.model("Product", productSchema);
export const Offer = mongoose.model("Offer", offerSchema);
export const SalesOrder = mongoose.model("SalesOrder", salesOrderSchema);
export const Category = mongoose.model("Category", categorySchema);
