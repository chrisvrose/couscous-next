import Router from 'next/router';
import { FormEvent, useContext, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import UserContext from '../lib/contexts/UserContext';

export default function UserSettings() {
    const [form, setForm] = useState({ pwd: '' });
    const [responseState, setResponseState] = useState<boolean>(null);
    const { userState, dispatch } = useContext(UserContext);
    const handleForm = (e: FormEvent<HTMLElement>) => {
        e.preventDefault();
        fetch('/api/user/password', {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify(form),
        })
            .then(response => {
                if (response.ok && response.status === 200) {
                    console.log('successful');
                    setResponseState(true);
                } else {
                    console.log('invalidated');
                    if (response?.status === 403) {
                        dispatch({ type: 'logout' });
                        Router.push('/');
                    } else {
                        setResponseState(false);
                        console.error('E> Arcane Error happened', response);
                    }
                }
            })
            .catch(err => {
                console.log('invalidated');
                if (err?.status === 403) {
                    dispatch({ type: 'logout' });
                    Router.push('/');
                } else {
                    setResponseState(false);
                    console.error('E> Arcane Error happened', err);
                }
            });
    };
    return (
        <>
            <h2>Change Password</h2>
            <Form onSubmit={handleForm}>
                <Form.Group>
                    <Form.Control
                        type="password"
                        placeholder="New Password"
                        onChange={e => {
                            setForm({ pwd: e.target.value });
                        }}
                    />
                </Form.Group>
                <Button variant="primary" type="submit">
                    Submit
                </Button>
                <Alert
                    variant="success"
                    show={responseState === true}
                    dismissible
                    onClose={() => setResponseState(null)}
                    className="spacer-top-margin"
                >
                    <Alert.Heading>Change Successful</Alert.Heading>
                    Changed Password successfully!
                </Alert>
                <Alert
                    variant="danger"
                    show={responseState === false}
                    dismissible
                    onClose={() => setResponseState(null)}
                    className="spacer-top-margin"
                >
                    <Alert.Heading>Change Failed</Alert.Heading>
                    Could not change password! Either there was a system error
                    or you do not have the necessary permissions to do so!
                </Alert>
            </Form>
        </>
    );
}
