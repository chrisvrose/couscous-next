import { Container, Row, Col } from 'react-bootstrap';

import Header from '../components/Header';

export default function Dashboard() {
  return (
    <>
      <Header title="Dashboard" activeKey='login'/>
      <Container fluid="md">
        
        <Row>
          <Col md={4}>This is a column!</Col>
          <Col md={6}>This is another column</Col>
        </Row>
      </Container>
    </>
  )
}
