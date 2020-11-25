import React, { useState } from 'react';
import { Accordion, Button, Card, Spinner } from 'react-bootstrap';
import { UserElement } from '../lib/types/Users';

interface UserListProps {
    data: UserElement;
    doRefresh: () => Promise<any>;
}
export default function UserListComponent({ data, doRefresh }: UserListProps) {
    const [updating, setUpdating] = useState(false);
    const handleSubmit = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
        if (!updating) {
            setUpdating(true);
            fetch('/api/user/setRole', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ uid: data.uid, role: 1 - data.role }),
            })
                .then(result => {
                    return doRefresh();
                })
                .then(res => {
                    setUpdating(false);
                })
                .catch(err => {
                    setUpdating(false);
                });
        }
    };

    console.log(data.role);
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
                <Card.Body>
                    <div>Name - {data.name}</div>
                    <div>Email - {data.email}</div>
                    <div>Role - {data.role ? 'Admin' : 'User'}</div>
                    <h5 className="spacer-top-margin">Change options</h5>
                    <Button variant="outline-warning" onClick={handleSubmit}>
                        {updating && (
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                            />
                        )}
                        Make {data.role ? 'User' : 'Admin'}
                    </Button>
                </Card.Body>
            </Accordion.Collapse>
        </Card>
    );
}
