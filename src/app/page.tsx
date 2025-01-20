"use client";
/* import { useAuth } from "@/components/auth/authProvider"; */
import Cronograma from "@/components/dashboard/Cronograma";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AuthService } from "@/services/authService";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DefaultLayout>
      <Cronograma />
    </DefaultLayout>
  );
}
