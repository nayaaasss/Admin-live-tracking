import axios from "axios";

export const loginAdmin = async (email: string, password: string) => {
  const res = await axios.post("https://api-gateway.ilcs.xyz/api/geofencing/admin/login", {
    email,
    password,
  });

  return res.data; 
};
