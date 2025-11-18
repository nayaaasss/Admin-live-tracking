import axios from "axios";

export const loginAdmin = async (email: string, password: string) => {
  const res = await axios.post("http://localhost:8080/admin/login", {
    email,
    password,
  });

  return res.data; 
};
