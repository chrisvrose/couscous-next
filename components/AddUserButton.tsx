import React, { useContext, useState } from 'react';
import { Alert, Button, ButtonGroup, Form, Modal } from 'react-bootstrap';
import UserContext from '../lib/contexts/UserContext';

export interface UserButtonProps {
    className?: string;
    doRevalidate: () => Promise<any>;
}

export default function AddUserButton(props: UserButtonProps) {
    const { userState } = useContext(UserContext);

    const [show, setShow] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        pwd: '',
        role: false,
    });
    //status -
    const [submitResult, setSubmit] = useState<boolean>(null);
    const handleClose = () => setShow(false);
    const handleOpenAdd = () => {
        setSubmit(null);
        setFormData({ email: '', name: '', pwd: '', role: false });
        setShow(true);
    };
    const handleSubmit = async (event: React.FormEvent<HTMLElement>) => {
        event.preventDefault();
        try {
            const res = await fetch('/api/user/add', {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                method: 'POST',
            });
            console.assert(res.ok, 'E> Could not add user');
            const resjson: { ok: boolean } = await res.json();
            if (resjson.ok) {
                setSubmit(true);
                await props.doRevalidate();
            } else {
                throw String('Error');
            }
        } catch (e) {
            setSubmit(false);
        }
    };

    if (userState.isLoggedIn) {
        return (
            <>
                <ButtonGroup aria-label="Buttons" className={props.className}>
                    <Button onClick={handleOpenAdd}>Add</Button>
                </ButtonGroup>
                <Modal show={show} onHide={handleClose}>
                    <Form onSubmit={handleSubmit}>
                        <Modal.Header closeButton>
                            <Modal.Title>Add Shard</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form.Control
                                placeholder="Name"
                                className="spacer-top-margin"
                                onChange={e =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                            />
                            <Form.Control
                                className="spacer-top-margin"
                                placeholder="Email"
                                type="email"
                                onChange={e =>
                                    setFormData({
                                        ...formData,
                                        email: e.target.value,
                                    })
                                }
                            />
                            <Form.Control
                                className="spacer-top-margin"
                                placeholder="Password"
                                type="password"
                                onChange={e =>
                                    setFormData({
                                        ...formData,
                                        pwd: e.target.value,
                                    })
                                }
                            />
                            <Form.Check
                                className="spacer-top-margin"
                                type="checkbox"
                                label="Is Admin"
                                onChange={e =>
                                    setFormData({
                                        ...formData,
                                        role: e.target.checked,
                                    })
                                }
                            ></Form.Check>
                            <Alert
                                show={submitResult !== null}
                                variant={submitResult ? 'success' : 'danger'}
                            >
                                {submitResult ? 'Success' : 'Could not added'}
                            </Alert>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleClose}>
                                Close
                            </Button>
                            <Button variant="primary" type="submit">
                                Submit
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal>
            </>
        );
    } else {
        return <></>;
    }
}
