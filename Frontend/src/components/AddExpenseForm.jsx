import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";

const AddExpenseForm = ({ groupId, onAdded }) => {
  const { register, handleSubmit, reset, watch } = useForm();
  const [members, setMembers] = useState([]);
  const [splitType, setSplitType] = useState("equal");
  const [splits, setSplits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    axios
      .get(`/groups/${groupId}`)
      .then((res) => {
        const m = res.data.group.members || [];
        setMembers(m);
        setSplits(m.map((mem) => ({ user: mem._id, share: 0 })));
      })
      .catch(() => {});
  }, [groupId]);

  const amount = watch("amount");

  useEffect(() => {
    if (splitType === "equal" && amount && members.length > 0) {
      const per = +(amount / members.length).toFixed(2);
      setSplits(members.map((m) => ({ user: m._id, share: per })));
    }
  }, [splitType, amount, members]);

  const handleShareChange = (uid, value) => {
    setSplits((prev) =>
      prev.map((s) => (s.user === uid ? { ...s, share: Number(value) } : s))
    );
  };

  const validatePercentage = () => {
    if (splitType === "percentage") {
      const total = splits.reduce((a, b) => a + (b.share), 0);
      if (Math.abs(total - 100) > 0.01) {
        setErrorMsg(`Total percentage must equal 100% (currently ${total}%)`);
        setShake(true);
        setTimeout(() => setShake(false), 500);
        return false;
      }
    }
    setErrorMsg("");
    return true;
  };

  const onSubmit = async (data) => {
    if (!validatePercentage()) return;

    setLoading(true);
    try {
      let finalSplits = splits;
      if (splitType === "percentage") {
      const totalPercent = splits.reduce((a, b) => a + Number(b.share), 0);
      if (Math.abs(totalPercent - 100) > 0.01) {
        alert("Total percentage must equal 100%");
        setLoading(false);
        return;
      }
      finalSplits = splits.map((s) => ({
        user: s.user,
        share: Number(s.share),
      }));
    }

      const payload = {
        title: data.title,
        amount: Number(data.amount),
        paidBy: data.paidBy,
        splitType,
        splits: finalSplits,
      };

      const res = await axios.post(`/groups/${groupId}/expenses`, payload);
      onAdded(res.data.expense);
      reset();
      setSplitType("equal");
      setErrorMsg("");
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className={`space-y-5 bg-white p-6 rounded-2xl shadow-lg border border-slate-200 ${
        shake ? "animate-shake" : ""
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Title */}
      <motion.div whileHover={{ scale: 1.01 }}>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Expense Title
        </label>
        <input
          {...register("title")}
          placeholder="e.g., Dinner"
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
          required
        />
      </motion.div>

      {/* Amount */}
      <motion.div whileHover={{ scale: 1.01 }}>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-slate-500 font-medium">
            ₹
          </span>
          <input
            {...register("amount")}
            type="number"
            step="0.01"
            placeholder="0.00"
            className="w-full pl-8 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
            required
          />
        </div>
      </motion.div>

      {/* Paid By */}
      <motion.div whileHover={{ scale: 1.01 }}>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Paid By
        </label>
        <select
          {...register("paidBy")}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 transition-all"
          required
        >
          <option value="">Select member...</option>
          {members.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Split Type */}
      <motion.div whileHover={{ scale: 1.01 }}>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Split Type
        </label>
        <select
          value={splitType}
          onChange={(e) => setSplitType(e.target.value)}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 transition-all"
        >
          <option value="equal">Equal Split</option>
          <option value="custom">Custom Split</option>
          <option value="percentage">Percentage Split</option>
        </select>
      </motion.div>

      {/* Dynamic Split Inputs */}
      <AnimatePresence>
        {splitType !== "equal" && (
          <motion.div
            className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm font-medium text-slate-600 mb-2">
              Distribute{" "}
              {splitType === "custom" ? "amount" : "percentage"} among members:
            </p>
            {members.map((m) => (
              <motion.div
                key={m._id}
                className="flex justify-between items-center gap-2"
                whileHover={{ scale: 1.02 }}
              >
                <span className="font-medium text-slate-700">{m.name}</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder={splitType === "custom" ? "₹ 0.00" : "%"}
                  value={splits.find((s) => s.user === m._id)?.share || ""}
                  onChange={(e) => handleShareChange(m._id, e.target.value)}
                  className={`w-28 text-right px-3 py-1.5 border rounded-md focus:ring-2 transition-all ${
                    errorMsg && splitType === "percentage"
                      ? "border-red-400 focus:ring-red-400"
                      : "border-slate-300 focus:ring-blue-500"
                  }`}
                  required
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            className="text-red-600 text-sm font-medium bg-red-50 border border-red-200 rounded-md p-2 text-center"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            ⚠️ {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <motion.button
        type="submit"
        whileTap={{ scale: 0.97 }}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg font-medium shadow-md hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Adding Expense..." : "Add Expense"}
      </motion.button>
    </motion.form>
  );
};

export default AddExpenseForm;
