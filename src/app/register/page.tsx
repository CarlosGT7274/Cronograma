"use client";
import RegisterForm from '@/components/auth/RegisterForm';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

export default function RegisterPage() {
  return (
    <DefaultLayout>
      <RegisterForm />
    </DefaultLayout>
  );
}
