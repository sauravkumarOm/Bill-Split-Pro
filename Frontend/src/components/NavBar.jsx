import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/Authcontext";
import axios from "../api/axiosInstance";
import { FiLogOut, FiUser, FiMenu, FiX } from "react-icons/fi";

const NavBar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
 const [avatar, setAvatar] = useState(null);

 const backendUrl = import.meta.env.VITE_API_BASE_URL;

 useEffect(()=>{
     const loadAvatar = async ()=>{
      try{
        const res = await axios.get("/users/me");
        if(res.data?.user?.avatarUrl){
          setAvatar(`${backendUrl}${res.data.user.avatarUrl}`);
        }
      }
      catch(err){
          console.error("Error loading avatar:", err);
        }
     }
     loadAvatar();
 }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-extrabold text-blue-600 hover:text-blue-700 transition-colors"
        >
          BillSplit <span className="text-indigo-500">Pro</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center gap-4">
          {user ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 text-gray-700 font-medium hover:text-indigo-600 transition"
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt="avatar"
                    loading="lazy"
                    className="w-8 h-8 rounded-full border border-indigo-500 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                {user.name}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 transition font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="sm:hidden flex items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-700 focus:outline-none"
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="sm:hidden absolute right-4 top-16 bg-white shadow-lg border border-gray-200 rounded-lg w-52 z-50">
          <div className="flex flex-col px-4 py-3 gap-3">
            {user ? (
              <>
                {/* Profile */}
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 font-medium text-sm px-2 py-1 rounded transition"
                >
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="avatar"
                      className="w-10 h-10 rounded-full border border-indigo-500 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-base font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )} {user.name}
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium text-sm px-2 py-1 rounded transition"
                >
                  <FiLogOut className="text-base" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-700 hover:text-blue-600 transition font-medium text-sm px-2 py-1 rounded"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition font-medium text-center"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
