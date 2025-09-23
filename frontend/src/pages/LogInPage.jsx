import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LabelComp from "../components/LabelComp.jsx";
import InputForm from "../components/InputForm.jsx";
import AlertComp from "../components/AlertComp.jsx";
import { checkEmail } from "../utils/checkFormErrors.js";

const VITE_API_URL = import.meta.env.VITE_API_URL;

const LogInPage = () => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const navigate                = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Basic validation
      if (!checkEmail.checkEmpty(email))   throw new Error("Email field is empty.");
      if (!checkEmail.checkFormat(email))  throw new Error("Email format is incorrect.");
      if (!password)                       throw new Error("Password field is empty.");

      setError("");

      const response = await fetch(`${VITE_API_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const serverData = await response.json();

      if (response.status === 401) {
        setError("Invalid credentials, please check your email and password.");
        return;
      }

      if (!response.ok) {
        setError(serverData?.message || "Login failed, try again.");
        return;
      }

      // Save token
      if (serverData.token) {
        localStorage.setItem("token", serverData.token);
        localStorage.setItem("avatar", serverData.imageUrl || "");
        navigate("/");
      } else {
        setError("Login succeeded but no token received.");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    }
  };

  return (
    <form
      className="card shadow-sm p-4 w-100"
      style={{ maxWidth: "480px", margin: "auto" }}
      onSubmit={handleSubmit}
    >
      <h1 className="text-center">Log In</h1>

      <div className="mb-3">
        <LabelComp htmlFor="emailInput" displayText="Email" />
        <InputForm
          type="email"
          id="emailInput"
          aria-describedby="emailHelp"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <LabelComp htmlFor="passwordInput" displayText="Password" />
        <InputForm
          type="password"
          id="passwordInput"
          aria-describedby="passwordHelp"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && <AlertComp alertType="alert-danger" text={error} />}

      <button type="submit" className="btn btn-primary w-100">
        Log In
      </button>
    </form>
  );
};

export default LogInPage;
