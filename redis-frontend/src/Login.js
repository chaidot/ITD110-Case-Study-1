import "./Login.css";
import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:5000/login";
const REGISTER_URL = "http://localhost:5000/register";

const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validation for registration
    if (isRegistering && formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      toast.error("Passwords don't match");
      return;
    }

    if (isRegistering && formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      toast.error("Password must be at least 8 characters long");
      return;
    }
    
    setIsLoading(true);

    try {
      const url = isRegistering ? REGISTER_URL : API_URL;
      const response = await axios.post(url, formData);

      if (response.data.success) {
        toast.success(`${isRegistering ? "Registration" : "Login"} successful!`);

        if (isRegistering) {
          setIsRegistering(false);
          setFormData({ email: '', password: '', confirmPassword: '' });
        } else {
          const { user, token } = response.data;
          localStorage.setItem('user', JSON.stringify(user));
          if (token) {
            localStorage.setItem('token', token);
          }
          onLogin(user, token);
        }
      } else {
        setError(response.data.message || "Invalid email or password.");
        toast.error(response.data.message || `${isRegistering ? "Registration" : "Login"} failed.`);
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error.response?.data?.message || "Error connecting to server or invalid credentials.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      toast.error("Please enter your email address");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post("http://localhost:5000/forgot-password", { email: formData.email });
      if (response.data.success) {
        toast.success("Password reset instructions sent to your email");
        setForgotPassword(false);
      } else {
        toast.error(response.data.message || "Failed to process request");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error processing your request. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderForgotPasswordForm = () => (
    <form onSubmit={handleForgotPassword} className="login-form">
      <h2>Password Recovery</h2>
      <div className="form-group">
        <label htmlFor="email">Email Address:</label>
        <input
          type="email"
          id="reset-email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>
      <button type="submit" className="submit-button" disabled={isLoading}>
        {isLoading ? "Processing..." : "Submit Request"}
      </button>
      <div className="switch-form">
        <button
          type="button"
          onClick={() => setForgotPassword(false)}
          className="switch-button"
        >
          Return to Login
        </button>
      </div>
    </form>
  );

  const renderLoginRegisterForm = () => (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>{isRegistering ? "Create Account" : "Sign In"}</h2>

      <div className="form-group">
        <label htmlFor="email">Email Address:</label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
      </div>

      {isRegistering && (
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <button type="submit" className="submit-button" disabled={isLoading}>
        {isLoading ? "Processing..." : (isRegistering ? "Register" : "Login")}
      </button>

      {!isRegistering && (
        <div className="forgot-password">
          <button
            type="button"
            onClick={() => setForgotPassword(true)}
            className="forgot-password-link"
          >
            Forgot Password?
          </button>
        </div>
      )}

      <div className="switch-form">
        <p>{isRegistering ? "Already have an account?" : "Don't have an account?"}</p>
        <button
          type="button"
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError("");
            setFormData({ email: '', password: '', confirmPassword: '' });
          }}
          className="switch-button"
        >
          {isRegistering ? "Sign In" : "Create Account"}
        </button>
      </div>
    </form>
  );

  return (
    <div className="login-container">
      <ToastContainer position="top-center" />
      <div className="login-card">
        <div className="barangay-logo-container">
          <img
            src="/brgy-logo.jpg"
            alt="Selyo ng Barangay Del Carmen"
            className="barangay-logo"
          />
          <h1 className="barangay-name">Barangay Del Carmen</h1>
          <p className="barangay-location">Iligan City</p>
          <p className="system-title">Official Profiling System</p>
        </div>
        
        {forgotPassword ? renderForgotPasswordForm() : renderLoginRegisterForm()}
        
        <div className="copyright">
          &copy; {currentYear} Barangay Del Carmen Information System
        </div>
      </div>
    </div>
  );
};

export default LoginForm;