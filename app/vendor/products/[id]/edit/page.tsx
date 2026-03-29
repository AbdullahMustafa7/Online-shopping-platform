import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/session";
import { connectDB } from "@/lib/mongodb";
import { Vendor } from "@/lib/models/Vendor";
import { Product } from "@/lib/models/Product";
import { Category } from "@/lib/models/Category";
import { EditProductClient } from "./ui";

export default async function EditVendorProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login?next=/vendor/products");
  const { id } = await params;

  await connectDB();
  const vendor: any = await Vendor.findOne({ userId }).lean();

  if (!vendor) redirect("/vendor/products");

  const product: any = await Product.findOne({ _id: id, vendorId: vendor._id }).lean();

  if (!product) redirect("/vendor/products");

  const categories: any[] = await Category.find({}).sort({ name: 1 }).lean();

  return (
    <EditProductClient
      product={product as any}
      categories={
        (categories ?? []).map((c) => ({
          _id: String(c._id),
          id: String(c._id),
          name: c.name,
        })) as any
      }
    />
  );
}

