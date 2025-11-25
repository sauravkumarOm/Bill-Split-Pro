import { useContext, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "../../api/axiosInstance";
import { AuthContext } from "../../context/Authcontext";
import { useNavigate, Link } from "react-router-dom";
import SliderLoader from "../../components/Loading/SliderLoader";

const Login = () => {
  const { register, handleSubmit, setValue , formState: { errors } } = useForm();
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(()=>{
    const savedUser = localStorage.getItem("user");
    if(savedUser){
      const userObj = JSON.parse(savedUser);
      setValue("email", userObj.email);
    }
  }, [setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await axios.post("auth/login", data);
      login({ token: res.data.token, user: res.data.user });

      // show animation for 1.5 sec before navigating
      setSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Login failed");
      console.error("Login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <SliderLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Login</h2>

        {errorMsg && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-center text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              {...register("email", { required: true })}
              placeholder="Enter your email"
              className="w-full mt-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">Email is required</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              {...register("password", { required: true })}
              type="password"
              placeholder="Enter your password"
              className="w-full mt-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">Password is required</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition flex justify-center items-center"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
