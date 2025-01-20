"use client";
// import { AuthProvider } from "@/components/auth/authProvider";
import  LoginForm  from "@/components/auth/LoginForm";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { AuthProvider } from "@/contexts/AuthContext";

export default function LoginPage() {
  return (
    <DefaultLayout>
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    </DefaultLayout>
  );
}
