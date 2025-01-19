import axios from 'axios';
import { User } from './authService';
const REGISTER_URL = '/api/register';

interface RegisterData {
  correo: string;
  contraseña: string;
  roles?: Array<{
    nombre: string;
    estado: boolean;
  }>;
}

export const RegisterService = {
  register: async (data: RegisterData): Promise<User> => {
    const response = await axios.post(REGISTER_URL, data);
    return response.data.user;
  }
};
