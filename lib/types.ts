export type UserRole = "customer" | "vendor" | "agent" | "admin";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "ready"
  | "picked_up"
  | "on_the_way"
  | "delivered";

export type UserProfile = {
  id: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  role: UserRole;
  address: string | null;
  created_at: string;
};

