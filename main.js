import prompt from "prompt-sync";
import mongoose from "mongoose";
import { Product, Supplier, Offer, SalesOrder, Category } from "./models.js";

const input = prompt({ sigint: true });

mongoose
  .connect("mongodb://localhost:27017/ProductManagementSystem")
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB...", err));

async function mainMenu() {
  await updateOffersActiveStatus();

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
      viewAllSuppliers();
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

async function updateOffersActiveStatus() {
  const offers = await Offer.find();

  for (let offer of offers) {
    const products = await Product.find({ name: { $in: offer.products } });
    const allInStock = products.every((product) => product.stock > 0);

    if (offer.active !== allInStock) {
      offer.active = allInStock;
      await offer.save();
    }
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

  try {
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
        `${index + 1}. Name: ${product.name}, Price: $${
          product.price
        }, Cost: $${product.cost}, Supplier: ${product.supplier}, Stock: ${
          product.stock
        }pcs`
      );
    });
  } catch (error) {
    console.error(
      "An error occurred while fetching products by category:",
      error
    );
    mainMenu();
  }
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

async function createOrderForProducts() {
  console.log("Creating order for products...");
  const products = await Product.find({});
  if (products.length === 0) {
    console.log("No products available.");
    mainMenu();
    return;
  }
  products.forEach((product, index) => {
    console.log(
      `${index + 1}. ${product.name} - Price: $${product.price}, Stock: ${
        product.stock
      }`
    );
  });
  let productChoice = parseInt(
    input("Select a product by number: ").trim(),
    10
  );
  if (
    isNaN(productChoice) ||
    productChoice < 1 ||
    productChoice > products.length
  ) {
    console.log("Invalid choice.");
    mainMenu();
    return;
  }
  const selectedProduct = products[productChoice - 1];
  let quantity = parseInt(
    input(`Enter quantity (up to ${selectedProduct.stock}): `).trim(),
    10
  );
  if (isNaN(quantity) || quantity < 1 || quantity > selectedProduct.stock) {
    console.log(
      "Invalid quantity. Please ensure it does not exceed available stock."
    );
    mainMenu();
    return;
  }
  const order = new SalesOrder({
    product: selectedProduct._id,
    quantity: quantity,
    status: "pending",
  });
  try {
    await order.save();
    console.log(
      `Order for ${quantity}x ${selectedProduct.name} created successfully and is now pending.`
    );
  } catch (error) {
    console.error("Failed to create order:", error);
  }
  mainMenu();
}

async function createOrderForOffers() {
  console.log("Creating order for offers...");

  const offers = await Offer.find({ active: true }).populate("products");
  if (offers.length === 0) {
    console.log("No offers available.");
    mainMenu();
    return;
  }

  offers.forEach((offer, index) => {
    const productNames = offer.products
      .map((product) => product.name)
      .join(", ");
    console.log(
      `${index + 1}. Offer includes: ${productNames}, Price: $${offer.price}`
    );
  });

  let offerChoice = parseInt(input("Select an offer by number: ").trim(), 10);
  if (isNaN(offerChoice) || offerChoice < 1 || offerChoice > offers.length) {
    console.log("Invalid choice.");
    mainMenu();
    return;
  }

  const selectedOffer = offers[offerChoice - 1];
  const minStock = selectedOffer.products.reduce(
    (min, product) => Math.min(min, product.stock),
    Infinity
  );

  console.log(
    `Maximum quantity available for this offer based on stock: ${minStock}`
  );
  let quantity = parseInt(input("Enter quantity: ").trim(), 10);

  if (isNaN(quantity) || quantity < 1) {
    console.log("Invalid quantity.");
    mainMenu();
    return;
  } else if (quantity > minStock) {
    console.log(`Quantity exceeds maximum available stock (${minStock}).`);
    mainMenu();
    return;
  }

  const discount = quantity >= 10 ? 0.9 : 1;
  const totalPrice = selectedOffer.price * quantity * discount;

  const order = new SalesOrder({
    offer: selectedOffer._id,
    quantity: quantity,
    status: "pending",
    totalPrice: totalPrice,
  });

  await order.save();
  console.log(
    `Order for ${quantity}x [${selectedOffer.products
      .map((product) => product.name)
      .join(
        ", "
      )}] at a total price of $${totalPrice} created successfully and is now pending.`
  );

  mainMenu();
}

