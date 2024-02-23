import mongoose from "mongoose";
import { Supplier, Product, Offer, SalesOrder, Category } from "./models.js";

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

  const insertedProducts = await Product.insertMany([
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
      supplier: "Ultimate Sports Gear",
    },
  ]);

  const findProductIdByName = (name) =>
    insertedProducts.find((p) => p.name === name)?._id;

  const offers = await Offer.insertMany([
    {
      products: [
        findProductIdByName("Laptop"),
        findProductIdByName("Smartphone"),
      ],
      price: 1800,
      cost: 2400,
      active: true,
    },
    {
      products: [
        findProductIdByName("T-shirt"),
        findProductIdByName("Shampoo"),
      ],
      price: 30,
      cost: 100,
      active: true,
    },
    {
      products: [
        findProductIdByName("Refrigerator"),
        findProductIdByName("Smartphone"),
        findProductIdByName("Soccer Ball"),
      ],
      price: 1830,
      cost: 2460,
      active: false,
    },
  ]);

  await SalesOrder.insertMany([
    {
      offer: offers[0]._id,
      quantity: 2,
      status: "pending",
      totalPrice: 4800,
    },
    {
      offer: offers[2]._id,
      quantity: 1,
      status: "pending",
      totalPrice: 2460,
    },
  ]);

  await Category.insertMany([
    { name: "Electronics" },
    { name: "Clothing" },
    { name: "Home Appliances" },
    { name: "Beauty & Personal Care" },
    { name: "Sports & Outdoors" },
  ]);

  console.log("Data inserted successfully!");
  console.log("Exiting...");
  mongoose.disconnect();
  process.exit(0);
};

insertData().catch(console.error);
