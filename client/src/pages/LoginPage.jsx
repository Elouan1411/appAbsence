import React from "react";
import "../style/Login.css";
import InputField from "../components/common/InputField";
import Button from "../components/common/Button";
function LoginPage() {
  return (
    <div className="login-container">
      <div className="login-form-container">
        <InputField placeholder="votre.email@example.com" text="Email" />
        <InputField placeholder="motdepasse" text="Mot de passe" />
        <Button>Button</Button>
      </div>
    </div>
  );
}

export default LoginPage;
