import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/Authcontext';
import { GroupProvider } from './context/GroupContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import GroupList from './pages/Dashboard/GroupList';
import GroupDetails from './pages/Dashboard/GroupDetails';
import Profile from './pages/Profile/Profile';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GroupProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <GroupList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/groups/:groupId"
              element={
                <ProtectedRoute>
                  <GroupDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </GroupProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
