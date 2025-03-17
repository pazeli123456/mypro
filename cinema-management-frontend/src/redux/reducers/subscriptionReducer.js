// src/redux/reducers/subscriptionReducer.js
import { createSlice } from '@reduxjs/toolkit';
import {
    fetchAllSubscriptions,
    createSubscription,
    editSubscription,
    removeSubscription,
    addMovieToMember
} from '../actions/mainActions';

const initialState = {
    subscriptions: [],
    memberSubscriptions: {},
    loading: false,
    error: null,
    currentSubscription: null
};

const subscriptionSlice = createSlice({
    name: 'subscriptions',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCurrentSubscription: (state, action) => {
            state.currentSubscription = action.payload;
        },
        clearCurrentSubscription: (state) => {
            state.currentSubscription = null;
        }
    },
    extraReducers: (builder) => {
        // Fetch All
        builder.addCase(fetchAllSubscriptions.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchAllSubscriptions.fulfilled, (state, action) => {
            state.loading = false;
            state.subscriptions = action.payload;
        });
        builder.addCase(fetchAllSubscriptions.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Create
        builder.addCase(createSubscription.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(createSubscription.fulfilled, (state, action) => {
            state.loading = false;
            state.subscriptions.push(action.payload);
            if (action.payload.memberId) {
                if (!state.memberSubscriptions[action.payload.memberId]) {
                    state.memberSubscriptions[action.payload.memberId] = [];
                }
                state.memberSubscriptions[action.payload.memberId].push(action.payload);
            }
        });
        builder.addCase(createSubscription.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Edit
        builder.addCase(editSubscription.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(editSubscription.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.subscriptions.findIndex(sub => sub._id === action.payload._id);
            if (index !== -1) {
                state.subscriptions[index] = action.payload;
            }
            if (action.payload.memberId) {
                state.memberSubscriptions[action.payload.memberId] = 
                    state.memberSubscriptions[action.payload.memberId]?.map(sub => 
                        sub._id === action.payload._id ? action.payload : sub
                    ) || [];
            }
            state.currentSubscription = action.payload;
        });
        builder.addCase(editSubscription.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Remove
        builder.addCase(removeSubscription.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(removeSubscription.fulfilled, (state, action) => {
            state.loading = false;
            state.subscriptions = state.subscriptions.filter(sub => sub._id !== action.payload);
            // Clear from memberSubscriptions
            Object.keys(state.memberSubscriptions).forEach(memberId => {
                state.memberSubscriptions[memberId] = 
                    state.memberSubscriptions[memberId].filter(sub => sub._id !== action.payload);
            });
            if (state.currentSubscription?._id === action.payload) {
                state.currentSubscription = null;
            }
        });
        builder.addCase(removeSubscription.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Add Movie to Member
        builder.addCase(addMovieToMember.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(addMovieToMember.fulfilled, (state, action) => {
            state.loading = false;
            if (action.payload.memberId) {
                if (!state.memberSubscriptions[action.payload.memberId]) {
                    state.memberSubscriptions[action.payload.memberId] = [];
                }
                state.memberSubscriptions[action.payload.memberId].push(action.payload);
            }
        });
        builder.addCase(addMovieToMember.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    }
});

// Selectors
export const selectAllSubscriptions = state => state.subscriptions.subscriptions;
export const selectSubscriptionLoading = state => state.subscriptions.loading;
export const selectSubscriptionError = state => state.subscriptions.error;
export const selectCurrentSubscription = state => state.subscriptions.currentSubscription;
export const selectMemberSubscriptions = (state, memberId) => 
    state.subscriptions.memberSubscriptions[memberId] || [];

export const { clearError, setCurrentSubscription, clearCurrentSubscription } = subscriptionSlice.actions;

export default subscriptionSlice.reducer;