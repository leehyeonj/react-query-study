import axios from "axios";

export const getUserWithAxios = async () => {
  const { data } = await axios.get('http://localhost:3002/user');
  return data;
};