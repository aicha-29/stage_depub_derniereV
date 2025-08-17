import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../login.css";
import loginImage from "../assets/login-logo.png";
import api from '../api/intercepteur'

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login",
        {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("role", response.data.user.role);

      const redirectPath =
        response.data.user.role === "admin"
          ? "/admin/dashboard"
          : response.data.user.role === "employee"
          ? "/employe/dashboard"
          : "/manager/dashboard";
      navigate(redirectPath);
    } catch (err) {
      setError(
        err.response?.data?.message || "Email ou mot de passe incorrect"
      );
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-image-container">
          <img src={loginImage} alt="Connexion" className="login-image" />
        </div>

        <div className="login-form-container">
          <div className="login-card">
            <div className="login-header">
              <div className="profile-icon">
                <i className="fas fa-user-circle"></i>
              </div>
              <h1>Connexion</h1>
              <p>Accédez à votre espace personnel</p>
            </div>

            {error && (
              <div className="login-error">
                <i className="fas fa-exclamation-circle"></i> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label
                  style={{
                    fontSize: "1.3rem",
                    color: "#fff",
                    letterSpacing: "0.2rem",
                  }}
                >
                  Email :
                </label>
                <div className="input-with-icon">
                  <i className="fas fa-envelope"></i>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label
                  style={{
                    fontSize: "1.3rem",
                    color: "#fff",
                    letterSpacing: "0.2rem",
                  }}
                >
                  Mot de passe
                </label>
                <div className="input-with-icon">
               <i 
                className={`fas fa-lock ${showPassword ? 'd-none' : ''}`} 
                style={{ display: showPassword ? 'none' : 'block' }}
              ></i>

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                  <i 
                    className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} password-toggle`}
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ cursor: "pointer" }}
                  />
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                  />
                  <span>Se souvenir de moi</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="login-button"
              >
                {isLoading ? (
                  <>
                    <span className="login-spinner"></span>
                    Connexion...
                  </>
                ) : (
                  "Se connecter"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;