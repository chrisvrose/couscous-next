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
                <Row>
                    <Col md={{ span: 6, offset: 3 }}>
                        <ShardMenu />
                    </Col>
                </Row>
            </Container>
        </>
    );
}
