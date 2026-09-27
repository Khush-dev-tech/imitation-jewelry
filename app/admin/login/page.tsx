import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin-session";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4">
      <h1 className="font-heading text-2xl text-charcoal">Admin Login</h1>
      <LoginForm />
    </div>
  );
}
