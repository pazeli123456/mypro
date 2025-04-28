import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import SubscriptionService from '../../api/subscriptionService';

// Async thunks
export const fetchAllSubscriptions = createAsyncThunk(
  'subscriptions/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await SubscriptionService.getAllSubscriptions();
    } catch (error) {
      return rejectWithValue(error.error || 'טעינת מנויים נכשלה');
    }
  }
);

export const fetchMemberSubscriptions = createAsyncThunk(
  'subscriptions/fetchMemberSubscriptions',
  async (memberId, { rejectWithValue }) => {
    try {
      return await SubscriptionService.getMemberSubscriptions(memberId);
    } catch (error) {
      return rejectWithValue(error.error || 'טעינת מנויים של החבר נכשלה');
    }
  }
);

export const fetchMemberWatchedMovies = createAsyncThunk(
  'subscriptions/fetchMemberWatchedMovies',
  async (memberId, { rejectWithValue }) => {
    try {
      return await SubscriptionService.getMemberWatchedMovies(memberId);
    } catch (error) {
      return rejectWithValue(error.error || 'טעינת סרטים שנצפו נכשלה');
    }
  }
);

export const fetchMovieWatchers = createAsyncThunk(
  'subscriptions/fetchMovieWatchers',
  async (movieId, { rejectWithValue }) => {
    try {
      return await SubscriptionService.getMovieWatchers(movieId);
    } catch (error) {
      return rejectWithValue(error.error || 'טעינת רשימת הצופים בסרט נכשלה');
    }
  }
);

export const createSubscription = createAsyncThunk(
  'subscriptions/create',
  async (subscriptionData, { rejectWithValue }) => {
    try {
      return await SubscriptionService.addMovieToMember(subscriptionData);
    } catch (error) {
      return rejectWithValue(error.error || 'הוספת צפייה בסרט נכשלה');
    }
  }
);

export const deleteSubscription = createAsyncThunk(
  'subscriptions/delete',
  async (id, { rejectWithValue }) => {
    try {
      await SubscriptionService.deleteSubscription(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.error || 'מחיקת המנוי נכשלה');
    }
  }
);

// Initial state
const initialState = {
  subscriptions: [],
  memberWatchedMovies: [],
  movieWatchers: [],
  isLoading: false,
  error: null
};

// Slice
const subscriptionSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all subscriptions
      .addCase(fetchAllSubscriptions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllSubscriptions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscriptions = action.payload;
      })
      .addCase(fetchAllSubscriptions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch member subscriptions
      .addCase(fetchMemberSubscriptions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMemberSubscriptions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscriptions = action.payload;
      })
      .addCase(fetchMemberSubscriptions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch member watched movies
      .addCase(fetchMemberWatchedMovies.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMemberWatchedMovies.fulfilled, (state, action) => {
        state.isLoading = false;
        state.memberWatchedMovies = action.payload;
      })
      .addCase(fetchMemberWatchedMovies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch movie watchers
      .addCase(fetchMovieWatchers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMovieWatchers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.movieWatchers = action.payload;
      })
      .addCase(fetchMovieWatchers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create subscription
      .addCase(createSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        // אם יש מנויים שכבר נטענו, הוסף את המנוי החדש למערך
        if (state.subscriptions.length > 0) {
          state.subscriptions.push(action.payload);
        }
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete subscription
      .addCase(deleteSubscription.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscriptions = state.subscriptions.filter(
          subscription => subscription._id !== action.payload
        );
      })
      .addCase(deleteSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = subscriptionSlice.actions;

export default subscriptionSlice.reducer; 