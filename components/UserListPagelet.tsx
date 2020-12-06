import React, { useContext } from 'react';
import { Accordion, Col, Row, Spinner } from 'react-bootstrap';
import useSWR from 'swr';
import UserContext from '../lib/contexts/UserContext';
import { fetcher, ResponseError } from '../lib/fetcher';
import { UserPageResponse } from '../lib/types/Users';
import AddUserButton from './AddUserButton';
import UserListComponent from './UserListComponent';

export default function UserListPagelet() {
    const { userState, dispatch: dispatchUser } = useContext(UserContext);
    const { data, error, mutate } = useSWR<UserPageResponse, ResponseError>(
        '/api/user/list',
        fetcher,
        {
            revalidateOnFocus: true,
            refreshInterval: 1000,
            shouldRetryOnError: false,
        }
    );
    const refreshData = async () => mutate(undefined, true);

    if (error) {
        return <></>;
    }
    if (!data) {
        return (
            <Row md={8}>
                <Col md={{ span: 8, offset: 2 }}>
                    <Spinner animation="border" role="status">
                        <span className="sr-only">Loading...</span>
                    </Spinner>
                </Col>
            </Row>
        );
    } else {
        return (
            <Row className="spacer-top-margin-lot" md={8}>
                <Col md={{ span: 8, offset: 2 }}>
                    <h3>Configure Users</h3>
                    <Accordion>
                        {data.users.map(user => (
                            <UserListComponent
                                key={user.uid}
                                data={user}
                                doRefresh={refreshData}
                            />
                        ))}
                    </Accordion>
                    <AddUserButton
                        doRevalidate={refreshData}
                        className="full-width spacer-top-margin"
                    />
                </Col>
            </Row>
        );
    }

    // return <div>Hello</div>;
}
