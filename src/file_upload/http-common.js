import axios from "axios";

export default axios.create({
  baseURL: window.ENV.api_base + "/dms/upload",
  headers: {
    "Content-type": "application/json",
  },
});
