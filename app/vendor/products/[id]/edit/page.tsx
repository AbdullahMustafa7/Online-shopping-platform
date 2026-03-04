import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/profile";
import { supabaseServer } from "@/lib/supabase/server";
import { EditProductClient } from "./ui";

export default async function EditVendorProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login?next=/vendor/products");
  const { id } = await params;

  const supabase = await supabaseServer();
  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!vendor) redirect("/vendor/products");

  const { data: product } = await supabase
    .from("products")
    .select("id,name,description,price,stock,category_id,image_url,vendor_id")
    .eq("id", id)
    .eq("vendor_id", vendor.id)
    .maybeSingle();

  if (!product) redirect("/vendor/products");

  const { data: categories } = await supabase
    .from("categories")
    .select("id,name")
    .order("name", { ascending: true });

  return (
    <EditProductClient
      product={product as any}
      categories={(categories ?? []) as any}
    />
  );
}

