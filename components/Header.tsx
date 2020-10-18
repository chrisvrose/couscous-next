import Head from 'next/head';
import Link from 'next/link';
import { MouseEvent, useContext, useEffect } from 'react';
// import {useRouter} from 'next/router';
import { Nav, Navbar } from 'react-bootstrap';
import UserContext, { UserMemo } from '../lib/contexts/UserContext';
export interface HeaderProps {
    title: string;
    activeKey?: 'home' | 'login' | 'dashboard' | string;
}

const handleLogin = ({ userState, dispatch }: UserMemo) => (
    event: MouseEvent<HTMLAnchorElement, globalThis.MouseEvent>
) => {
    event.preventDefault();
    fetch('/api/auth/logout')
        .then(response => {
            if (response.ok && response.status === 200) {
                dispatch({ type: 'logout' });
            }
        })
        .catch(e => {
            // we were never logged in to begin with :)
            if (e?.status === 403) {
                dispatch({ type: 'logout' });
            }
            console.error('E>Could not logout', e);
        });
};

const loginState = (userMemo: UserMemo, activeKey?: string) => {
    console.log('Debug', userMemo.userState.isLoggedIn);
    if (!userMemo.userState.isLoggedIn)
        return (
            <Nav activeKey={activeKey}>
                <Link href="/login" passHref>
                    <Nav.Link eventKey="login">Login</Nav.Link>
                </Link>
            </Nav>
        );
    else
        return (
            <Nav activeKey={activeKey}>
                <Nav.Link eventKey="logout" onClick={handleLogin(userMemo)}>
                    Logout
                </Nav.Link>
            </Nav>
        );
};

export default function Header(props: HeaderProps) {
    const userMemo = useContext(UserContext);
    useEffect(() => {
        console.log(userMemo.userState);
    });
    return (
        <>
            <Head>
                <title>{props.title}</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Navbar
                bg="dark"
                expand="md"
                fixed="top"
                variant="dark"
                className="card-1"
            >
                <Navbar.Brand>Couscous</Navbar.Brand>
                <Navbar.Toggle aria-controls="navbar-toggleable" />
                <Navbar.Collapse id="navbar-toggleable">
                    <Nav
                        activeKey={props.activeKey}
                        className="justify-content-end mr-auto"
                    >
                        <Link href="/" passHref>
                            <Nav.Link eventKey="home">Home</Nav.Link>
                        </Link>
                        {userMemo.userState.isLoggedIn ? (
                            <Link href="/dashboard" passHref>
                                <Nav.Link eventKey="dashboard">
                                    Dashboard
                                </Nav.Link>
                            </Link>
                        ) : (
                            <></>
                        )}
                    </Nav>
                    {loginState(userMemo, props.activeKey)}
                </Navbar.Collapse>
            </Navbar>
        </>
    );
}
