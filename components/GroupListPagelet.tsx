import React, { useContext } from 'react';
import { Accordion, Col, Row, Spinner } from 'react-bootstrap';
import useSWR from 'swr';
import UserContext from '../lib/contexts/UserContext';
import { fetcher } from '../lib/fetcher';
import { GroupListResponse } from '../lib/types/Group';
import ResponseError from '../lib/types/ResponseError';
import AddGroupButton from './AddGroupButton';
import GroupListComponent from './GroupListComponent';

export default function GroupListPageLet() {
    const { userState, dispatch: dispatchUser } = useContext(UserContext);
    const { data, error, mutate } = useSWR<GroupListResponse, ResponseError>(
        '/api/group/list',
        fetcher,
        {
            revalidateOnFocus: true,
            refreshInterval: 1000,
            shouldRetryOnError: false,
        }
    );

    const refreshData = async () => mutate(undefined, true);

    if (error) {
        if (error?.statusCode === 403) {
            dispatchUser({ type: 'logout' });
        }
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
                    <h3>Groups</h3>
                    <Accordion>
                        {data.groups.length > 0 ? (
                            data.groups.map(group => (
                                // return <div key={group.gid}>{group.name}</div>;
                                <GroupListComponent
                                    key={group.gid}
                                    data={group}
                                    doRefresh={refreshData}
                                />
                            ))
                        ) : (
                            <div>No groups</div>
                        )}
                    </Accordion>
                    <AddGroupButton
                        doRevalidate={refreshData}
                        className="full-width spacer-top-margin"
                    />
                </Col>
            </Row>
        );
    }
}
