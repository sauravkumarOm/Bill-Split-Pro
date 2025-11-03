import { useEffect, useState, useContext } from "react";
import axios from "../../api/axiosInstance";
import { AuthContext } from "../../context/Authcontext";
import { motion } from "framer-motion";
import {
  FiMail,
  FiCheckCircle,
  FiAlertCircle,
  FiCreditCard,
  FiUser,
} from "react-icons/fi";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/users/me");
        setProfile(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handlePayment = async (settlement) => {
    try {
      const { data } = await axios.post("/payments/create-order", {
        amount: settlement.amount,
        settlementId: settlement._id,
      });

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: settlement.amount * 100,
        currency: "INR",
        name: "BillSplit Pro",
        description: `Settlement Payment to ${settlement.to}`,
        order_id: data.order.id,
        handler: async function (response) {
          await axios.post("/payments/verify", {
            ...response,
            settlementId: settlement._id,
          });

          setProfile((prev) => ({
            ...prev,
            settlements: prev.settlements.map((s) =>
              s._id === settlement._id ? { ...s, status: "Completed" } : s
            ),
          }));
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500 bg-gradient-to-br from-red-50 to-pink-50">
        Failed to load profile.
      </div>
    );
  }

  const { user: userData, settlements } = profile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 py-8 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-10"
      >
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-tr from-indigo-600 to-blue-500 text-white rounded-full flex items-center justify-center text-4xl sm:text-5xl font-bold shadow-xl">
            {userData.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-4">
            {userData.name}
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-1 flex items-center gap-1 flex-wrap justify-center">
            <FiMail /> {userData.email}
          </p>
        </div>

        {/* Divider */}
        <hr className="border-slate-200 mb-8" />

        {/* Settlements Section */}
        <div>
          <h3 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-6 flex items-center gap-2">
            <FiCreditCard className="text-indigo-600" /> My Settlements
          </h3>

          {settlements.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 sm:py-10 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-100 border border-green-200 shadow-inner"
            >
              <FiCheckCircle className="mx-auto text-4xl text-green-600 mb-3" />
              <p className="font-semibold text-lg text-green-700">
                All Settled Up 🎉
              </p>
              <p className="text-sm text-green-500 mt-1">
                You have no pending balances
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {settlements.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-4 sm:p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:justify-between sm:items-center border transition-all duration-200 ${
                    s.status === "Completed"
                      ? "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-green-200/70"
                      : "border-orange-200 bg-gradient-to-r from-yellow-50 to-orange-50 hover:shadow-orange-200/70"
                  }`}
                >
                  <div className="mb-3 sm:mb-0">
                    <p className="font-semibold text-slate-800 text-base sm:text-lg flex items-center gap-1">
                      <FiUser className="text-slate-500" />
                      {s.from} → {s.to}
                    </p>
                    <p
                      className={`text-sm mt-1 flex items-center gap-1 ${
                        s.status === "Completed"
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    >
                      {s.status === "Completed" ? (
                        <FiCheckCircle className="text-green-500" />
                      ) : (
                        <FiAlertCircle className="text-orange-500" />
                      )}
                      {s.status}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <span className="font-bold text-base sm:text-lg text-green-700 text-center sm:text-right">
                      ₹ {Number(s.amount).toFixed(2)}
                    </span>

                    {s.status !== "Completed" && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePayment(s)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all w-full sm:w-auto"
                      >
                        Pay
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
