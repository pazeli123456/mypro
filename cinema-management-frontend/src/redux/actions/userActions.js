const initialState = {
    user: null,
    loading: false,
    error: null
};

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_USER':
            return {
                ...state,
                user: action.payload,
                loading: false,
                error: null
            };

        case 'LOGOUT_USER':
            localStorage.clear();
            return {
                ...state,
                user: null,
                loading: false,
                error: null
            };

        case 'SET_USER_ERROR':
            return {
                ...state,
                error: action.payload
            };

        case 'SET_USER_LOADING':
            return {
                ...state,
                loading: action.payload
            };

        default:
            return state;
    }
};

// Selectors
export const selectUser = (state) => state.user.user;
export const selectUserError = (state) => state.user.error;
export const selectUserLoading = (state) => state.user.loading;

// Action Creators
export const setUser = (user) => ({
    type: 'SET_USER',
    payload: user
});

export const logoutUser = () => ({
    type: 'LOGOUT_USER'
});

export const setUserError = (error) => ({
    type: 'SET_USER_ERROR',
    payload: error
});

export const setUserLoading = (loading) => ({
    type: 'SET_USER_LOADING',
    payload: loading
});

export default userReducer;
