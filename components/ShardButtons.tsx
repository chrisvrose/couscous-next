import React, { useContext, useState } from 'react';
import { Alert, Button, ButtonGroup, Form, Modal } from 'react-bootstrap';
import UserContext from '../lib/contexts/UserContext';

export interface ShardButtonsProps {
    className?: string;
    revalidate: () => Promise<boolean>;
}

export default function ShardButtons(props: ShardButtonsProps) {
    const { userState, dispatch: userDispatch } = useContext(UserContext);

    const [show, setShow] = useState(false);
    const [formData, setFormData] = useState({ loc: '' });
    //status -
    const [submitResult, setSubmit] = useState<boolean>(null);
    const handleClose = () => setShow(false);
    const handleOpenAdd = () => {
        setSubmit(null);
        setFormData({ loc: '' });
        setShow(true);
    };
    const handleSubmit = async () => {
        console.log('I', 'Submit');
        try {
            const res = await fetch('/api/addShard', {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                method: 'POST',
            });
            console.assert(res.ok, 'E> Could not add shard');
            const resjson: { ok: boolean; shard?: any } = await res.json();
            if (resjson.ok) {
                setSubmit(true);
                await props.revalidate();
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
                    <Modal.Header closeButton>
                        <Modal.Title>Add Shard</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Control
                            placeholder="Shard location"
                            onChange={e => setFormData({ loc: e.target.value })}
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
                        <Button variant="primary" onClick={handleSubmit}>
                            Submit
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    } else {
        return <></>;
    }
}
