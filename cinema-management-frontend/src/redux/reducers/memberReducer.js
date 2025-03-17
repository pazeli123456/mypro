// src/redux/reducers/memberReducer.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    members: [],
    loading: false,
    error: null,
    selectedMember: null,
    membersWithSubscriptions: {}, // מידע משולב של חברים והמנויים שלהם
    filters: {
        search: '',
        city: ''
    }
};

const memberSlice = createSlice({
    name: 'members',
    initialState,
    reducers: {
        // טעינת חברים
        fetchMembersStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchMembersSuccess: (state, action) => {
            state.loading = false;
            state.members = action.payload;
        },
        fetchMembersFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // הוספת חבר חדש
        addMember: (state, action) => {
            state.members.push(action.payload);
            state.membersWithSubscriptions[action.payload._id] = {
                ...action.payload,
                subscriptions: []
            };
        },

        // עדכון חבר קיים
        updateMember: (state, action) => {
            const index = state.members.findIndex(member => member._id === action.payload._id);
            if (index !== -1) {
                state.members[index] = action.payload;
                // שמירה על המנויים הקיימים בעת עדכון החבר
                state.membersWithSubscriptions[action.payload._id] = {
                    ...action.payload,
                    subscriptions: state.membersWithSubscriptions[action.payload._id]?.subscriptions || []
                };
            }
        },

        // מחיקת חבר
        deleteMember: (state, action) => {
            state.members = state.members.filter(member => member._id !== action.payload);
            delete state.membersWithSubscriptions[action.payload];
        },

        // הוספת/עדכון מידע על מנויי החבר
        updateMemberSubscriptions: (state, action) => {
            const { memberId, subscriptions } = action.payload;
            if (state.membersWithSubscriptions[memberId]) {
                state.membersWithSubscriptions[memberId].subscriptions = subscriptions;
            } else {
                const member = state.members.find(m => m._id === memberId);
                if (member) {
                    state.membersWithSubscriptions[memberId] = {
                        ...member,
                        subscriptions
                    };
                }
            }
        },

        // בחירת חבר ספציפי
        setSelectedMember: (state, action) => {
            state.selectedMember = action.payload;
        },

        // עדכון פילטרים
        setFilters: (state, action) => {
            state.filters = {
                ...state.filters,
                ...action.payload
            };
        },

        // איפוס הסטייט
        resetMembers: () => initialState
    }
});

// ייצוא האקשנים
export const {
    fetchMembersStart,
    fetchMembersSuccess,
    fetchMembersFailure,
    addMember,
    updateMember,
    deleteMember,
    updateMemberSubscriptions,
    setSelectedMember,
    setFilters,
    resetMembers
} = memberSlice.actions;

// Selectors
export const selectAllMembers = (state) => state.members.members;
export const selectMemberLoading = (state) => state.members.loading;
export const selectMemberError = (state) => state.members.error;
export const selectSelectedMember = (state) => state.members.selectedMember;
export const selectMemberWithSubscriptions = (memberId) => 
    (state) => state.members.membersWithSubscriptions[memberId];
export const selectMemberFilters = (state) => state.members.filters;

export default memberSlice.reducer;