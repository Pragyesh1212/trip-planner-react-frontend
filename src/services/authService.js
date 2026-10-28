
import api from "./api";

const authService = {
  async signup({ name, email, password }) {
    const response = await api.post("/authentication/signup", {
      name,
      email,
      password,
    });

    return response.data;
  },

  async login({ email, password }) {
    const response = await api.post("/authentication/login", {
      email,
      password,
    });

    const { access_token, token_type } = response.data;

    if (!access_token) {
      throw new Error("The server did not return an access token.");
    }

    sessionStorage.setItem("access_token", access_token);
    sessionStorage.setItem(
      "token_type",
      token_type || "bearer"
    );

    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get("/authentication/me");
    return response.data;
  },

  logout() {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("token_type");
  },
};

export default authService;
