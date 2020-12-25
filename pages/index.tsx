import Link from 'next/link';
import React from 'react';
import { Button, Card, Col, Container, Jumbotron, Row } from 'react-bootstrap';
import Header from '../components/Header';

export default function Home() {
    return (
        <>
            <Header title="Home" activeKey="home" />
            <Container fluid="md">
                <Row>
                    <Col>
                        <Jumbotron className="card-1">
                            <h1>Couscous</h1>
                            <p>
                                The web interface to the distributed FileSystem
                            </p>
                            <Link href="/login" passHref>
                                <Button variant="primary">Login</Button>
                            </Link>
                        </Jumbotron>
                    </Col>
                </Row>

                {/* Content */}
                <Row>
                    <Col md="4">
                        <Card bg="light" className="card-1-hover">
                            <Card.Header>OSS</Card.Header>
                            <Card.Body>
                                <Card.Text>Engage in OSS</Card.Text>

                                <Button
                                    href="https://github.com/chrisvrose/couscous-next"
                                    variant="outline-primary"
                                >
                                    Learn more
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md="4">
                        <Card bg="light" className="card-1-hover">
                            <Card.Header>Browse</Card.Header>
                            <Card.Body>
                                <Card.Text>
                                    Browse the filesystem using the FUSE Driver
                                </Card.Text>

                                <Button
                                    href="https://github.com/chrisvrose/dbd-fuse"
                                    variant="outline-primary"
                                >
                                    Open
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md="4">
                        <Card bg="light" className="mb-2 card-1-hover">
                            {/* <Card.Img variant="top" src="holder.js/100px180" /> */}
                            <Card.Header>Documentation</Card.Header>
                            <Card.Body>
                                {/* <Card.Title>Card Title</Card.Title> */}
                                <Card.Text>
                                    Take a look at documentation to understand
                                    the working and setup.
                                </Card.Text>
                                <Button variant="primary">Go somewhere</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
}
