import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { GroupContext } from '../../context/GroupContext';
import axios from '../../api/axiosInstance';
import ExpenseCard from '../../components/ExpenseCard';
import Navbar from '../../components/NavBar';
import useSocket from '../../hooks/useSocket';
import { FiPlus, FiUsers, FiDollarSign, FiCheckCircle, FiX } from 'react-icons/fi';
import Settlements from '../../components/Settlement';
import AddExpenseForm from '../../components/AddExpenseForm';
import { AnimatePresence, motion } from "framer-motion";
import AddExpenseModal from '../../components/AddExpenseModal';

const GroupDetails = () => {
  const { groupId } = useParams();
  const { fetchGroupDetails, currentGroup, setCurrentGroup } = useContext(GroupContext);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const loadGroup = async () => {
      const res = await axios.get(`/groups/${groupId}`);
      setCurrentGroup(res.data.group);
      setExpenses(res.data.group.expenses || []);
    };
    loadGroup();
  }, [groupId])

  useEffect(() => {
    if (currentGroup) setExpenses(currentGroup.expenses || []);
  }, [currentGroup]);

  // Socket for real-time updates
  useSocket(
    groupId,
    (expense) => setExpenses((prev) => [...prev, expense]),
    (settlement) => console.log('Settlement update:', settlement),
    () => fetchGroupDetails(groupId),
    (member) => setCurrentGroup((prev) => ({
      ...prev,
      members: [...prev.members, member],
    }))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 text-center lg:text-left">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            {currentGroup?.name || 'Group'}
          </h1>
          <p className="text-slate-600 text-lg">Manage your group expenses & settlements seamlessly</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Expenses */}
          <div className="flex-1">
            <div className="bg-[#5209cc] rounded-2xl shadow-lg border border-slate-200 p-6 mb-6 transition-all hover:shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                  Expenses
                </h2>
                <span className="px-4 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                  {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
                </span>
              </div>

              {expenses.length === 0 ? (
                <div className="text-center py-12 text-black">
                  <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center transition-all ease-in-out animate-bounce">
                    <div className='text-black text-3xl'>₹</div>
                  </div>
                  <p className="text-lg font-medium">No expenses yet</p>
                  <p className="text-sm mt-1 text-white">Start by adding your first expense</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <ExpenseList expenses={expenses} />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-96 space-y-6">
            {/* Add Expense */}
            <AddExpenseModal groupId={groupId} onAdded={(e) => setExpenses(prev => [e, ...prev])} />

            {/* Add Member */}
            <AddMember groupId={groupId} />

            {/* Settlements */}
            <Settlements groupId={groupId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;

// Sub-components with improved UI


function AddMember({ groupId }) {
  const { currentGroup, setCurrentGroup } = useContext(GroupContext);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState(null); // success or error popup

  const handleAdd = async () => {
    if (!email.trim()) {
      setPopup({ type: "error", message: "Please enter an email." });
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`/groups/${groupId}/members`, { email });
      setCurrentGroup(res.data.group);
      setEmail("");

      // ✅ Show success popup
      setPopup({ type: "success", message: "Member added successfully!" });

      // Auto hide after 3 seconds
      setTimeout(() => setPopup(null), 3000);
    } catch (err) {
      setPopup({
        type: "error",
        message: err.response?.data?.error || "Failed to add member.",
      });
      setTimeout(() => setPopup(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 transition-all hover:shadow-2xl">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FiUsers className="text-purple-500" /> Add Member
        </h3>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="member@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAdd()}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 transition-all"
          />

          <button
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2.5 rounded-lg font-medium shadow-md hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50"
            onClick={handleAdd}
            disabled={loading}
          >
            {loading ? "Adding Member..." : "Add Member"}
          </button>

          {/* Members List */}
          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Members ({currentGroup?.members.length || 0})
            </p>
            <div className="flex flex-wrap gap-2">
              {currentGroup?.members.map((m, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full border border-slate-200"
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  {m.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Popup Notification */}
      <AnimatePresence>
        {popup && (
          <motion.div
            key="popup"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={`fixed bottom-6 right-6 px-5 py-3 rounded-lg shadow-lg z-50 text-white font-medium 
              ${popup.type === "success" ? "bg-green-600" : "bg-red-600"}`}
          >
            {popup.type === "success" ? (
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-white" />
                {popup.message}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <FiX className="text-white" />
                {popup.message}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


const ExpenseList = ({ expenses }) => {
  const [visibleCount, setVisibleCount] = useState(7);
  const [sortedExpenses, setSortedExpenses] = useState([]);

  // Sort expenses newest first whenever updated
  useEffect(() => {
    const sorted = [...expenses].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    setSortedExpenses(sorted);
  }, [expenses]);

  const showMore = () => {
    setVisibleCount((prev) => prev + 7);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 mt-4">
      {/* Visible expenses */}
      {sortedExpenses.slice(0, visibleCount).map((expense, index) => (
        <motion.div
          key={expense._id || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <ExpenseCard expense={expense} />
        </motion.div>
      ))}

      {/* Show More Button */}
      {visibleCount < sortedExpenses.length && (
        <div className="flex justify-center mt-4">
          <button
            onClick={showMore}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-all"
          >
            Show More
          </button>
        </div>
      )}
    </div>
  );
};
