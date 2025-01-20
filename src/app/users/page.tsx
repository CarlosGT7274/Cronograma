"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { userService } from "@/services/userService";

interface User {
  _id: string;
  nombre: string;
  correo: string;
  roles: Array<{ nombre: string; estado: boolean }>;
  activo: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await userService.updateUser(editingUser._id, editingUser);
      await fetchUsers();
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await userService.deleteUser(id);
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <DefaultLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Administración de Usuarios</h1>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b text-left">Correo</th>
                <th className="px-6 py-3 border-b text-left">Roles</th>
                <th className="px-6 py-3 border-b text-left">Estado</th>
                <th className="px-6 py-3 border-b text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 border-b">{user.correo}</td>
                  <td className="px-6 py-4 border-b">
                    {user.roles.map((role) => role.nombre).join(", ")}
                  </td>
                  <td className="px-6 py-4 border-b">
                    {user.activo ? "Activo" : "Inactivo"}
                  </td>
                  <td className="px-6 py-4 border-b">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-600 hover:text-red-800 ml-4"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Editar Usuario</h2>
              <form onSubmit={handleEditUser} className="space-y-4">
                <div>
                  <label className="block mb-1">Correo</label>
                  <input
                    type="text"
                    value={editingUser.correo}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, correo: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block mb-1">Rol</label>
                  <select
                    value={editingUser.roles.map((r) => r.nombre)}
                    className="w-full p-2 border rounded"
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        roles: [{ ...editingUser.roles[0], nombre: e.target.value }],
                      })
                    }
                  >
                    <option>Admin</option>
                    <option>Usuario</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Estado</label>
                  <select
                    value={editingUser.activo ? "activo" : "inactivo"}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        activo: e.target.value === "activo",
                      })
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}
