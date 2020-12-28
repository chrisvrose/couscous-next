import React, { useState } from 'react';
import { Accordion, Alert, Badge, Button, Card, Modal } from 'react-bootstrap';
import { GetShardsResponse, ShardInfo } from '../lib/ShardInfo';

export interface ShardAccordionProps {
    shard: ShardInfo;
    doRevalidate: () => Promise<GetShardsResponse>;
    isDisabled?: boolean;
}
export default function Shard({
    shard,
    isDisabled,
    doRevalidate,
}: ShardAccordionProps) {
    const [modalShow, setModalShow] = useState(false);
    const [modalTextData, setModalTextData] = useState({
        state: '',
        remaining: 0,
    });
    const setModalState = (newstate: boolean) => () => setModalShow(newstate);

    const handleRemove = async () => {
        const doc = { loc: shard.host };
        try {
            const res = await fetch('/api/deleteShard', {
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(doc),
                method: 'POST',
            });
            console.assert(res.ok, 'E> Could not delete shard');
            const resjson: { ok: boolean; shard?: any } = await res.json();
            if (resjson.ok) {
                setModalTextData({
                    state: resjson.shard.state,
                    remaining: resjson.shard.remaining?.chunks ?? 0,
                });
                setModalShow(true);
                doRevalidate();
            } else {
                throw String('Error');
            }
        } catch (e) {
            console.log('E> Could not delete shard');
        }
    };

    return (
        <Card key={shard.host}>
            <Accordion.Toggle
                eventKey={shard.host}
                as={Card.Header}
                variant="link"
                className="card-1-hover"
            >
                {shard.host}
            </Accordion.Toggle>
            <Modal show={modalShow} onHide={setModalState(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Modal heading</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    State: {modalTextData.state}
                    <br />
                    {modalTextData.remaining > 0 &&
                        `Remaining: ${modalTextData.remaining}`}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={setModalState(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <Accordion.Collapse eventKey={shard.host}>
                <Card.Body>
                    State:{' '}
                    {shard.state >= 1 ? (
                        <Badge variant="success">ON</Badge>
                    ) : (
                        <Badge variant="warning">OFF</Badge>
                    )}
                    <br />
                    {shard.draining ? (
                        <Alert variant="danger" className="spacer-top-margin">
                            Draining
                        </Alert>
                    ) : (
                        <></>
                    )}
                    <Button
                        variant="outline-warning"
                        className="spacer-top-margin"
                        disabled={isDisabled === true}
                        onClick={handleRemove}
                    >
                        Remove
                    </Button>
                </Card.Body>
            </Accordion.Collapse>
        </Card>
    );
}
