import React, { useState } from "react";
import "./Login.css";
import { auth, provider } from "../firebase";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

export const Login = () => {
  const [isSignup, setIsSignup] = useState(false); // toggles between signup/login UI
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Handle Google sign in using Firebase popup auth
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Logged in:", user.displayName);
      navigate("/discover"); // go to Discover (redirect after successful login)
    } catch (err) {
      console.error("Google login failed:", err);
    }
  };

  // Handle email/password login and signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignup) {
        // Sign up new user
        await createUserWithEmailAndPassword(auth, email, password);
        console.log("Signed up:", email);
        // sign out right after signing up so user goes through login again
        await signOut(auth);

        setIsSignup(false); // switch to login UI
        setPassword("");
      } else {
        // Login with existing email and password
        await signInWithEmailAndPassword(auth, email, password);
        console.log("Signed in:", email);
        navigate("/discover"); // go to main app
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-box">
        <img src="/podchatlogo.png" alt="PodChat logo" className="logo" />

        <h2>PodChat</h2>
        <p className="subtitle">Chat-based podcasting</p>

        <form onSubmit={handleSubmit} className="form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="primary">
            {isSignup ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <button className="google-btn" onClick={handleGoogleLogin}>
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google logo"
          />
          Sign in with Google
        </button>

        <p className="signup-text">
          {isSignup ? "Already have an account?" : "Don't have an account?"}
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-button"
          >
            {isSignup ? " Sign In" : " Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};
