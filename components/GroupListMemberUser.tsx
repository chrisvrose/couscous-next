import React from 'react';
import { Accordion, Button, Card } from 'react-bootstrap';
import { UserElement } from '../lib/types/Users';

/**
 * Data and update
 */
interface UserListProps {
    data: UserElement;
    gid: number;
    doRefresh: () => Promise<any>;
}

export default function GroupListMemberUser({
    data,
    gid,
    doRefresh,
}: UserListProps) {
    const removeUser = () => {
        console.log(
            'Sending',
            JSON.stringify({
                uid: data.uid,
                gid,
            })
        );
        fetch('/api/group/kick', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                uid: data.uid,
                gid,
            }),
        })
            .then(res => doRefresh())
            .catch(e => {
                console.warn('W', e);
            });
    };
    return (
        <Card>
            <Accordion.Toggle
                as={Card.Header}
                variant="link"
                eventKey={data.uid.toString()}
            >
                {data.name}
            </Accordion.Toggle>
            <Accordion.Collapse eventKey={data.uid.toString()}>
                <Card.Body>
                    <div>Name - {data.name}</div>
                    <div>Email - {data.email}</div>
                    <div>Role - {data.role ? 'Admin' : 'User'}</div>
                    <Button variant="warning" onClick={removeUser}>
                        Kick User
                    </Button>
                </Card.Body>
            </Accordion.Collapse>
        </Card>
    );
}
