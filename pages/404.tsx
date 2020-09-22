import { Container } from 'react-bootstrap';
import Header from '../components/Header';

interface ErrorDesc {
    errorType?: string;
}

export default function Error404(props: ErrorDesc) {
    return (
        <>
            <Header title="Not found" />
            <Container>
                <div>This is an error</div>
                <div>{props?.errorType}</div>
            </Container>
        </>
    );
}
