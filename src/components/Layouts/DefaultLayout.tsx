"use client";
import React, { useState, ReactNode } from "react";
import { useAuth } from "../auth/authProvider";
import Link from "next/link";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1">
          <div className="flex flex-grow items-center justify-between py-4 px-4 shadow-2">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Logo o título */}
              <h1 className="text-xl font-bold">Cronograma</h1>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-3">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">{user.correo}</span>
                  <button
                    onClick={logout}
                    className="rounded bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
                  >
                    Cerrar Sesión
                  </button>
                  {user.roles.map((user, uIndex) =>
                    user.nombre === "admin" ? (
                      <Link key={uIndex} href={"/users"}>Roles</Link>
                    ) : null,
                  )}
                </>
              ) : (
                <></>
              )}
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main>
          <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
