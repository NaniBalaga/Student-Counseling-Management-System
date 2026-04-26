import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, Lock, Calendar, BookOpen,
  KeyRound, ShieldCheck, GraduationCap, Briefcase,
  ArrowLeft, ChevronRight, Eye, EyeOff, Info,
  CheckCircle2, Circle
} from "lucide-react";

// MOVED OUTSIDE: This prevents the input from losing focus on every keystroke
const InputField = ({ icon: Icon, type, name, placeholder, options, formData, handleChange, errors, helperText, isValid }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;
  
  // Show the green tick only if the field is valid AND it's not the password field
  // (Password field already has the live criteria list below it)
  const showValidTick = isValid && !isPassword;

  // Real-time password criteria logic
  const isPasswordValid = (pw) => ({
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  });

  const pwCriteria = name === "password" ? isPasswordValid(formData.password) : null;

  return (
    <div className="input-wrapper">
      <div className="input-container">
        <Icon className="input-icon" size={16} />
        {type === "select" ? (
          <>
            <select
              name={name}
              value={formData[name]}
              onChange={handleChange}
              className={`input-field select-field ${errors[name] ? 'input-error' : ''} ${showValidTick ? 'has-right-icon' : ''}`}
            >
              <option value="" disabled>{placeholder}</option>
              {options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {showValidTick && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="valid-tick"
              >
                <CheckCircle2 size={16} color="#4ade80" />
              </motion.div>
            )}
          </>
        ) : (
          <>
            <input
              type={inputType}
              name={name}
              placeholder={placeholder}
              value={formData[name]}
              onChange={handleChange}
              className={`input-field ${errors[name] ? 'input-error' : ''} ${(isPassword || showValidTick) ? 'has-right-icon' : ''}`}
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

            {/* Live Validation Tick */}
            {showValidTick && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="valid-tick"
              >
                <CheckCircle2 size={16} color="#4ade80" />
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Dynamic Password Strength Status UI */}
      {name === "password" && (
        <div className="password-criteria">
          <div className={`criteria-item ${pwCriteria.length ? 'met' : ''}`}>
            {pwCriteria.length ? <CheckCircle2 size={12} /> : <Circle size={12} />}
            <span>8+ characters</span>
          </div>
          <div className={`criteria-item ${pwCriteria.upper ? 'met' : ''}`}>
            {pwCriteria.upper ? <CheckCircle2 size={12} /> : <Circle size={12} />}
            <span>Uppercase letter</span>
          </div>
          <div className={`criteria-item ${pwCriteria.number ? 'met' : ''}`}>
            {pwCriteria.number ? <CheckCircle2 size={12} /> : <Circle size={12} />}
            <span>Number</span>
          </div>
          <div className={`criteria-item ${pwCriteria.special ? 'met' : ''}`}>
            {pwCriteria.special ? <CheckCircle2 size={12} /> : <Circle size={12} />}
            <span>Special character</span>
          </div>
        </div>
      )}

      {/* Dynamic Error or Helper Text */}
      {errors[name] ? (
        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="error-text">
          {errors[name]}
        </motion.p>
      ) : helperText && name !== "password" ? (
        <p className="helper-text">{helperText}</p>
      ) : null}
    </div>
  );
};

const Register = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    gender: "",
    dob: "",
    academicYear: "",
    secretCode: "",
  });

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    // Only allow digits in mobile field
    if (e.target.name === "mobile" && e.target.value !== "" && !/^\d+$/.test(e.target.value)) {
      return;
    }

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for the specific field when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  // VALIDATION FUNCTION
  const validate = () => {
    let newErrors = {};

    if (!role) newErrors.role = "Select a role";
    if (formData.name.length < 4) newErrors.name = "Name must be at least 4 characters";
    if (!formData.email.includes("@")) newErrors.email = "Enter a valid email address";
    if (!/^\d{10}$/.test(formData.mobile)) newErrors.mobile = "Mobile number must be exactly 10 digits";
    
    // Strict Password Validation based on criteria UI
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (
      formData.password.length < 8 || 
      !/[A-Z]/.test(formData.password) || 
      !/[0-9]/.test(formData.password) || 
      !/[^A-Za-z0-9]/.test(formData.password)
    ) {
      newErrors.password = "Please meet all password requirements above";
    }

    // STUDENT VALIDATION
    if (role === "student") {
      if (!formData.gender) newErrors.gender = "Select gender";
      if (!formData.dob) newErrors.dob = "Select DOB";
      
      // Strict Academic Year Formatting (YYYY-YYYY)
      if (!formData.academicYear) {
        newErrors.academicYear = "Enter academic year";
      } else if (!/^\d{4}-\d{4}$/.test(formData.academicYear)) {
        newErrors.academicYear = "Format must be exactly YYYY-YYYY (e.g., 2024-2028)";
      }
    }

    // SECRET CODE VALIDATION
    if (role === "counsellor" && formData.secretCode !== "counsellor@123") {
      newErrors.secretCode = "Invalid counsellor code";
    }
    if (role === "admin" && formData.secretCode !== "admin@123") {
      newErrors.secretCode = "Invalid admin code";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsLoading(true);
      try {
        const finalData = {
          ...formData,
          role,
        };

        const res = await axios.post(
          "http://localhost:5000/api/auth/register",
          finalData
        );

        alert(res.data.message);
        navigate("/verify", { state: { email: formData.email } });

      } catch (error) {
        console.log(error);
        alert(error.response?.data?.message || "Registration failed");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <style>{`
        /* --- HIDE SCROLLBAR BUT KEEP SCROLL FUNCTIONALITY --- */
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

        /* --- LEFT SIDE (GRADIENT ONLY) --- */
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

        /* --- RIGHT SIDE (FORM) --- */
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

        /* --- TYPOGRAPHY & BUTTONS --- */
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
        .role-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 12px 16px;
          background: #111;
          border: 1px solid #222;
          border-radius: 10px;
          cursor: pointer;
          margin-bottom: 12px;
          transition: all 0.2s ease;
        }
        .role-btn:hover {
          border-color: #ffd700;
          background: rgba(255, 215, 0, 0.05);
          transform: translateY(-2px);
        }
        .role-info {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .role-icon-box {
          background: rgba(255, 255, 255, 0.03);
          padding: 8px;
          border-radius: 8px;
          color: #ffd700;
          display: flex;
        }
        .role-text {
          color: #eee;
          font-size: 14px;
          font-weight: 600;
        }
        .role-arrow {
          color: #444;
          transition: transform 0.2s ease, color 0.2s ease;
        }
        .role-btn:hover .role-arrow {
          color: #ffd700;
          transform: translateX(4px);
        }

        /* --- FORM STYLES --- */
        .form-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
        }
        .back-btn {
          background: #111;
          border: 1px solid #222;
          color: #888;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          transition: all 0.2s ease;
        }
        .back-btn:hover {
          background: #1a1a1a;
          color: #ffd700;
          border-color: #ffd700;
        }
        .form-title {
          color: #fff;
          font-size: 18px;
          font-weight: 600;
          text-transform: capitalize;
        }
        .form-subtitle {
          color: #777;
          font-size: 12px;
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
        .input-field.has-right-icon {
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
        
        /* ICONS ON THE RIGHT (EYE OR TICK) */
        .password-toggle, .valid-tick {
          position: absolute;
          right: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .password-toggle {
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s ease;
        }
        .password-toggle:hover {
          color: #ffd700;
        }
        
        /* --- PASSWORD CRITERIA UI --- */
        .password-criteria {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 8px;
          padding-left: 4px;
        }
        .criteria-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: #555;
          transition: color 0.3s ease;
        }
        .criteria-item.met {
          color: #4ade80; /* Success green */
        }

        .input-error {
          border-color: #ff4d4d !important;
        }
        .error-text {
          color: #ff4d4d;
          font-size: 11px;
          margin-top: 4px;
          margin-left: 4px;
        }
        .helper-text {
          color: #666;
          font-size: 11px;
          margin-top: 4px;
          margin-left: 4px;
        }
        .select-field {
          appearance: none;
          cursor: pointer;
        }
        .select-field option {
          background: #111;
          color: #fff;
        }

        /* --- INFO NOTE STYLES --- */
        .info-note {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: rgba(255, 215, 0, 0.04);
          border: 1px solid rgba(255, 215, 0, 0.15);
          padding: 12px;
          border-radius: 8px;
          margin-top: 4px;
          margin-bottom: 4px;
        }
        .info-note-icon {
          color: #ffd700;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .info-note-text {
          color: #999;
          font-size: 11.5px;
          line-height: 1.5;
        }
        .info-note-text strong {
          color: #bbb;
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

        /* --- RESPONSIVE DESIGN (UPGRADED FOR MOBILE) --- */
        @media (max-width: 900px) {
          .split-layout {
            flex-direction: column;
            height: auto;
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
        
        {/* LEFT SIDE - GRADIENT ONLY */}
        <div className="left-side">
          <div className="left-bg-glow"></div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }}
            className="left-content"
          >
            <h1 className="left-title">Empower Your Campus Experience</h1>
            <p className="left-desc">
              Join our unified digital ecosystem. Whether you're navigating your academic journey, guiding student success, or managing operations, everything starts here.
            </p>
          </motion.div>
        </div>

        {/* RIGHT SIDE - FORM */}
        <div className="right-side">
          <div className="bg-glow"></div>
          
          <div className="form-container">
            <AnimatePresence mode="wait">
              {!role ? (
                <motion.div
                  key="role-selection"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="header-text">
                    <h2 className="header-title">Create an Account</h2>
                    <p className="header-sub">Select your role to continue</p>
                  </div>

                  <div>
                    <button onClick={() => setRole("student")} className="role-btn">
                      <div className="role-info">
                        <div className="role-icon-box"><GraduationCap size={18} /></div>
                        <span className="role-text">Student</span>
                      </div>
                      <ChevronRight size={16} className="role-arrow" />
                    </button>

                    <button onClick={() => setRole("counsellor")} className="role-btn">
                      <div className="role-info">
                        <div className="role-icon-box"><Briefcase size={18} /></div>
                        <span className="role-text">Counsellor</span>
                      </div>
                      <ChevronRight size={16} className="role-arrow" />
                    </button>

                    <button onClick={() => setRole("admin")} className="role-btn">
                      <div className="role-info">
                        <div className="role-icon-box"><ShieldCheck size={18} /></div>
                        <span className="role-text">Admin</span>
                      </div>
                      <ChevronRight size={16} className="role-arrow" />
                    </button>
                  </div>

                  <div className="bottom-link">
                    Already have an account? <Link to="/login">Sign in here</Link>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="registration-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="form-header">
                    <button 
                      onClick={() => { setRole(""); setErrors({}); }}
                      className="back-btn"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <div>
                      <h2 className="form-title">{role} Registration</h2>
                      <p className="form-subtitle">Fill in your details below</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="form-layout">
                    {/* Live Validation Logic Passed Here */}
                    <InputField icon={User} type="text" name="name" placeholder="Full Name" formData={formData} handleChange={handleChange} errors={errors} helperText="Must be at least 4 characters." isValid={formData.name.length >= 4} />
                    
                    <InputField icon={Mail} type="email" name="email" placeholder="Campus Email" formData={formData} handleChange={handleChange} errors={errors} isValid={formData.email.includes("@") && formData.email.length > 5} />
                    
                    <InputField icon={Phone} type="text" name="mobile" placeholder="Mobile Number" formData={formData} handleChange={handleChange} errors={errors} helperText="Enter exactly 10 digits." isValid={/^\d{10}$/.test(formData.mobile)} />
                    
                    {/* Password has its own internal validation UI below it */}
                    <InputField icon={Lock} type="password" name="password" placeholder="Password" formData={formData} handleChange={handleChange} errors={errors} isValid={false} />

                    {/* STUDENT EXTRA FIELDS */}
                    {role === "student" && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="form-layout">
                        <InputField icon={User} type="select" name="gender" placeholder="Select Gender" options={["Male", "Female", "Other"]} formData={formData} handleChange={handleChange} errors={errors} isValid={formData.gender !== ""} />
                        
                        <InputField icon={Calendar} type="date" name="dob" placeholder="Date of Birth" formData={formData} handleChange={handleChange} errors={errors} isValid={formData.dob !== ""} />
                        
                        <InputField icon={BookOpen} type="text" name="academicYear" placeholder="Academic Year" formData={formData} handleChange={handleChange} errors={errors} helperText="Format: YYYY-YYYY (e.g., 2024-2028)" isValid={/^\d{4}-\d{4}$/.test(formData.academicYear)} />
                      </motion.div>
                    )}

                    {/* SECRET CODE FIELDS */}
                    {(role === "counsellor" || role === "admin") && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                        <InputField icon={KeyRound} type="password" name="secretCode" placeholder={`${role.charAt(0).toUpperCase() + role.slice(1)} Secret Code`} formData={formData} handleChange={handleChange} errors={errors} isValid={formData.secretCode.length >= 5} />
                      </motion.div>
                    )}

                    {/* Registration Verification Note */}
                    <div className="info-note">
                      <Info className="info-note-icon" size={16} />
                      <p className="info-note-text">
                        <strong>Note:</strong> After successful registration, you will receive an email to verify your account. Please ensure your email is correct.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="submit-btn"
                    >
                      {isLoading ? <div className="spinner"></div> : "Create Account"}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </>
  );
};

export default Register;