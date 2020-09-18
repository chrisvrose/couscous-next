import { Container } from 'react-bootstrap';
import Header from '../components/Header'

export default function Error404({ extra: string }) {
    return (
        <>
            <Header title="Not found"/>
            <Container>
                <div>This is an error</div>
            </Container>
        </>
    )
}