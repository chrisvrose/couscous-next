import React, { useContext, useState } from 'react';
import { Alert, Button, ButtonGroup, Form, Modal } from 'react-bootstrap';
import UserContext from '../lib/contexts/UserContext';

export interface InviteButtonProps {
    className?: string;
    gid: number;
    doRevalidate: () => Promise<any>;
}

export default function InviteUserToGroupButton(props: InviteButtonProps) {
    const { userState } = useContext(UserContext);

    const [show, setShow] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
    });
    //status -
    const [submitResult, setSubmit] = useState<boolean>(null);
    const handleClose = () => setShow(false);
    const handleOpenAdd = () => {
        setSubmit(null);
        setFormData({ email: '' });
        setShow(true);
    };
    const handleSubmit = async (event: React.FormEvent<HTMLElement>) => {
        event.preventDefault();
        try {
            const uidres = await fetch('/api/user/toUID', {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                method: 'POST',
            });
            console.assert(uidres.ok, 'E> Could not add user');
            const uidresjson: {
                ok: boolean;
                uid?: number;
            } = await uidres.json();

            // hack - throw an error if not an integer
            const uid = parseInt(uidresjson.uid as any);

            const res = await fetch('/api/group/invite', {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid,
                    gid: props.gid,
                }),
                method: 'POST',
            });
            if (uidresjson.ok && !isNaN(uid)) {
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
                    <Button onClick={handleOpenAdd} variant="outline-primary">
                        Add
                    </Button>
                </ButtonGroup>
                <Modal show={show} onHide={handleClose}>
                    <Form onSubmit={handleSubmit}>
                        <Modal.Header closeButton>
                            <Modal.Title>Add User to Group</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
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
