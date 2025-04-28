import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import MemberService from '../../api/memberService';

// Async thunks
export const fetchAllMembers = createAsyncThunk(
  'members/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await MemberService.getAllMembers();
    } catch (error) {
      return rejectWithValue(error.error || 'טעינת חברים נכשלה');
    }
  }
);

export const fetchMemberById = createAsyncThunk(
  'members/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return await MemberService.getMemberById(id);
    } catch (error) {
      return rejectWithValue(error.error || 'טעינת חבר נכשלה');
    }
  }
);

export const createMember = createAsyncThunk(
  'members/create',
  async (memberData, { rejectWithValue }) => {
    try {
      return await MemberService.createMember(memberData);
    } catch (error) {
      return rejectWithValue(error.error || 'יצירת חבר נכשלה');
    }
  }
);

export const updateMember = createAsyncThunk(
  'members/update',
  async ({ id, memberData }, { rejectWithValue }) => {
    try {
      return await MemberService.updateMember(id, memberData);
    } catch (error) {
      return rejectWithValue(error.error || 'עדכון חבר נכשל');
    }
  }
);

export const deleteMember = createAsyncThunk(
  'members/delete',
  async (id, { rejectWithValue }) => {
    try {
      await MemberService.deleteMember(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.error || 'מחיקת חבר נכשלה');
    }
  }
);

// Initial state
const initialState = {
  members: [],
  currentMember: null,
  isLoading: false,
  error: null
};

// Slice
const memberSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentMember: (state) => {
      state.currentMember = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all members
      .addCase(fetchAllMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.members = action.payload;
      })
      .addCase(fetchAllMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch member by ID
      .addCase(fetchMemberById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMemberById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMember = action.payload;
      })
      .addCase(fetchMemberById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create member
      .addCase(createMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.members.push(action.payload);
      })
      .addCase(createMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update member
      .addCase(updateMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentMember = action.payload;
        const index = state.members.findIndex(member => member._id === action.payload._id);
        if (index !== -1) {
          state.members[index] = action.payload;
        }
      })
      .addCase(updateMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete member
      .addCase(deleteMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.members = state.members.filter(member => member._id !== action.payload);
        if (state.currentMember && state.currentMember._id === action.payload) {
          state.currentMember = null;
        }
      })
      .addCase(deleteMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearCurrentMember } = memberSlice.actions;

export default memberSlice.reducer; 