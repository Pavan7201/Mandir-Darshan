import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import Lottie from "lottie-react";
import loading from "../loader/loading.json";
import "../css/AdminPage.css"


const AdminPage = () => {
  const { user, isAdmin } = useContext(AuthContext);

  if (!isAdmin) {
    return <Navigate to="/adminlogin" replace />;
  }

  return(
    <div className="admin-container">
    <Lottie animationData={loading} loop={true} className="lottie-animation" />
    </div>
  ) 
};

export default AdminPage;
