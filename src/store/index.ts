import {configureStore, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {useDispatch, useSelector, TypedUseSelectorHook} from 'react-redux';

interface AuthState {
  isLoading: boolean;
  token: string | null;
  user: any | null;
}

const initialState: AuthState = {
  isLoading: true,
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    loginSuccess: (state, action: PayloadAction<{token: string; user: any}>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isLoading = false;
    },
    logout: state => {
      state.token = null;
      state.user = null;
    },
  },
});

export const {setLoading, loginSuccess, logout} = authSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
