import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router";
import Swal from "sweetalert2";
import { AuthContext } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useContext(AuthContext);

  const handleRegister = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Passwords Don't Match",
        text: "Please make sure your passwords match",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(username, email, password);

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Registration Successful!",
          text: "You can now login with your credentials",
        });
        navigate("/login");
      } else {
        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: result.error,
        });
      }
    } catch (err) {
      console.log(err);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const animatedTitleStyle = {
    fontFamily: "Fredoka One, sans-serif",
    fontSize: "3.5rem",
    fontWeight: "bold",
    color: "#3498db",
    textTransform: "uppercase",
    textAlign: "center",
    animation: "fadeInUp 2s ease-in-out",
    letterSpacing: "3px",
    textShadow:
      "3px 3px 5px rgba(0, 0, 0, 0.3), 0px 0px 25px rgba(255, 255, 255, 0.5)",
  };

  return (
    <section
      className="w-100 d-flex align-items-center justify-content-center"
      style={{ height: "100vh" }}
    >
      <div className="w-50 d-none d-md-block">
        <img
          src="https://static.vecteezy.com/system/resources/previews/025/441/457/non_2x/mobile-chat-app-online-communication-social-networking-messages-tiny-people-chatting-in-mobile-smartphone-and-big-speech-bubbles-modern-flat-cartoon-style-illustration-on-white-background-vector.jpg"
          alt="Gambar"
          className="w-100 h-100 object-cover"
        />
      </div>
      <div className="w-50 w-md-100 d-flex justify-content-center">
        <div style={{ width: "100%", maxWidth: "400px" }}>
          <h1 className="text-center mb-4" style={animatedTitleStyle}>
            Ngobrol
          </h1>
          <h4 className="text-center mb-4" style={{ color: "#7f8c8d" }}>
            Create an Account
          </h4>
          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                className="form-control"
                id="username"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="form-control"
                id="email"
                aria-describedby="emailHelp"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="form-control"
                id="password"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                className="form-control"
                id="confirmPassword"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isLoading}
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
            <div className="py-3">
              <p>
                Already have an account?
                <Link to="/login"> Login</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Register;
