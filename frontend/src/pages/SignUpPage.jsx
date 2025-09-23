import React, { useState } from "react";
import LabelComp from "../components/LabelComp";
import InputForm from "../components/InputForm";

const VITE_API_URL = import.meta.env.VITE_API_URL;

const fieldConfig = [
  { name: "firstName", label: "First Name", type: "text", id: "firstNameInput" },
  { name: "lastName",  label: "Last Name",  type: "text", id: "lastNameInput" },
  { name: "email",     label: "Email",      type: "email", id: "emailInput" },
  { name: "password",  label: "Password",   type: "password", id: "passwordInput" },
  { name: "avatar",    label: "Avatar",     type: "file", id: "avatarInput" },
];

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName:  "",
    email:     "",
    password:  "",
    avatar:    null,
  });
  const [error, setError] = useState("");

  const handleChange = (field) => (e) => {
    if (field === "avatar") {
      setFormData((prev) => ({ ...prev, avatar: e.target.files[0] || null }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError("Please fill out all fields.");
      return;
    }
    if (!formData.avatar) {
      setError("Please select an avatar picture.");
      return;
    }
    setError("");

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) data.append(key, value);
    });

    try {
      const response = await fetch(`${VITE_API_URL}/api/users/signup`, {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        alert("User created!");
        window.location.href = "/login";
      } else {
        setError(result.message || "Sign-up failed.");
      }
    } catch (err) {
      setError("Something went wrong.");
    }
  };

  return (
    <form
      className="card shadow-sm p-4 w-100"
      style={{ maxWidth: "480px", margin: "auto" }}
      onSubmit={handleSubmit}
    >
      <h1 className="text-center">Sign up</h1>

      {fieldConfig.map(({ name, label, type, id }) => (
        <div className="mb-3" key={name}>
          <LabelComp htmlFor={id} displayText={label} />
          <InputForm
            id={id}
            type={type}
            value={type !== "file" ? formData[name] || "" : undefined}
            onChange={handleChange(name)}
            accept={type === "file" ? "image/*" : undefined}
            aria-describedby={`${id}Help`}
          />
        </div>
      ))}

      {error && <div className="alert alert-danger mb-2">{error}</div>}

      <button type="submit" className="btn btn-primary w-100">
        Sign up
      </button>
    </form>
  );
};

export default SignUpPage;
