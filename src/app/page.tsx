"use client"
import { useAuth } from "@/components/auth/authProvider";
import Cronograma from "@/components/dashboard/Cronograma";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from 'react';


export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;  // o un componente de carga
  }

  return (
    <DefaultLayout>
      <Cronograma />
    </DefaultLayout>
  );
}
