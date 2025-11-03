import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { FiCheckCircle, FiRefreshCw } from "react-icons/fi";
import toast from "react-hot-toast";
import useSocket from "../hooks/useSocket";

function Settlements({ groupId }) {
  const [data, setData] = useState({ settlements: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const res = await axios.get(`/groups/${groupId}/settlements`);
      setData(res.data);
    } catch (err) {
      console.error("Error fetching settlements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [groupId]);

  // Real-time update via socket
  useSocket(
    groupId,
    null,
    (settlement) => {
      toast.success(`${settlement.settledBy?.name || 'Someone'} settled up! 💰`);
      setData((prev) => ({
        settlements: prev.settlements.map((s) =>
          s._id === settlement._id ? { ...s, status: settlement.status } : s
        ),
      }));
    }
  );

  // Poll every 10 seconds (fallback)
  useEffect(() => {
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [groupId]);

  const markAsSettled = async (id) => {
    try {
      await axios.patch(`/settlements/${id}/markPaid`);
      setData((prev) => ({
        settlements: prev.settlements.map((s) =>
          s._id === id ? { ...s, status: "Completed" } : s
        ),
      }));
      toast.success("Settlement marked as completed 💰");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark as settled");
    }
  };

  if (loading)
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 animate-pulse">
        <div className="h-6 bg-slate-100 w-32 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-10 bg-slate-100 rounded-lg"></div>
          <div className="h-10 bg-slate-100 rounded-lg w-5/6"></div>
          <div className="h-10 bg-slate-100 rounded-lg w-2/3"></div>
        </div>
      </div>
    );

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 transition-all hover:shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <FiCheckCircle className="text-green-500" /> Settlements
        </h3>
        <button
          onClick={fetchData}
          className={`flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 transition ${loading ? "animate-spin pointer-events-none opacity-50" : ""
            }`}
          title="Refresh"
        >
          <FiRefreshCw />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {data.settlements.length === 0 ? (
        <div className="text-center py-8 text-green-600 transition-all">
          <FiCheckCircle className="mx-auto text-3xl mb-2 animate-bounce" />
          <p className="font-medium">All settled up!</p>
          <p className="text-sm text-green-400 mt-1">No pending settlements</p>
        </div>
      ) : (
        <div className="space-y-3 animate-fadeIn">
          {data.settlements.map((s) => (
            <div
              key={s._id}
              className={`p-3 rounded-lg border flex justify-between items-center transition-transform hover:scale-[1.02] ${s.status === "Completed"
                  ? "bg-green-50 border-green-200"
                  : "bg-slate-50 border-slate-200"
                }`}
            >
              <div>
                <p className="text-sm text-slate-700">
                  <span className="font-semibold text-slate-800">{s.from}</span> →{" "}
                  <span className="font-semibold text-slate-800">{s.to}</span>
                </p>
                <p
                  className={`text-xs font-medium mt-1 ${s.status === "Completed" ? "text-green-600" : "text-orange-500"
                    }`}
                >
                  {s.status}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-600 font-bold">₹ {s.amount}</span>
                {s.status === "Pending" && (
                  <button
                    onClick={() => markAsSettled(s._id)}
                    className="relative overflow-hidden px-3 py-1 text-sm cursor-pointer 
             bg-green-600 text-white rounded-md 
             hover:bg-green-700 active:scale-95 
             transition-all duration-200 
             focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1
             group"
                  >
                    <span className="relative z-10">Paid</span>
                    {/* Ripple-like pulse effect */}
                    <span
                      className="absolute inset-0 bg-green-500 opacity-0 group-active:animate-ping rounded-md"
                    ></span>
                  </button>

                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Settlements;
