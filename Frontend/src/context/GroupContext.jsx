import { createContext, useReducer, useEffect, useContext } from 'react';
import axios from '../api/axiosInstance';
import { AuthContext } from './Authcontext';
import useSocket from '../hooks/useSocket';

// --------------------------------------------------
// Initial State & Reducer
// --------------------------------------------------

const initialState = {
  groups: [],
  currentGroup: null,
  loading: false,
  error: null,
};

function groupReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: true };
    case 'SET_GROUPS':
      return { ...state, groups: action.payload, loading: false };
    case 'SET_CURRENT_GROUP':
      return { ...state, currentGroup: action.payload, loading: false };
    case 'ADD_GROUP':
      return { ...state, groups: [...state.groups, action.payload], loading: false };
    case 'UPDATE_GROUP':
      return {
        ...state,
        groups: state.groups.map((g) =>
          g._id === action.payload._id ? action.payload : g
        ),
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

export const GroupContext = createContext();

// --------------------------------------------------
// Provider Component
// --------------------------------------------------

export const GroupProvider = ({ children }) => {
  const [state, dispatch] = useReducer(groupReducer, initialState);
  const { user, loading: authLoading } = useContext(AuthContext);

  // --------------------------------------------------
  // API Actions
  // --------------------------------------------------

  const setCurrentGroup = (group) => {
  dispatch({ type: 'SET_CURRENT_GROUP', payload: group });
};

  const fetchGroups = async () => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const res = await axios.get('/groups');
      dispatch({ type: 'SET_GROUPS', payload: res.data.groups });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message || err.message });
    }
  };

  const fetchGroupDetails = async (groupId) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const res = await axios.get(`/groups/${groupId}`);
      dispatch({ type: 'SET_CURRENT_GROUP', payload: res.data.group });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message || err.message });
    }
  };

  const createGroup = async (data) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const res = await axios.post('/groups', data);
      dispatch({ type: 'ADD_GROUP', payload: res.data.group });
      return res.data.group;
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message || err.message });
      throw err;
    }
  };

  // --------------------------------------------------
  // Real-time Socket Updates (Socket.io)
  // --------------------------------------------------

  useSocket(
    user?._id, // Optional: could also be 'global' socket
    (data) => {
      if (data.type === 'GROUP_UPDATED') {
        dispatch({ type: 'UPDATE_GROUP', payload: data.group });
      }
    }
  );

  // --------------------------------------------------
  // Auto-Fetch User Groups when logged in
  // --------------------------------------------------

  useEffect(() => {
    if (!authLoading && user) fetchGroups();
  }, [authLoading,user]);

  // --------------------------------------------------
  // Return Provider
  // --------------------------------------------------

  return (
    <GroupContext.Provider
      value={{
        ...state,
        fetchGroups,
        fetchGroupDetails,
        createGroup,
        setCurrentGroup,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};
