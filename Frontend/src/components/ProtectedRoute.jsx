import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/Authcontext";

const ProtectedRoute = ({children}) =>{
    const {user, loading, token} = useContext(AuthContext);
    if(loading){
        return <div>Loading...</div>
    }
    if(!token){
        return <Navigate to="/login" />
    }
    return children;
}

export default ProtectedRoute;