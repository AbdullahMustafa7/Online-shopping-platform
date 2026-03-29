import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "customer" | "vendor" | "agent" | "admin";
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "customer" | "vendor" | "agent" | "admin";
  }
}

