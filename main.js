import prompt from "prompt-sync";
import mongoose from "mongoose";
import { Product, Supplier, Offer, SalesOrder, Category } from "./models.js";

const input = prompt({ sigint: true });

mongoose
  .connect("mongodb://localhost:27017/ProductManagementSystem")
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

function mainMenu() {
  console.log("\nMain Menu:");
  console.log("1. Add new category");
  console.log("2. Add new product");
  console.log("3. View products by category");
  console.log("4. View products by supplier");
  console.log("5. View all offers within a price range");
  console.log(
    "6. View all offers that contain a product from a specific category"
  );
  console.log(
    "7. View the number of offers based on the number of its products in stock"
  );
  console.log("8. Create order for products");
  console.log("9. Create order for offers");
  console.log("10. Ship orders");
  console.log("11. Add a new supplier");
  console.log("12. View suppliers");
  console.log("13. View all sales");
  console.log("14. View sum of all profits");
  console.log("15. Exit");

  let option = input("Select an option: ");

  switch (option) {
    case "1":
      addNewCategory();
      break;
    case "2":
      addNewProduct();
      break;
    case "3":
      viewProductsByCategory();
      break;
    case "4":
      viewProductsBySupplier();
      break;
    case "5":
      viewAllOffersWithinPriceRange();
      break;
    case "6":
      viewAllOffersContainingProductFromCategory();
      break;
    case "7":
      viewNumberOfOffersByStock();
      break;
    case "8":
      createOrderForProducts();
      break;
    case "9":
      createOrderForOffers();
      break;
    case "10":
      shipOrders();
      break;
    case "11":
      addNewSupplier();
      break;
    case "12":
      viewSuppliers();
      break;
    case "13":
      viewAllSales();
      break;
    case "14":
      viewSumOfAllProfits();
      break;
    case "15":
      console.log("Exiting...");
      mongoose.disconnect();
      process.exit(0);
    default:
      console.log("Invalid option, please choose again.");
      mainMenu();
  }
}

async function addNewCategory() {
  console.log("Adding a new category...");

  let name = input("Enter category name: ").trim();

  if (!name) {
    console.log("Category name cannot be empty.");
    mainMenu();
    return;
  }

  const category = new Category({ name });

  try {
    await category.save();
    console.log("Category added successfully.");
  } catch (error) {
    console.error("Failed to add category:", error);
  }

  mainMenu();
}

async function addNewProduct() {
  console.log("Adding a new product...");

  const name = input("Enter product name: ").trim();
  const price = parseFloat(input("Enter product price: ").trim());
  const cost = parseFloat(input("Enter product cost: ").trim());
  const stock = parseInt(input("Enter product stock: ").trim(), 10);

  if (!name || isNaN(price) || isNaN(cost) || isNaN(stock)) {
    console.log(
      "Invalid input. Please ensure all fields are correctly filled."
    );
    mainMenu();
    return;
  }

  console.log("Available categories:");
  const categories = await Category.find();
  categories.forEach((cat, index) => console.log(`${index + 1}. ${cat.name}`));
  console.log(`${categories.length + 1}. Add new category`);

  let categoryChoice =
    parseInt(input("Select category number or add new: ").trim(), 10) - 1;
  let selectedCategory;

  if (categoryChoice === categories.length) {
    const newCategoryName = input("Enter new category name: ").trim();
    selectedCategory = new Category({ name: newCategoryName });
    await selectedCategory.save();
    console.log(`New category added: ${newCategoryName}`);
  } else if (categoryChoice >= 0 && categoryChoice < categories.length) {
    selectedCategory = categories[categoryChoice];
  } else {
    console.log("Invalid category choice.");
    mainMenu();
    return;
  }

  console.log("Available suppliers:");
  const suppliers = await Supplier.find();
  suppliers.forEach((sup, index) => console.log(`${index + 1}. ${sup.name}`));
  console.log(`${suppliers.length + 1}. Add new supplier`);

  let supplierChoice =
    parseInt(input("Select supplier number or add new: ").trim(), 10) - 1;
  let selectedSupplier;

  if (supplierChoice === suppliers.length) {
    const supplierName = input("Enter new supplier name: ").trim();
    const supplierContact = input("Enter supplier contact: ").trim();
    const supplierEmail = input("Enter supplier email: ").trim();
    selectedSupplier = new Supplier({
      name: supplierName,
      contact: supplierContact,
      email: supplierEmail,
    });
    await selectedSupplier.save();
    console.log(`New supplier added: ${supplierName}`);
  } else if (supplierChoice >= 0 && supplierChoice < suppliers.length) {
    selectedSupplier = suppliers[supplierChoice];
  } else {
    console.log("Invalid supplier choice.");
    mainMenu();
    return;
  }

  const product = new Product({
    name,
    price,
    cost,
    stock,
    category: selectedCategory.name,
    supplier: selectedSupplier.name,
  });

  try {
    await product.save();
    console.log("Product added successfully.");
  } catch (error) {
    console.error("Failed to add product:", error);
  }

  mainMenu();
}

