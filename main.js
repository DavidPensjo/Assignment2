const mongoose = require('mongoose');
const prompt = require('prompt-sync')();
import { Supplier, Product, Offer, SalesOrder } from "./models.js";


mongoose.connect('mongodb://localhost:27017/yourDatabaseName', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB...'))
.catch(err => console.error('Could not connect to MongoDB...', err));


