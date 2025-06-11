import React, { useState } from "react";
import "./Login.css";
import { auth, provider, db } from "../firebase";
import { saveUserIfNew } from "../firebaseUtils";
import { useNavigate } from "react-router-dom";
import { signOut, updateProfile } from "firebase/auth";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import {
  setDoc,
  doc,
  getDocs,
  collection,
  query,
  where,
} from "firebase/firestore";

export const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await saveUserIfNew(user);
      console.log("Logged in:", user.displayName);
      navigate("/discover");
    } catch (err) {
      console.error("Google login failed:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignup) {
        if (!name.trim()) {
          alert("Name is required.");
          return;
        }

        if (!name.match(/^[a-zA-Z0-9_ ]{3,20}$/)) {
          alert(
            "Name must be 3–20 characters: letters, numbers, spaces or _ only."
          );
          return;
        }

        const nameExistsSnapshot = await getDocs(
          query(collection(db, "users"), where("name", "==", name.trim()))
        );

        if (!nameExistsSnapshot.empty) {
          alert("This name is already taken. Try another.");
          return;
        }

        const result = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = result.user;

        // ✅ Set Firebase Auth display name
        await updateProfile(user, {
          displayName: name.trim(),
        });

        user.displayName = name.trim(); // for saveUserIfNew
        await saveUserIfNew(user);

        console.log("Signed up:", email);
        await signOut(auth); // force login again after signup
        setIsSignup(false);
        setPassword("");
        setName("");
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        const user = result.user;
        await saveUserIfNew(user);
        console.log("Signed in:", email);
        navigate("/discover");
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
          {isSignup && (
            <input
              type="text"
              placeholder="Display Name"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
            />
          )}
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
