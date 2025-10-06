import axios from "axios";
import { BASE_URL } from "./constants.ts";

const axiosHeader = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosHeader;