async function shipOrders() {
  console.log("Fetching pending orders...");
  const pendingOrders = await SalesOrder.find({ status: "pending" });
  if (pendingOrders.length === 0) {
    console.log("No pending orders available to ship.");
    mainMenu();
    return;
  }
  pendingOrders.forEach((order, index) => {
    console.log(
      `${index + 1}. Order ID: ${order._id}, Quantity: ${order.quantity}`
    );
  });
  const selectedOrdersInput = input(
    "Enter the numbers of the orders you wish to ship, separated by commas (e.g., 1,2,3): "
  ).trim();
  const selectedIndices = selectedOrdersInput
    .split(",")
    .map((num) => parseInt(num.trim(), 10) - 1);
  for (const index of selectedIndices) {
    if (index < 0 || index >= pendingOrders.length) {
      console.log(`Invalid selection: ${index + 1}`);
      continue;
    }
    const order = pendingOrders[index];
    if (order.product) {
      await handleProductOrder(order);
    } else if (order.offer) {
      await handleOfferOrder(order);
    } else {
      console.log(
        `Order ID: ${order._id} does not have a valid product or offer reference.`
      );
    }
  }
  mainMenu();
}

async function handleProductOrder(order) {
  const product = await Product.findById(order.product);
  if (!product) {
    console.log(`Product not found for order ID: ${order._id}.`);
    return;
  }
  if (product.stock < order.quantity) {
    console.log(`Insufficient stock for product order ID: ${order._id}.`);
    return;
  }
  product.stock -= order.quantity;
  await product.save();
  order.status = "shipped";
  await order.save();
  console.log(`Product order ${order._id} has been shipped.`);
}

async function handleOfferOrder(order) {
  try {
    const offer = await Offer.findById(order.offer).populate("products");
    if (!offer) {
      console.log(`Offer not found for order ID: ${order._id}.`);
      return;
    }
    if (offer.products.some((product) => product.stock < order.quantity)) {
      console.log(
        `Insufficient stock for one or more products in offer order ID: ${order._id}.`
      );
      return;
    }

    const discountMultiplier = order.quantity >= 10 ? 0.9 : 1;
    const totalPrice = offer.price * order.quantity * discountMultiplier;

    for (const product of offer.products) {
      if (product.stock < order.quantity) {
        console.error(`Insufficient stock for product ${product.name}`);
      }
      product.stock -= order.quantity;
      await product.save();
    }

    order.status = "shipped";
    order.totalPrice = totalPrice;
    await order.save();

    console.log(
      `Offer order ${order._id} has been shipped with total price: $${totalPrice}.`
    );
  } catch (error) {
    console.error(`Error processing offer order ${order._id}:`, error);
  }
}

async function addNewSupplier() {
  console.log("Adding a new supplier...");

  const name = input("Enter supplier name: ").trim();
  const contact = input("Enter supplier contact: ").trim();
  const email = input("Enter supplier email: ").trim();

  if (!name) {
    console.log("Supplier name cannot be empty.");
    return mainMenu();
  }

  const supplier = new Supplier({
    name,
    contact,
    email,
  });

  try {
    await supplier.save();
    console.log("New supplier added successfully.");
  } catch (error) {
    console.error("Failed to add new supplier:", error);
  }

  mainMenu();
}

async function viewAllSuppliers() {
  console.log("Viewing all suppliers...");

  const suppliers = await Supplier.find({});

  if (suppliers.length === 0) {
    console.log("No suppliers found.");
  } else {
    suppliers.forEach((supplier, index) => {
      console.log(
        `${index + 1}. Name: ${supplier.name}, Contact: ${
          supplier.contact
        }, Email: ${supplier.email}`
      );
    });
  }

  mainMenu();
}

async function viewAllSales() {
  console.log("Viewing all sales orders...");

  const salesOrders = await SalesOrder.find({})
    .populate("product offer")
    .exec();

  if (salesOrders.length === 0) {
    console.log("No sales orders found.");
    mainMenu();
    return;
  }

  salesOrders.forEach((order, index) => {
    let date = new Date(order.date).toLocaleDateString("en-US");
    let status = order.status;
    let totalCost;

    if (order.product) {
      totalCost = order.product.price * order.quantity;
    } else if (order.offer) {
      totalCost = order.offer.price * order.quantity;
    } else {
      totalCost = "N/A";
    }

    console.log(`Order Number: ${order._id}`);
    console.log(`Date: ${date}`);
    console.log(`Status: ${status}`);
    console.log(`Total Cost: $${totalCost}`);
    console.log("------");
  });

  mainMenu();
}

function viewSumOfAllProfits() {
  console.log("Viewing sum of all profits...");
  mainMenu();
}

mainMenu();
