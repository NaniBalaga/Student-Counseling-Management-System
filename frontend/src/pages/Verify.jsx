import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { CheckCircle, XCircle, Loader2, MailOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Verify = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email; // Captures email passed from Register page

  // If there's a token, start loading. If no token but we have an email, show pending screen. Otherwise, invalid.
  const [status, setStatus] = useState(token ? "loading" : (email ? "pending" : "invalid")); 
  const [message, setMessage] = useState("");
  
  // Prevents React 18 Strict Mode from calling the API twice
  const hasFetched = useRef(false);

  useEffect(() => {
    const verifyAccount = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/auth/verify/${token}`
        );

        setStatus("success");
        setMessage(res.data?.message || "Your account has been successfully verified!");
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message || "Verification failed. The link may have expired."
        );
      }
    };

    if (token && !hasFetched.current) {
      hasFetched.current = true;
      verifyAccount();
    }
  }, [token]);

  // Animation variants for the content
  const contentVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, y: -15, transition: { duration: 0.3 } }
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        
        /* --- PREMIUM BACKGROUND MATCHING REGISTER PAGE --- */
        .verify-layout {
          display: flex;
          min-height: 100vh;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #050505 0%, #0a0a0a 50%, rgba(255, 215, 0, 0.05) 100%);
          position: relative;
          overflow: hidden;
          padding: 20px;
        }

        /* --- PULSING RADIAL GLOW --- */
        .bg-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(255,215,0,0.08) 0%, rgba(0,0,0,0) 60%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          animation: pulseGlow 4s ease-in-out infinite alternate;
        }
        @keyframes pulseGlow {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
        }

        /* --- CONTENT WRAPPER (No Box) --- */
        .content-wrapper {
          width: 100%;
          max-width: 420px;
          text-align: center;
          z-index: 1;
          position: relative;
          /* Removed all background, borders, and box-shadows */
        }

        .icon-wrapper {
          margin: 0 auto 24px auto;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 80px; /* Slightly larger since there's no box */
          height: 80px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .icon-loading {
          color: #ffd700;
          animation: spin 1s linear infinite;
        }
        .icon-pending {
          color: #ffd700;
          box-shadow: 0 0 30px rgba(255, 215, 0, 0.1);
          border-color: rgba(255, 215, 0, 0.15);
        }
        .icon-success {
          color: #4ade80;
          box-shadow: 0 0 30px rgba(74, 222, 128, 0.15);
          border-color: rgba(74, 222, 128, 0.2);
        }
        .icon-error {
          color: #ff4d4d;
          box-shadow: 0 0 30px rgba(255, 77, 77, 0.15);
          border-color: rgba(255, 77, 77, 0.2);
        }

        .title {
          font-size: 26px; /* Slightly larger for emphasis */
          font-weight: 800;
          margin-bottom: 12px;
          letter-spacing: -0.5px;
          color: #ffffff;
        }
        
        .message {
          color: #999;
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 32px;
        }
        .highlight-email {
          color: #ffd700;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        /* --- BUTTONS --- */
        .action-btn {
          width: 100%;
          background: linear-gradient(90deg, #ffc107 0%, #ff9800 100%);
          color: #000;
          font-weight: 700;
          font-size: 15px;
          padding: 14px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          display: inline-block;
          box-shadow: 0 4px 15px rgba(255, 165, 0, 0.2);
          text-decoration: none;
        }
        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 165, 0, 0.3);
        }
        
        .secondary-btn {
          background: #111;
          color: #eee;
          border: 1px solid #333;
          box-shadow: none;
        }
        .secondary-btn:hover {
          background: #1a1a1a;
          color: #ffd700;
          border-color: #ffd700;
          box-shadow: none;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div className="verify-layout">
        <div className="bg-glow"></div>

        <div className="content-wrapper">
          <AnimatePresence mode="wait">
            
            {/* --- WAITING FOR USER TO CHECK EMAIL --- */}
            {status === "pending" && (
              <motion.div key="pending" variants={contentVariants} initial="hidden" animate="visible" exit="exit">
                <div className="icon-wrapper icon-pending">
                  <MailOpen size={36} />
                </div>
                <h2 className="title">Check Your Inbox</h2>
                <p className="message">
                  We've sent a verification link to <br/>
                  <span className="highlight-email">{email}</span>. <br/>
                  Please click the link to activate your account.
                </p>
                <button onClick={() => navigate("/login")} className="action-btn secondary-btn">
                  Back to Login
                </button>
              </motion.div>
            )}

            {/* --- INVALID NO-TOKEN STATE --- */}
            {status === "invalid" && (
              <motion.div key="invalid" variants={contentVariants} initial="hidden" animate="visible" exit="exit">
                <div className="icon-wrapper icon-error">
                  <XCircle size={36} />
                </div>
                <h2 className="title">Invalid Request</h2>
                <p className="message">No verification token was found. Please ensure you clicked the exact link sent to your email.</p>
                <button onClick={() => navigate("/")} className="action-btn">
                  Register a New Account
                </button>
              </motion.div>
            )}

            {/* --- LOADING VERIFICATION --- */}
            {status === "loading" && (
              <motion.div key="loading" variants={contentVariants} initial="hidden" animate="visible" exit="exit">
                <div className="icon-wrapper">
                  <Loader2 size={36} className="icon-loading" />
                </div>
                <h2 className="title">Verifying Account</h2>
                <p className="message">Please wait a moment while we securely confirm your credentials...</p>
              </motion.div>
            )}

            {/* --- SUCCESS STATE --- */}
            {status === "success" && (
              <motion.div key="success" variants={contentVariants} initial="hidden" animate="visible" exit="exit">
                <div className="icon-wrapper icon-success">
                  <CheckCircle size={36} />
                </div>
                <h2 className="title">Verification Complete</h2>
                <p className="message">{message}</p>
                <button onClick={() => navigate("/login")} className="action-btn">
                  Proceed to Login
                </button>
              </motion.div>
            )}

            {/* --- ERROR STATE --- */}
            {status === "error" && (
              <motion.div key="error" variants={contentVariants} initial="hidden" animate="visible" exit="exit">
                <div className="icon-wrapper icon-error">
                  <XCircle size={36} />
                </div>
                <h2 className="title">Verification Failed</h2>
                <p className="message">{message}</p>
                <button onClick={() => navigate("/")} className="action-btn secondary-btn">
                  Back to Register
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default Verify;