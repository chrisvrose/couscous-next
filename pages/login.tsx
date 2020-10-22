import Router from 'next/router';
import { ChangeEvent, FormEvent, useContext, useState } from 'react';
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap';
import Header from '../components/Header';
import UserContext from '../lib/contexts/UserContext';

interface formData {
    email: string;
    pwd: string;
}

export default function Home() {
    const { userState, dispatch: userDispatch } = useContext(UserContext);
    const [form, setForm] = useState<formData>({
        email: '',
        pwd: '',
    });
    const [errorState, setErrorState] = useState<boolean>(false);

    async function onFormSubmit(event: FormEvent) {
        event.preventDefault();
        // setPwd(event.target.)
        try {
            const res = await fetch('/api/auth/login', {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
                method: 'POST',
            });
            if (!res.ok) {
                throw 'expected response';
            }

            const resjson = await res.json();

            if (!resjson.ok) {
                throw 'expected response to be ok';
            }
            //console.assert(resjson.ok, 'expected login ok');

            console.log('Login>We are in ;)');
            userDispatch({ type: 'login' });
            Router.push('/');
        } catch (e) {
            setErrorState(true);
            console.error(e);
        }
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
                    <Col md={{ span: 6, offset: 3 }}>
                        <Container fluid style={{ textAlign: 'center' }}>
                            <h2>Login Portal</h2>
                        </Container>
                        <Form
                            onSubmit={onFormSubmit}
                            className="spacer-top-margin"
                        >
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
                            <Button variant="primary" type="submit">
                                Submit
                            </Button>
                        </Form>
                        <Alert
                            variant="danger"
                            show={errorState}
                            dismissible
                            onClose={() => setErrorState(false)}
                            className="spacer-top-margin"
                        >
                            <Alert.Heading>Login Failed</Alert.Heading>
                            Please check if you are online and have entered the
                            correct credentials.
                        </Alert>
                    </Col>
                </Row>
            </Container>
        </>
    );
}
