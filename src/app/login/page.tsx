"use client";
import LoginForm from '@/components/auth/LoginForm';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

export default function LoginPage() {
  return (
    <DefaultLayout>
      <LoginForm />
    </DefaultLayout>
  );
}
