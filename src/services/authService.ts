import axios from 'axios';

const AUTH_URL = '/api/auth';

interface LoginCredentials {
  correo: string;
  contraseña: string;
}

export interface User {
  id: string;
  correo: string;
  roles: Array<{
    nombre: string;
    estado: boolean;
  }>;
}

export const AuthService = {

  login: async (credentials: LoginCredentials): Promise<User> => {
    const response = await axios.post(AUTH_URL + "/login", credentials);
    console.log(credentials)
    console.log(response.data)
    // localStorage.setItem("user", JSON.stringify(response.data.user));
    return response.data.user;
  },

  logout: async () => {
    const response = await axios.post(AUTH_URL + "/logout")
    return response.data
  },

  checkRole: (user: User, requiredRole: string): boolean => {
    return user.roles.some(role => role.nombre === requiredRole && role.estado);
  },

  checkSession: async () => {
    const data = await axios.get(AUTH_URL + "/check")
    return data.data.user
  }
};
