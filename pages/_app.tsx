import { AppProps } from 'next/app';
import { useState } from 'react';
import UserContext from '../lib/contexts/user';
import '../styles/globals.scss';

function MyApp({ Component, pageProps }: AppProps) {
    const [userState, setUserState] = useState(() => {
        return {
            logintoken: null,
        };
    });

    return (
        <UserContext.Provider value={[userState, setUserState]}>
            <Component {...pageProps} />
        </UserContext.Provider>
    );
}

export default MyApp;
