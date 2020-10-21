import React, { useContext } from 'react';
import { Col, Container, Jumbotron, Row } from 'react-bootstrap';
import useSWR from 'swr';
import Header from '../components/Header';
import UserSettings from '../components/UserSettings';
import UserContext from '../lib/contexts/UserContext';
import { fetcher } from '../lib/fetcher';
import { UserDetails } from '../lib/mysql/User';

export function UserInfo() {
    const { userState } = useContext(UserContext);
    const { data, error, mutate } = useSWR<UserDetails, { status: number }>(
        '/api/user/current',
        fetcher,
        {
            refreshInterval: 100,
            refreshWhenHidden: false,
            revalidateOnFocus: true,
        }
    );
    if (error) {
        return (
            <Jumbotron>
                <h2>You aren't even logged in!</h2>
            </Jumbotron>
        );
    }
    if (!data) {
        return (
            <Jumbotron>
                <h2>Loading!</h2>
            </Jumbotron>
        );
    } else {
        return (
            <Jumbotron>
                <h2>{data.name}</h2>
                Email - {data.email}
            </Jumbotron>
        );
    }
}

export default function Dashboard() {
    const { userState } = useContext(UserContext);

    return (
        <>
            <Header title="User Profile" activeKey="userpage" />
            <Container fluid="md">
                <Row>
                    <Col md={{ span: 8, offset: 2 }}>
                        <UserInfo />
                    </Col>
                    <Col md={{ span: 8, offset: 2 }}>
                        <UserSettings />
                    </Col>
                </Row>
            </Container>
        </>
    );
}
