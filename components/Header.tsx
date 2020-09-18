import Link from 'next/link';
import Head from 'next/head';
// import {useRouter} from 'next/router';
import { Nav, NavItem, Navbar, NavbarBrand } from 'react-bootstrap';

export interface HeaderProps {
    title: string,
    activeKey?: 'home'|'login'
}

export default function Header(props: HeaderProps) {

    return (
        <>
            <Head>
                <title>{props.title}</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Navbar bg='dark' expand='md' sticky='top' variant='dark'>
                <Navbar.Brand>Couscous</Navbar.Brand>
                <Navbar.Collapse>
                    <Nav activeKey={props.activeKey}>
                        <Link href='/' passHref><Nav.Link eventKey='home'>Home</Nav.Link></Link>
                        <Link href='/login' passHref><Nav.Link eventKey='login'>Login</Nav.Link></Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        </>
    );
}
