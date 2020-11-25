import React from 'react';
import { Accordion, Button, Card } from 'react-bootstrap';
import { UserElement } from '../lib/types/Users';

interface UserListProps {
    data: UserElement;
    doRefresh: () => Promise<any>;
}
export default function UserListComponent({ data, doRefresh }: UserListProps) {
    return (
        <Card>
            <Card.Header>
                <Accordion.Toggle
                    as={Button}
                    variant="link"
                    eventKey={data.uid.toString()}
                >
                    {data.email}
                </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey={data.uid.toString()}>
                <Card.Body>{data.role ? 'Admin' : 'User'}</Card.Body>
            </Accordion.Collapse>
        </Card>
    );
}
