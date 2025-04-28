import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { RootState } from '../store';

// Collection interface
export interface ICollection {
  _id: string;
  name: string;
  owner: string;
  type: string;
  visibility: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Slice state
export interface CollectionState {
  items: ICollection[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CollectionState = {
  items: [],
  status: 'idle',
  error: null
};

// Async thunks
export const fetchCollections = createAsyncThunk<ICollection[], void, { rejectValue: string }>(
  'collections/fetchCollections',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get<ICollection[]>('/api/collections');
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const createCollection = createAsyncThunk<
  ICollection,
  { name: string; type?: string; visibility?: string; description?: string },
  { rejectValue: string }
>(
  'collections/createCollection',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post<ICollection>('/api/collections', payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateCollection = createAsyncThunk<
  ICollection,
  { id: string; name?: string; type?: string; visibility?: string; description?: string },
  { rejectValue: string }
>(
  'collections/updateCollection',
  async ({ id, ...updates }, { rejectWithValue }) => {
    try {
      const response = await axios.put<ICollection>(`/api/collections/${id}`, updates);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteCollection = createAsyncThunk<string, string, { rejectValue: string }>(
  'collections/deleteCollection',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/collections/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Slice
const collectionSlice = createSlice({
  name: 'collections',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchCollections.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCollections.fulfilled, (state, action: PayloadAction<ICollection[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCollections.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message || 'Fetch failed';
      })
      .addCase(createCollection.fulfilled, (state, action: PayloadAction<ICollection>) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateCollection.fulfilled, (state, action: PayloadAction<ICollection>) => {
        const idx = state.items.findIndex(c => c._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteCollection.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.filter(c => c._id !== action.payload);
      });
  }
});

export default collectionSlice.reducer;

// Selectors
export const selectAllCollections = (state: RootState) => state.collections.items;
export const selectCollectionsStatus = (state: RootState) => state.collections.status;
export const selectCollectionsError = (state: RootState) => state.collections.error; 