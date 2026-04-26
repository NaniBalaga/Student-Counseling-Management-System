import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { User, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

const InputField = ({ icon: Icon, type, name, placeholder, formData, handleChange, errors }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="input-wrapper">
      <div className="input-container">
        <Icon className="input-icon" size={16} />
        <input
          type={inputType}
          name={name}
          placeholder={placeholder}
          value={formData[name]}
          onChange={handleChange}
          className={`input-field ${errors[name] ? 'input-error' : ''} ${isPassword ? 'password-field' : ''}`}
        />
        {/* Password Eye Toggle */}
        {isPassword && (
          <button 
            type="button" 
            className="password-toggle" 
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {errors[name] && (
        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="error-text">
          {errors[name]}
        </motion.p>
      )}
    </div>
  );
};

const Login = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    emailOrMobile: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.emailOrMobile) newErrors.emailOrMobile = "Email or Mobile is required";
    if (!formData.password) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      try {
        const res = await axios.post(
          "http://localhost:5000/api/auth/login",
          formData
        );

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        navigate("/dashboard");
      } catch (error) {
        console.log(error);
        alert(error.response?.data?.message || "Login failed");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <style>{`
        ::-webkit-scrollbar {
          width: 0px;
          background: transparent;
          display: none;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          -ms-overflow-style: none;  
          scrollbar-width: none;  
        }

        .split-layout {
          display: flex;
          min-height: 100vh;
          font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background: #0a0a0a;
          overflow-x: hidden;
        }

        .left-side {
          flex: 1;
          position: relative;
          background: linear-gradient(135deg, #050505 0%, #111111 50%, rgba(255, 215, 0, 0.1) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          overflow: hidden;
        }
        .left-bg-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(255,215,0,0.05) 0%, rgba(0,0,0,0) 60%);
          top: 0;
          left: 0;
          pointer-events: none;
        }
        .left-content {
          position: relative;
          z-index: 1;
          max-width: 450px;
        }
        .left-title {
          font-size: 2.8rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 16px;
          background: linear-gradient(90deg, #ffffff, #ffd700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.5px;
        }
        .left-desc {
          color: #aaaaaa;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .right-side {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 40px;
          background: #0a0a0a;
        }
        .bg-glow {
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(255,215,0,0.08) 0%, rgba(0,0,0,0) 60%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        .form-container {
          width: 100%;
          max-width: 380px;
          z-index: 1;
        }

        .header-text {
          margin-bottom: 24px;
        }
        .header-title {
          color: #fff;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 6px;
          letter-spacing: -0.5px;
        }
        .header-sub {
          color: #777;
          font-size: 13px;
        }

        .form-layout {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .input-wrapper {
          width: 100%;
        }
        .input-container {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          color: #666;
          transition: color 0.2s ease;
        }
        .input-field {
          width: 100%;
          background: #111;
          border: 1px solid #222;
          color: #fff;
          font-size: 13px;
          padding: 12px 14px 12px 40px;
          border-radius: 10px;
          outline: none;
          transition: all 0.2s ease;
        }
        .input-field.password-field {
          padding-right: 40px;
        }
        .input-field::placeholder {
          color: #555;
        }
        .input-field:focus {
          border-color: #ffd700;
          background: #141414;
          box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.1);
        }
        .input-field:focus + .input-icon {
          color: #ffd700;
        }
        
        /* Password Toggle Button */
        .password-toggle {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.2s ease;
        }
        .password-toggle:hover {
          color: #ffd700;
        }

        .input-error {
          border-color: #ff4d4d;
        }
        .error-text {
          color: #ff4d4d;
          font-size: 11px;
          margin-top: 4px;
          margin-left: 4px;
        }
        
        .submit-btn {
          width: 100%;
          background: linear-gradient(90deg, #ffc107 0%, #ff9800 100%);
          color: #000;
          font-weight: 700;
          font-size: 14px;
          padding: 12px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          margin-top: 8px;
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(255, 165, 0, 0.2);
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 165, 0, 0.3);
        }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(0, 0, 0, 0.2);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .bottom-link {
          text-align: center;
          margin-top: 24px;
          color: #777;
          font-size: 12px;
        }
        .bottom-link a {
          color: #ffd700;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
        }
        .bottom-link a:hover {
          color: #ffc107;
          text-decoration: underline;
        }

        @media (max-width: 900px) {
          .split-layout {
            flex-direction: column;
            min-height: 100vh;
          }
          .left-side {
            padding: 50px 24px 20px 24px;
            text-align: center;
            flex: none; 
          }
          .left-bg-glow {
            width: 100%;
            left: 0;
            top: 0;
          }
          .left-content {
            margin: 0 auto;
          }
          .left-title {
            font-size: 2.2rem;
            margin-bottom: 12px;
          }
          .left-desc {
            font-size: 0.95rem;
          }
          
          .right-side {
            padding: 20px 24px 60px 24px;
            flex: 1; 
            display: flex;
            align-items: center; 
            justify-content: center; 
          }
          
          .form-container {
            background: transparent;
            padding: 0;
            border-radius: 0;
            border: none;
            box-shadow: none;
            margin: 0 auto;
            width: 100%;
          }
          
          .header-text {
            text-align: center;
            margin-bottom: 24px;
          }
          .header-title {
            font-size: 22px;
          }
        }
      `}</style>

      <div className="split-layout">
        
        <div className="left-side">
          <div className="left-bg-glow"></div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
            className="left-content"
          >
            <h1 className="left-title">Welcome Back</h1>
            <p className="left-desc">
              Log in to access your dashboard, manage your academic journey, and connect with your campus community.
            </p>
          </motion.div>
        </div>

        <div className="right-side">
          <div className="bg-glow"></div>
          
          <div className="form-container">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="header-text">
                <h2 className="header-title">Sign In</h2>
                <p className="header-sub">Enter your credentials to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="form-layout">
                <InputField 
                  icon={User} 
                  type="text" 
                  name="emailOrMobile" 
                  placeholder="Campus Email or Mobile" 
                  formData={formData} 
                  handleChange={handleChange} 
                  errors={errors} 
                />
                
                <InputField 
                  icon={Lock} 
                  type="password" 
                  name="password" 
                  placeholder="Password" 
                  formData={formData} 
                  handleChange={handleChange} 
                  errors={errors} 
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="submit-btn"
                >
                  {isLoading ? (
                    <div className="spinner"></div>
                  ) : (
                    <>
                      Sign In <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                    </>
                  )}
                </button>
              </form>

              <div className="bottom-link">
                Don't have an account? <Link to="/">Sign up here</Link>
              </div>
            </motion.div>
          </div>
        </div>

      </div>
    </>
  );
};

export default Login;