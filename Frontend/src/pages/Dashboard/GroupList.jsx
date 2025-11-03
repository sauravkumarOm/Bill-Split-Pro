import { useContext, useEffect } from "react";
import { GroupContext } from "../../context/GroupContext";
import CreateGroupModal from "../../components/CreateGroupModal";
import { Link } from "react-router-dom";
import Navbar from "../../components/NavBar";
import { FiUsers, FiArrowRight, FiFolderPlus } from "react-icons/fi";

const GroupList = () => {
  const { groups, fetchGroups, loading, createGroup } = useContext(GroupContext);

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (data) => {
    await createGroup(data);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
        {/* Floating gradient orbs for background depth */}
        <div className="absolute w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-40 top-10 left-[-150px] animate-pulse" />
        <div className="absolute w-80 h-80 bg-indigo-200 rounded-full blur-3xl opacity-40 bottom-10 right-[-100px] animate-pulse" />

        <div className="relative container mx-auto px-4 py-12 z-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-6">
            <div>
              <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">
                💸 Manage Your <span className="text-blue-600">Groups</span>
              </h2>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">
                Create and manage your expense groups with ease.
              </p>
            </div>
            <CreateGroupModal onCreate={handleCreateGroup} />
          </div>

          {/* Group Grid */}
          {loading ? (
            <div className="text-center py-24">
              <div className="w-14 h-14 mx-auto border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-medium text-lg">Loading your groups...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-500">
              <div className="bg-gradient-to-r from-blue-200 to-indigo-200 p-6 rounded-full mb-4 shadow-md">
                <FiFolderPlus className="text-5xl text-blue-700 animate-bounce" />
              </div>
              <p className="text-lg font-semibold text-gray-700">No Groups Yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Start by creating a new group to split and manage expenses easily.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {groups.map((g) => (
                <div
                  key={g._id}
                  className="group relative backdrop-blur-md bg-white/80 border border-gray-100 rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 p-6 overflow-hidden"
                >
                  {/* Soft light overlay on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-blue-50/50 to-indigo-100/30 transition-all rounded-2xl"></div>

                  {/* Decorative gradient line */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 rounded-t-2xl"></div>

                  <div className="relative flex flex-col justify-between h-full z-10">
                    {/* Group Info */}
                    <div>
                      <h3 className="text-xl font-bold text-center text-gray-800 mb-1 tracking-tight group-hover:text-blue-600 transition-colors">
                        {g.name}
                      </h3>
                      <div className="flex items-center text-gray-500 text-sm gap-1">
                        <FiUsers className="text-blue-500" />
                        <span>{g.members?.length || 0} members</span>
                      </div>
                    </div>

                    {/* Open Button */}
                    <Link
                      to={`/groups/${g._id}`}
                      className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:scale-[1.03] transition-all duration-200"
                    >
                      Open Group
                      <FiArrowRight className="text-white group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GroupList;
