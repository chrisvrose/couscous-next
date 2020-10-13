import { Context, createContext, Dispatch, Reducer } from 'react';

export default createContext(null) as Context<UserMemo>;

export interface UserState {
    isLoggedIn: boolean;
}

export interface UserAction {
    type: 'login' | 'logout' | string;
    payload?: any;
}

export interface UserMemo {
    userState: UserState;
    dispatch: Dispatch<UserAction>;
}

export const stateReducer: Reducer<UserState, UserAction> = (state, action) => {
    switch (action.type) {
        case 'login':
            return { ...state, isLoggedIn: true };
        case 'logout':
            return { ...state, isLoggedIn: false };
        default:
            return state;
    }
};

export const initialState: UserState = {
    isLoggedIn: false,
};
