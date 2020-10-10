import { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import UserContext from '../lib/contexts/UserContext';
import '../styles/globals.scss';

function MyApp({ Component, pageProps }: AppProps) {
    const [userState, setUserState] = useState(() => {
        return {
            isLoggedIn: false,
        };
    });

    useEffect(() => {
        fetch('/api/authtest', {
            method: 'POST',
        })
            .then(e => {
                // console.log(e);
                if (e.ok && e.status === 200) {
                    setUserState({ ...userState, isLoggedIn: true });
                } else {
                    if (e.status === 403) {
                        setUserState({ ...userState, isLoggedIn: false });
                    } else {
                        console.error('E>Not normal response', e);
                        setUserState({ ...userState, isLoggedIn: false });
                    }
                }
            })
            .catch(rej => {
                console.error('E>Failed to fetch user', rej);
            });
    }, []);

    return (
        <UserContext.Provider value={[userState, setUserState]}>
            <Component {...pageProps} />
        </UserContext.Provider>
    );
}

export default MyApp;