async function viewProductsByCategory() {
  console.log("Viewing products by category...");

  const categories = await Category.find();
  if (categories.length === 0) {
    console.log("No categories found.");
    mainMenu();
    return;
  }

  categories.forEach((category, index) => {
    console.log(`${index + 1}. ${category.name}`);
  });

  let choice = parseInt(
    input("Select a category to view products: ").trim(),
    10
  );
  if (isNaN(choice) || choice < 1 || choice > categories.length) {
    console.log("Invalid choice.");
    mainMenu();
    return;
  }

  const selectedCategory = categories[choice - 1];
  const products = await Product.find({ category: selectedCategory.name });

  if (products.length === 0) {
    console.log(`No products found in category "${selectedCategory.name}".`);
    mainMenu();
    return;
  }

  console.log(`Products in category "${selectedCategory.name}":`);
  products.forEach((product, index) => {
    console.log(
      `${index + 1}. Name: ${product.name}, Price: $${product.price}, Cost: $${
        product.cost
      }, Supplier: ${product.supplier}, Stock: ${product.stock}pcs`
    );
  });

  mainMenu();
}

async function viewProductsBySupplier() {
  console.log("Viewing products by supplier...");

  const suppliers = await Supplier.find();
  if (suppliers.length === 0) {
    console.log("No suppliers found.");
    mainMenu();
    return;
  }

  suppliers.forEach((supplier, index) => {
    console.log(`${index + 1}. ${supplier.name}`);
  });

  let choice = parseInt(
    input("Select a supplier to view products: ").trim(),
    10
  );
  if (isNaN(choice) || choice < 1 || choice > suppliers.length) {
    console.log("Invalid choice.");
    mainMenu();
    return;
  }

  const selectedSupplier = suppliers[choice - 1];
  const products = await Product.find({ supplier: selectedSupplier.name });

  if (products.length === 0) {
    console.log(`No products found for supplier "${selectedSupplier.name}".`);
    mainMenu();
    return;
  }

  console.log(`Products from supplier "${selectedSupplier.name}":`);
  products.forEach((product, index) => {
    console.log(
      `${index + 1}. Name: ${product.name}, Price: $${product.price}, Cost: $${
        product.cost
      }, Stock: ${product.stock}pcs`
    );
  });

  mainMenu();
}

