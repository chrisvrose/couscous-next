import { Container } from 'react-bootstrap';
import Header from '../components/Header';

export default function Home() {
  return (
    <>
      <Header title="Home" activeKey='home'/>
      <Container fluid="md">
        
        
          Hi!
      
      </Container>
    </>
  )
}
