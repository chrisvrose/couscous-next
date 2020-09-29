import {
    ChangeEvent,
    Dispatch,
    FormEvent,
    SetStateAction,
    useState,
} from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import Header from '../components/Header';

interface formData {
    email: string;
    pwd: string;
}

export default function Home() {
    const [form, setForm] = useState({
        email: '',
        pwd: '',
    }) as [formData, Dispatch<SetStateAction<formData>>];

    async function onFormSubmit(event: FormEvent) {
        event.preventDefault();
        // setPwd(event.target.)
        const res = await fetch('/api/auth/login', {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
            method: 'POST',
        });
        const resjson = await res.json();
        console.log(resjson);
    }

    async function onFormChange(event: ChangeEvent<HTMLInputElement>) {
        setForm({
            ...form,
            [event.target.name]: event.target.value,
        });
    }
    return (
        <>
            <Header title="Login" activeKey="login" />
            <Container fluid="md">
                <Row>
                    <Col md={4}>This is a column!</Col>
                    <Col md={6}>
                        <Form onSubmit={onFormSubmit}>
                            <Form.Group controlId="formBasicEmail">
                                <Form.Label>Email address</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter email"
                                    name="email"
                                    onChange={onFormChange}
                                />
                                <Form.Text className="text-muted">
                                    We'll never share your email with anyone
                                    else.
                                </Form.Text>
                            </Form.Group>

                            <Form.Group controlId="formBasicPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Password"
                                    onChange={onFormChange}
                                    name="pwd"
                                />
                            </Form.Group>
                            <Form.Group controlId="formBasicCheckbox">
                                <Form.Check
                                    type="checkbox"
                                    label="Check me out"
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit">
                                Submit
                            </Button>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </>
    );
}