async function viewAllOffersWithinPriceRange() {
  console.log("Viewing all offers within a price range...");

  let minPriceInput = input(
    "Enter minimum price (leave blank for no minimum): "
  ).trim();
  let maxPriceInput = input(
    "Enter maximum price (leave blank for no maximum): "
  ).trim();

  let minPrice = parseFloat(minPriceInput);
  let maxPrice = parseFloat(maxPriceInput);

  let queryConditions = {};

  if (!isNaN(minPrice)) {
    queryConditions.price = { $gte: minPrice };
  }

  if (!isNaN(maxPrice)) {
    if (queryConditions.price) {
      queryConditions.price.$lte = maxPrice;
    } else {
      queryConditions.price = { $lte: maxPrice };
    }
  }

  const offers = await Offer.find(queryConditions);

  if (offers.length === 0) {
    console.log("No offers found within the specified price range.");
    mainMenu();
    return;
  }

  console.log("Offers within the specified price range:");
  offers.forEach((offer, index) => {
    console.log(
      `${index + 1}. Price: $${offer.price}, Stock: ${
        offer.active ? "In stock" : "Out of stock"
      }, Products: ${offer.products.join(", ")}`
    );
  });

  mainMenu();
}

async function viewAllOffersContainingProductFromCategory() {
  console.log(
    "Viewing all offers that contain a product from a specific category..."
  );

  const categories = await Category.find();
  if (categories.length === 0) {
    console.log("No categories found.");
    mainMenu();
    return;
  }

  categories.forEach((category, index) => {
    console.log(`${index + 1}. ${category.name}`);
  });

  const categoryChoice = parseInt(
    input("Select a category number: ").trim(),
    10
  );
  if (
    isNaN(categoryChoice) ||
    categoryChoice < 1 ||
    categoryChoice > categories.length
  ) {
    console.log("Invalid choice.");
    mainMenu();
    return;
  }

  const selectedCategory = categories[categoryChoice - 1];

  const productsInCategory = await Product.find({
    category: selectedCategory.name,
  });
  if (productsInCategory.length === 0) {
    console.log(
      `No products found in the "${selectedCategory.name}" category.`
    );
    mainMenu();
    return;
  }

  const productNames = productsInCategory.map((product) => product.name);

  const offers = await Offer.find({ products: { $in: productNames } });
  if (offers.length === 0) {
    console.log(
      `No offers found containing products from the "${selectedCategory.name}" category.`
    );
    mainMenu();
    return;
  }

  console.log(
    `Offers containing products from the "${selectedCategory.name}" category:`
  );
  offers.forEach((offer, index) => {
    console.log(
      `${index + 1}. Included Products: ${offer.products.join(", ")}, Price: $${
        offer.price
      }, Stock: ${offer.active ? "In stock" : "Out of stock"}`
    );
  });

  mainMenu();
}

async function viewNumberOfOffersByStock() {
  console.log("Viewing number of offers by product stock availability...");

  const offers = await Offer.find();
  let allInStockCount = 0;
  let someInStockCount = 0;
  let noneInStockCount = 0;

  for (let offer of offers) {
    const products = await Product.find({ name: { $in: offer.products } });

    let stockStatus = products.reduce(
      (acc, product) => {
        if (product.stock > 0) acc.inStock++;
        else acc.outOfStock++;
        return acc;
      },
      { inStock: 0, outOfStock: 0 }
    );

    if (stockStatus.inStock === products.length) {
      allInStockCount++;
    } else if (stockStatus.outOfStock === products.length) {
      noneInStockCount++;
    } else {
      someInStockCount++;
    }
  }

  console.log(`Offers with all products in stock: ${allInStockCount}`);
  console.log(`Offers with some products in stock: ${someInStockCount}`);
  console.log(`Offers with no products in stock: ${noneInStockCount}`);

  mainMenu();
}

function createOrderForProducts() {
  console.log("Creating order for products...");
  mainMenu();
}

function createOrderForOffers() {
  console.log("Creating order for offers...");
  mainMenu();
}

function shipOrders() {
  console.log("Shipping orders...");
  mainMenu();
}

function addNewSupplier() {
  console.log("Adding a new supplier...");
  mainMenu();
}

function viewSuppliers() {
  console.log("Viewing suppliers...");
  mainMenu();
}

function viewAllSales() {
  console.log("Viewing all sales...");
  mainMenu();
}

function viewSumOfAllProfits() {
  console.log("Viewing sum of all profits...");
  mainMenu();
}

mainMenu();
