import axios from "axios";
import { User } from "./authService";

const API_URL = '/api/users';

export const userService = {
  updateUser: async (id: string, user: Partial<User>): Promise<User> => {
    const response = await axios.put(`${API_URL}/${id}`, user);
    return response.data;
  },
  deleteUser: async (id: string): Promise<User> => {
    const response = await axios.delete(`${API_URL}/${id}`)
    return response.data
  }
}
