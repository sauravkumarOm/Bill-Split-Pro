import React from 'react';
import { FiUser, FiCalendar } from "react-icons/fi"

const ExpenseCard = ({ expense }) => {

  const formattedDate = new Date(expense.date || expense.createdAt).toLocaleString("eng-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const formattedAmount = `₹${Number(expense.amount).toLocaleString("en-IN")}`;

  return (
    <div
      className="bg-gradient-to-br from-[#A9E34B] to-[#83CC09] rounded-2xl text-black
               shadow-md border border-gray-200 cursor-pointer
               hover:-translate-y-2 hover:traslate-x-2 hover:shadow-2xl hover:scale-[1.01]
               transition-all duration-300 ease-in-out
               p-5 flex justify-between items-start"
    >
      {/* Left Section */}
      <div className="space-y-1.5">
        <h3 className="text-lg font-semibold text-gray-900 leading-snug">
          {expense.title || expense.description || "Untitled Expense"}
        </h3>

        <div className="flex items-center text-black text-xs">
          <FiCalendar className="mr-1.5 text-black" />
          {formattedDate}
        </div>

        <div className="flex items-center text-sm text-black mt-1">
          <FiUser className="mr-1 text-[#5209CC]" />
          Paid by{" "}
          <span className="font-medium text-gray-900 ml-1">
            {expense.paidBy?.name || "Unknown"}
          </span>
        </div>
      </div>

      {/* Right Section (Amount) */}
      <div className="text-right">
        <span
          className="text-lg font-bold text-blue-700 bg-blue-100 px-3 py-1.5 
                   rounded-lg shadow-inner hover:bg-blue-200 transition-all duration-300"
        >
          {formattedAmount}
        </span>
      </div>
    </div>
  );

};

export default ExpenseCard;
