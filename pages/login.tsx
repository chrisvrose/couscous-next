import { Col, Container, Row } from 'react-bootstrap';
import Header from '../components/Header';

export default function Home() {
    return (
        <>
            <Header title="Login" activeKey="login" />
            <Container fluid="md">
                <Row>
                    <Col md={4}>This is a column!</Col>
                    <Col md={6}>This is another column</Col>
                </Row>
            </Container>
        </>
    );
}
