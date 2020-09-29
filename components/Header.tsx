import Head from 'next/head';
import Link from 'next/link';
import { useContext, useEffect } from 'react';
// import {useRouter} from 'next/router';
import { Nav, Navbar } from 'react-bootstrap';
import UserContext from '../lib/contexts/user';
export interface HeaderProps {
    title: string;
    activeKey?: 'home' | 'login' | 'dashboard' | string;
}

export default function Header(props: HeaderProps) {
    const [token, setToken] = useContext(UserContext);
    useEffect(() => {
        console.log(token);
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
                className="card-1 justify-content-center"
            >
                <Navbar.Brand>Couscous</Navbar.Brand>
                <Navbar.Toggle aria-controls="navbar-toggleable" />
                <Navbar.Collapse id="navbar-toggleable">
                    <Nav activeKey={props.activeKey} className="mr-auto">
                        <Link href="/" passHref>
                            <Nav.Link eventKey="home">Home</Nav.Link>
                        </Link>
                        <Link href="/dashboard" passHref>
                            <Nav.Link eventKey="dashboard">Dashboard</Nav.Link>
                        </Link>
                        <Link href="/login" passHref>
                            <Nav.Link eventKey="login">Login</Nav.Link>
                        </Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        </>
    );
}
