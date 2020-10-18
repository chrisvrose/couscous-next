import { Button, Col, Container, Jumbotron, Row } from 'react-bootstrap';
import Header from '../components/Header';
import styles from '../styles/index.module.css';

export default function Home() {
    return (
        <>
            <Header title="Home" activeKey="home" />
            <Container fluid="md">
                <Row>
                    <Col>
                        <Jumbotron>
                            <h1>Couscous</h1>
                            <p>
                                The web interface to the distributed FileSystem
                            </p>
                            <Button
                                href="https://github.com/chrisvrose/couscous-next"
                                variant="outline-primary"
                            >
                                Learn more
                            </Button>
                        </Jumbotron>
                    </Col>
                </Row>
                <div className={styles.needSpace}></div>
            </Container>
        </>
    );
}
