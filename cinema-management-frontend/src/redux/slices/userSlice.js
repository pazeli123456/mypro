import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import UserService from '../../api/userService';

// Async thunks
export const fetchAllUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await UserService.getAllUsers();
    } catch (error) {
      return rejectWithValue(error.error || 'טעינת משתמשים נכשלה');
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'users/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return await UserService.getUserById(id);
    } catch (error) {
      return rejectWithValue(error.error || 'טעינת משתמש נכשלה');
    }
  }
);

export const createUser = createAsyncThunk(
  'users/create',
  async (userData, { rejectWithValue }) => {
    try {
      return await UserService.createUser(userData);
    } catch (error) {
      return rejectWithValue(error.error || 'יצירת משתמש נכשלה');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      return await UserService.updateUser(id, userData);
    } catch (error) {
      return rejectWithValue(error.error || 'עדכון משתמש נכשל');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/delete',
  async (id, { rejectWithValue }) => {
    try {
      await UserService.deleteUser(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.error || 'מחיקת משתמש נכשלה');
    }
  }
);

export const fetchUserPermissions = createAsyncThunk(
  'users/fetchPermissions',
  async (id, { rejectWithValue }) => {
    try {
      return await UserService.getUserPermissions(id);
    } catch (error) {
      return rejectWithValue(error.error || 'טעינת הרשאות משתמש נכשלה');
    }
  }
);

export const updateUserPermissions = createAsyncThunk(
  'users/updatePermissions',
  async ({ id, permissions }, { rejectWithValue }) => {
    try {
      return await UserService.updateUserPermissions(id, permissions);
    } catch (error) {
      return rejectWithValue(error.error || 'עדכון הרשאות משתמש נכשל');
    }
  }
);

// Initial state
const initialState = {
  users: [],
  currentUser: null,
  currentUserPermissions: [],
  isLoading: false,
  error: null
};

// Slice
const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
      state.currentUserPermissions = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all users
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch user by ID
      .addCase(fetchUserById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create user
      .addCase(createUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = state.users.filter(user => user._id !== action.payload);
        if (state.currentUser && state.currentUser._id === action.payload) {
          state.currentUser = null;
          state.currentUserPermissions = [];
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch user permissions
      .addCase(fetchUserPermissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserPermissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUserPermissions = action.payload;
      })
      .addCase(fetchUserPermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update user permissions
      .addCase(updateUserPermissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserPermissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUserPermissions = action.payload;
      })
      .addCase(updateUserPermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearCurrentUser } = userSlice.actions;

export default userSlice.reducer; 