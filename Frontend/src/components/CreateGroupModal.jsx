import { useState } from "react";
import { FiPlus, FiX, FiUsers } from "react-icons/fi";

const CreateGroupModal = ({ onCreate }) => {
  const [name, setName] = useState("");
  const [show, setShow] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onCreate({ name });
    setShow(false);
    setName("");
  };

  return (
    <>
      {/* Create Group Button */}
      <button
        onClick={() => setShow(true)}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-medium 
        bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md hover:shadow-xl 
        hover:scale-[1.05] active:scale-95 transition-all duration-200"
      >
        <FiPlus className="text-lg" />
        Create Group
      </button>

      {/* Modal */}
      {show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
          <div
            className="relative bg-gradient-to-br from-white/90 to-blue-50/90 border border-white/30 
            shadow-2xl rounded-3xl p-8 w-[90%] max-w-md animate-popIn"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShow(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 hover:rotate-90 transition-transform duration-200"
            >
              <FiX size={22} />
            </button>

            {/* Header */}
            <div className="flex flex-col items-center gap-2 mb-6">
              <div className="p-3 bg-blue-100 rounded-full">
                <FiUsers className="text-blue-600 text-2xl" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 tracking-tight">
                Create New Group
              </h2>
              <p className="text-gray-500 text-sm text-center">
                Give your group a name and start collaborating.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="relative mb-6">
                <input
                  type="text"
                  id="groupName"
                  placeholder="Enter group name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none 
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white/80 text-gray-800 
                    placeholder-gray-400 transition-all duration-200"
                  required
                />


              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShow(false)}
                  className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-lg 
                  hover:bg-gray-200 transition-all duration-150"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium 
                  rounded-lg shadow-md hover:shadow-xl hover:brightness-110 active:scale-95 
                  transition-all duration-200"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateGroupModal;
