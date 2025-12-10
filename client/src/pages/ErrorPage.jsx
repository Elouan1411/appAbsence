import React, { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
function ErrorPage() {
  const { user, role } = useAuth();
  console.log("Error user: ", user);
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/", { replace: true });
  }, [user]);
  return <div>Oups... Vous n'êtes censés atterrir ici</div>;
}

export default ErrorPage;
