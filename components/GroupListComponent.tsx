import React from 'react';
import { Accordion, Card, Spinner } from 'react-bootstrap';
import useSWR from 'swr';
import { fetcher } from '../lib/fetcher';
import { GroupListLet } from '../lib/types/Group';
import ResponseError from '../lib/types/ResponseError';
import { UserPageResponse } from '../lib/types/Users';
import GroupListMemberUser from './GroupListMemberUser';

interface GroupListProps {
    data: GroupListLet;
    doRefresh: () => Promise<any>;
}

export default function GroupListComponent({
    data,
    doRefresh,
}: GroupListProps) {
    return (
        <Card>
            <Accordion.Toggle
                as={Card.Header}
                variant="link"
                eventKey={data.gid.toString()}
            >
                {data.name}
            </Accordion.Toggle>
            <Accordion.Collapse eventKey={data.gid.toString()}>
                <Card.Body>
                    Name - {data.name}
                    {/* GID - {data.gid} */}
                    <GroupMembers gid={data.gid} />
                </Card.Body>
            </Accordion.Collapse>
        </Card>
    );
}

function GroupMembers({ gid }: { gid: number }) {
    // console.log(gid);
    const { data: members, error, mutate } = useSWR<
        UserPageResponse,
        ResponseError
    >('api/group/listMembers/' + gid, fetcher, {
        revalidateOnFocus: true,
        refreshInterval: 1000,
        shouldRetryOnError: true,
    });
    // useEffect(() => {
    //     console.log('L', members, error, { gid });
    // }, [members, error]);
    const refreshMemberData = async () => mutate(undefined, true);
    if (error) {
        return <></>;
    }
    if (!members) {
        return (
            <Spinner animation="border" role="status">
                <span className="sr-only">Loading...</span>
            </Spinner>
        );
    } else {
        // return <span>{JSON.stringify(members.users)}</span>;
        return (
            <>
                <h5 className="spacer-top-margin">Members {gid}</h5>
                <Accordion className="spacer-top-margin">
                    {members.users.length > 0 ? (
                        members.users.map(user => (
                            <GroupListMemberUser
                                key={user.uid}
                                gid={gid}
                                data={user}
                                doRefresh={refreshMemberData}
                            />
                        ))
                    ) : (
                        <span>--No Members--</span>
                    )}
                </Accordion>
            </>
        );
    }
    return <></>;
}
