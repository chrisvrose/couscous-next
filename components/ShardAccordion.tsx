import React from 'react';
import { Accordion, Alert, Badge, Button, Card } from 'react-bootstrap';
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
