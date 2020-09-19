import { Container,Row, Col } from 'react-bootstrap';
import Header from '../components/Header';
import styles from '../styles/index.module.css';

export default function Home() {
  return (
    <>
      <Header title="Home" activeKey='home'/>
      <Container fluid="md">
        <Row>
          <Col>Hi!</Col>
        </Row>
        <div className={styles.needSpace}></div>
      </Container>
    </>
  )
}
