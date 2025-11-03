import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AddExpenseForm from "./AddExpenseForm";
import axios from "../api/axiosInstance";
import { FiPlus, FiUsers, FiX } from "react-icons/fi";

const AddExpenseModal = ({ groupId, onAdded }) => {
  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [members, setMembers] = useState([]);

  // 👀 Show hint only once
  useEffect(() => {
    const seen = localStorage.getItem("hasSeenAddExpenseHint");
    if (!seen) {
      setShowHint(true);
      const timer = setTimeout(() => setShowHint(false), 60000);
      return () => clearTimeout(timer);
    }
  }, []);

  // 📥 Fetch members when modal opens
  useEffect(() => {
    if (open) {
      axios
        .get(`/groups/${groupId}`)
        .then((res) => setMembers(res.data.group.members || []))
        .catch(() => setMembers([]));
    }
  }, [open, groupId]);

  const handleClick = () => {
    if (showHint) {
      localStorage.setItem("hasSeenAddExpenseHint", "true");
      setShowHint(false);
    }
    setOpen(true);
  };

  return (
    <>
      {/* Floating Add Button + Hint */}
      <motion.div
        className="fixed bottom-6 right-6 flex flex-col items-center group z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* Onboarding Hint */}
        <AnimatePresence>
          {showHint && (
            <motion.div
              className="bg-blue-600 text-white text-sm px-3 py-2 rounded-lg mb-2 shadow-md"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: [0, -3, 0] }}
              exit={{ opacity: 0, y: -10 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "mirror",
              }}
            >
              Tap to add your first expense 💸
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tooltip */}
        <span className="opacity-0 group-hover:opacity-100 transition bg-gray-800 text-white text-xs py-1 px-2 rounded-md shadow-md mb-9">
          Add Expense
        </span>

        {/* Floating Add Button */}
        <motion.button
          animate={{ y: [0, -50, 0] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleClick}
          className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full p-4 shadow-lg hover:shadow-2xl transition-all"
        >
          {showHint && (
            <motion.div
              className="absolute inset-0 rounded-full bg-blue-400 opacity-40"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.4, 0, 0.4],
              }}
              transition={{
                repeat: Infinity,
                duration: 2,
              }}
            />
          )}
          <FiPlus className="text-2xl relative z-10" />
        </motion.button>
      </motion.div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-full max-w-md relative"
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {/* Close Button */}
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-red-500 transition-transform hover:rotate-90"
              >
                <FiX size={20} />
              </button>

              {/* Header */}
              <div className="flex flex-col items-center gap-2 mb-5">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FiUsers className="text-blue-600 text-2xl" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
                  Add New Expense
                </h2>
                <p className="text-gray-500 text-sm">
                  Split expenses easily with your group.
                </p>
              </div>

              {/* Conditional: if less than 2 members */}
              {members.length <= 1 ? (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="text-center py-10 relative overflow-hidden"
                >
                  {/* Floating glow background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-100 via-white to-transparent opacity-60 rounded-xl"
                    animate={{
                      opacity: [0.5, 0.8, 0.5],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 3,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Animated Icon */}
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "mirror",
                    }}
                  >
                    <FiUsers className="mx-auto text-5xl text-blue-600 mb-4" />
                  </motion.div>

                  {/* Texts */}
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-lg font-semibold text-gray-800 mb-2"
                  >
                    Not Enough Members 😅
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-gray-600 mb-1"
                  >
                    You need at least <strong>2 members</strong> in your group to add an expense.
                  </motion.p>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="text-sm text-gray-500 mt-2"
                  >
                    Go to the <span className="font-medium">Members</span> tab and add one more friend first!
                  </motion.p>
                </motion.div>
              ) : (
                <AddExpenseForm
                  groupId={groupId}
                  onAdded={(expense) => {
                    onAdded(expense);
                    setOpen(false);
                  }}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AddExpenseModal;
