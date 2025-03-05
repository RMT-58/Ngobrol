import { React , useState } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import Swal from 'sweetalert2';

const Login = () => {
  const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (event) => {
        event.preventDefault();
        try {
            const { data } = await axios.post("http://localhost:3000/api/users/login", {
                email,
                password
            })
            console.log(data)
            localStorage.setItem("access_token", data.access_token);
            navigate("/");
        } catch (err) {
            console.log(err)
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: err.response.data.message
            });
        }
    }
  const animatedTitleStyle = {
    fontFamily: 'Fredoka One, sans-serif',
    fontSize: '3.5rem',
    fontWeight: 'bold',
    color: '#3498db', 
    textTransform: 'uppercase',
    textAlign: 'center',
    animation: 'fadeInUp 2s ease-in-out', 
    letterSpacing: '3px',
    textShadow: '3px 3px 5px rgba(0, 0, 0, 0.3), 0px 0px 25px rgba(255, 255, 255, 0.5)',
  };

  return (
    <section className="w-100 d-flex align-items-center justify-content-center" style={{ height: "100vh" }}>
      <div className="w-50 d-none d-md-block">
        <img src="https://static.vecteezy.com/system/resources/previews/025/441/457/non_2x/mobile-chat-app-online-communication-social-networking-messages-tiny-people-chatting-in-mobile-smartphone-and-big-speech-bubbles-modern-flat-cartoon-style-illustration-on-white-background-vector.jpg"
          alt="Gambar"
          className="w-100 h-100 object-cover" 
        />
      </div>
      <div className="w-50 w-md-100 d-flex justify-content-center">
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h1 className="text-center mb-4" style={animatedTitleStyle}>Ngobrol</h1>
          <h4 className="text-center mb-4" style={{ color: '#7f8c8d' }}>Login to Your Account</h4>
          <form onSubmit = {handleLogin}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                value ={email}
                onChange = {(e) => setEmail(e.target.value)}
                type="email"
                className="form-control"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                value ={password}
                onChange = {(e) => setPassword(e.target.value)}
                type="password"
                className="form-control"
                id="exampleInputPassword1"
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Login
            </button>
            <div className = "py-3">
              <p>
                Dont have an account yet?
                <Link to= "/register"> Register</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
};

export default Login;
