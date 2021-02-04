import React, { FC, useContext, useState } from 'react';
import { Alert, Button, ButtonGroup, Form, Modal } from 'react-bootstrap';
import UserContext from '../lib/contexts/UserContext';
import { GroupListResponse } from '../lib/types/Group';

export interface ShardButtonsProps {
    className?: string;
    doRevalidate: () => Promise<GroupListResponse>;
}

/**
 * shard button
 * @param props props
 */
const AddGroupButton: FC<ShardButtonsProps> = function AddGroup(props) {
    const { userState } = useContext(UserContext);

    const [show, setShow] = useState(false);
    const [formData, setFormData] = useState({ name: '' });
    //status -
    const [submitResult, setSubmit] = useState<boolean>(null);
    const handleClose = () => setShow(false);
    const handleOpenAdd = () => {
        setSubmit(null);
        setFormData({ name: '' });
        setShow(true);
    };
    const handleSubmit = async () => {
        try {
            const res = await fetch('/api/group/add', {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                method: 'POST',
            });
            console.assert(res.ok, 'E> Could not add shard');
            const resjson: { ok: boolean; shard?: any } = await res.json();
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
                    <Modal.Header closeButton>
                        <Modal.Title>Add Group</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Control
                            placeholder="Group name"
                            onChange={e =>
                                setFormData({ name: e.target.value })
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
};
export default AddGroupButton;
