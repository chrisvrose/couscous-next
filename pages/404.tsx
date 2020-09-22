import Link from 'next/link';
import { Col, Container, Row } from 'react-bootstrap';
import Header from '../components/Header';

export default function Error404() {
    return (
        <>
            <Header title="Not found" />
            <Container>
                <Row>
                    <Col>404</Col>
                </Row>
                <Row>
                    <Col md={6}>Page not found</Col>
                    <Col md={6}>
                        Go{' '}
                        <Link href="/">
                            <a>back</a>
                        </Link>{' '}
                        to safety.
                    </Col>
                </Row>
            </Container>
        </>
    );
}
