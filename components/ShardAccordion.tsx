import React from 'react';
import { Accordion, Badge, Button, Card } from 'react-bootstrap';
import { ShardInfo } from '../lib/ShardInfo';

export interface ShardAccordionProps {
    shard: ShardInfo;
    revalidate: () => Promise<boolean>;
}
export default function Shard({ shard, revalidate }: ShardAccordionProps) {
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
                    <Button
                        variant="outline-warning"
                        className="spacer-top-margin"
                    >
                        Remove
                    </Button>
                </Card.Body>
            </Accordion.Collapse>
        </Card>
    );
}
