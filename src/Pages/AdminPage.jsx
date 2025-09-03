import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";

const AdminPage = () => {
  const { user, isAdmin } = useContext(AuthContext);

  if (!isAdmin) {
    return <Navigate to="/adminlogin" replace />;
  }

  return <h1>Welcome Admin {user?.firstName}</h1>;
};

export default AdminPage;
