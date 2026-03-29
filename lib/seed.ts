import bcrypt from "bcryptjs";
import { connectDB } from "./mongodb";
import { Category } from "./models/Category";
import { Product } from "./models/Product";
import { User } from "./models/User";
import { Vendor } from "./models/Vendor";

export async function seedMongo() {
  await connectDB();

  const categories = [
    "Fruits",
    "Vegetables",
    "Dairy",
    "Bakery",
    "Beverages",
    "Snacks",
    "Meat",
    "Seafood",
  ];

  const categoryDocs: any[] = [];
  for (const name of categories) {
    const doc = await Category.findOneAndUpdate(
      { name },
      { name },
      { upsert: true, new: true },
    );
    categoryDocs.push(doc);
  }

  const adminEmail = "admin@freshcart.com";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: "FreshCart Admin",
      email: adminEmail,
      password: await bcrypt.hash("Admin@1234", 10),
      role: "admin",
    });
  }

  let vendorUser = await User.findOne({ email: "vendor@freshcart.com" });
  if (!vendorUser) {
    vendorUser = await User.create({
      name: "Demo Vendor",
      email: "vendor@freshcart.com",
      password: await bcrypt.hash("Vendor@1234", 10),
      role: "vendor",
      address: "Market Street",
    });
  }

  const vendor = await Vendor.findOneAndUpdate(
    { userId: vendorUser._id },
    { userId: vendorUser._id, shopName: "FreshCart Store", approved: true },
    { upsert: true, new: true },
  );

  const categoryByName = new Map(categoryDocs.map((c: any) => [c.name, c]));

  // Reset products on each seed run for consistent demo data.
  await Product.deleteMany({});

  const sampleProducts = [
    { name: "Apple", category: "Fruits", price: 40, stock: 45 },
    { name: "Banana", category: "Fruits", price: 35, stock: 50 },
    { name: "Orange", category: "Fruits", price: 55, stock: 40 },
    { name: "Tomato", category: "Vegetables", price: 28, stock: 60 },
    { name: "Potato", category: "Vegetables", price: 25, stock: 70 },
    { name: "Milk", category: "Dairy", price: 50, stock: 45 },
    { name: "Bread", category: "Bakery", price: 38, stock: 35 },
    { name: "Croissant", category: "Bakery", price: 48, stock: 25 },
    { name: "Juice", category: "Beverages", price: 65, stock: 30 },
    { name: "Chips", category: "Snacks", price: 20, stock: 55 },
    { name: "Chicken", category: "Meat", price: 220, stock: 20 },
    { name: "Fish", category: "Seafood", price: 260, stock: 18 },
    { name: "Yogurt", category: "Dairy", price: 45, stock: 36 },
    { name: "Eggs", category: "Dairy", price: 72, stock: 42 },
    { name: "Paneer", category: "Dairy", price: 95, stock: 30 },

    // Added 10 requested products
    { name: "Mango", category: "Fruits", price: 60, stock: 40 },
    { name: "Grapes", category: "Fruits", price: 80, stock: 32 },
    { name: "Spinach", category: "Vegetables", price: 30, stock: 45 },
    { name: "Carrot", category: "Vegetables", price: 40, stock: 50 },
    { name: "Butter", category: "Dairy", price: 55, stock: 34 },
    { name: "Cheese", category: "Dairy", price: 120, stock: 28 },
    { name: "Biscuits", category: "Snacks", price: 25, stock: 60 },
    { name: "Namkeen", category: "Snacks", price: 35, stock: 58 },
    { name: "Lassi", category: "Beverages", price: 45, stock: 36 },
    { name: "Coconut Water", category: "Beverages", price: 30, stock: 48 },
  ];

  for (const item of sampleProducts) {
    const category = categoryByName.get(item.category) ?? categoryDocs[0];
    await Product.create({
      vendorId: vendor._id,
      categoryId: category._id,
      name: item.name,
      description: `${item.name} - fresh quality`,
      price: item.price,
      stock: item.stock,
    });
  }
}

