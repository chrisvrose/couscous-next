import { AppProps } from 'next/app';
import { useEffect, useMemo, useReducer } from 'react';
import UserContext, {
    initialState as userInitialState,
    stateReducer as userStateReducer,
} from '../lib/contexts/UserContext';
import '../styles/globals.scss';

function MyApp({ Component, pageProps }: AppProps) {
    const [userState, dispatch] = useReducer(
        userStateReducer,
        userInitialState
    );

    //memoize the values into a single object
    const providerValue = useMemo(() => ({ userState, dispatch }), [
        userState,
        dispatch,
    ]);

    useEffect(() => {
        fetch('/api/authtest', {
            method: 'POST',
        })
            .then(e => {
                if (e.ok && e.status === 200) {
                    dispatch({ type: 'login' });
                } else {
                    if (e.status === 403) {
                        dispatch({ type: 'login' });
                    } else {
                        console.error('E>Not normal response', e);
                        dispatch({ type: 'logout' });
                    }
                }
            })
            .catch(rej => {
                console.error('E>Failed to fetch user', rej);
            });
    }, []);

    return (
        <UserContext.Provider value={providerValue}>
            <Component {...pageProps} />
        </UserContext.Provider>
    );
}

export default MyApp;
