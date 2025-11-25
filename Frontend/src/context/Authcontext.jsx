import { createContext, useReducer, useEffect } from 'react'
import axios from '../api/axiosInstance'

export const AuthContext = createContext();

const initialState = { user: null, token: null, loading: true, error: null };

const reducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN': return { ...state, user: action.payload.user, token: action.payload.token, loading: false, error: null };
        case 'LOGOUT': return { ...state, user: null, token: null, loading: false, error: null };
        case 'AUTH_ERROR': return { ...state, user: null, token: null, loading: false, error: action.payload };
        case 'UPDATE_USER': return { ...state, user: { ...state.user, ...action.payload } };
        case 'STOP_LOADING': return { ...state, loading: false };
        default: return state;
    }
}

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.get('/users/me').then(res => {
                dispatch({ type: 'LOGIN', payload: { user: res.data.user, token } });
            }).catch(() => dispatch({ type: 'STOP_LOADING' }));
        }
        else {
            dispatch({ type: 'STOP_LOADING' });
        }
    }, []);

    const login = (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        dispatch({ type: 'LOGIN', payload: data });
    };

    const logout = () => {
        localStorage.removeItem('token');
        dispatch({ type: 'LOGOUT' });
    }

    const updateUser = (updatedFields) => {
        dispatch({ type: "UPDATE_USER", payload: updatedFields });
        const saved = JSON.parse(localStorage.getItem("user")) || {};
        const newUser = { ...saved, ...updatedFields };
        localStorage.setItem("user", JSON.stringify(newUser));
    };

    return (
        <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    )
}