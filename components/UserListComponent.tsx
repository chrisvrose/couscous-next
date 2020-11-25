import React from 'react';
import { Accordion, Card } from 'react-bootstrap';
import { UserElement } from '../lib/types/Users';

interface UserListProps {
    data: UserElement;
    doRefresh: () => Promise<any>;
}
export default function UserListComponent({ data, doRefresh }: UserListProps) {
    return (
        <Card>
            <Accordion.Toggle
                as={Card.Header}
                variant="link"
                eventKey={data.uid.toString()}
            >
                {data.email}
            </Accordion.Toggle>
            <Accordion.Collapse eventKey={data.uid.toString()}>
                <Card.Body>{data.role ? 'Admin' : 'User'}</Card.Body>
            </Accordion.Collapse>
        </Card>
    );
}
