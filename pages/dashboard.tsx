import Router from 'next/router';
import React, { useContext, useEffect } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import Header from '../components/Header';
import ShardMenu from '../components/ShardList';
import UserContext from '../lib/contexts/UserContext';

export default function Dashboard() {
    const { userState } = useContext(UserContext);
    useEffect(() => {
        // console.log('Dashboard', props, userState);
        if (!userState.isLoggedIn) {
            Router.push('/');
        }
    });
    return (
        <>
            <Header title="Dashboard" activeKey="dashboard" />
            <Container fluid="md">
                <Row>
                    <Col md={4}>This is a column!</Col>
                    <Col md={6}>
                        <ShardMenu />
                    </Col>
                </Row>
            </Container>
        </>
    );
}
