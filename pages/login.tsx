import { Container } from 'react-bootstrap';

import Header from '../components/Header';

export default function Home() {
  return (
    <>
      <Header title="Login" activeKey='login'/>
      <Container fluid="md">
        
        <main>
          This is a login page
        </main>
      </Container>
    </>
  )
}
