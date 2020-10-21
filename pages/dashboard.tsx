import React, { useContext } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import Header from '../components/Header';
import ShardMenu from '../components/ShardList';
import UserContext from '../lib/contexts/UserContext';

export default function Dashboard() {
    const { userState } = useContext(UserContext);

    return (
        <>
            <Header title="Dashboard" activeKey="dashboard" />
            <Container fluid="md">
                <Row md={8}>
                    <Col md={{ span: 8, offset: 2 }}>
                        <ShardMenu />
                    </Col>
                </Row>
            </Container>
        </>
    );
}
