import mongoose from "mongoose";
import { Supplier, Product, Offer, SalesOrder } from "./models.js";

mongoose
  .connect("mongodb://localhost:27017/ProductManagementSystem")
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Couldn't connect to MongoDB...", err));

const insertData = async () => {
  await Supplier.insertMany([
    {
      name: "Electronics Supplier Inc.",
      contact: "John Doe",
      email: "john@electronicsupplier.com",
    },
    {
      name: "Fashion Supplier Co.",
      contact: "Jane Smith",
      email: "jane@fashionsupplier.com",
    },
    {
      name: "Ultimate Sports Gear",
      contact: "Morgan Hayes",
      email: "morgan@ultimatesportsgear.com",
    },
  ]);

  await Product.insertMany([
    {
      name: "Laptop",
      category: "Electronics",
      price: 1000,
      cost: 800,
      stock: 50,
      supplier: "Electronics Supplier Inc.",
    },
    {
      name: "Smartphone",
      category: "Electronics",
      price: 800,
      cost: 600,
      stock: 40,
      supplier: "Electronics Supplier Inc.",
    },
    {
      name: "T-shirt",
      category: "Clothing",
      price: 20,
      cost: 10,
      stock: 100,
      supplier: "Fashion Supplier Co.",
    },
    {
      name: "Refrigerator",
      category: "Home Appliances",
      price: 1200,
      cost: 1000,
      stock: 30,
      supplier: "Electronics Supplier Inc.",
    },
    {
      name: "Shampoo",
      category: "Beauty & Personal Care",
      price: 10,
      cost: 5,
      stock: 80,
      supplier: "Fashion Supplier Co.",
    },
    {
      name: "Soccer Ball",
      category: "Sports & Outdoors",
      price: 30,
      cost: 20,
      stock: 60,
      supplier: "Fashion Supplier Co.",
    },
  ]);

  await Offer.insertMany([
    { products: ["Laptop", "Smartphone"], price: 1800, active: true },
    { products: ["T-shirt", "Shampoo"], price: 30, active: true },
    {
      products: ["Refrigerator", "Smartphone", "Soccer Ball"],
      price: 1830,
      active: false,
    },
  ]);

  await SalesOrder.insertMany([
    { offer: "Offer 1", quantity: 2, status: "pending" },
    { offer: "Offer 3", quantity: 1, status: "pending" },
  ]);

  console.log("Data inserted successfully!");
};

insertData().catch(console.error);
