import { FormEvent, useState } from 'react';
import { Button, Form } from 'react-bootstrap';

export default function UserSettings() {
    const [form, setForm] = useState({ pwd: '' });
    const handleForm = (e: FormEvent<HTMLElement>) => {};
    return (
        <>
            <h2>User Config</h2>
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
            </Form>
        </>
    );
}
