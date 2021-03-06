import React from 'react';
// import React from 'react';
import { Accordion, Alert, Spinner } from 'react-bootstrap';
import useSWR from 'swr';
import { fetcher, ResponseError } from '../lib/fetcher';
import { GetShardsResponse } from '../lib/ShardInfo';
import Shard from './ShardAccordion';
import ShardButtons from './ShardButtons';

export default function PrintShards() {
    // const { ok, shards, statusCode } = props;
    const { data, error, revalidate, mutate } = useSWR<
        GetShardsResponse,
        ResponseError
    >('/api/getShards', fetcher, {
        revalidateOnFocus: true,
        refreshInterval: 1000,
    }); //as responseInterface<GetShardsResponse, { status: number }>;
    const doRevalidate = () => mutate(undefined, true);
    if (error) {
        if (error.status === 403)
            return (
                <>
                    <h2>No permission</h2>
                    <Alert variant="warning">
                        We did not have sufficient permissions
                    </Alert>
                </>
            );
        else
            return (
                <>
                    <h2>Error fetching data</h2>
                    <Alert variant="warning">
                        We did not have sufficient permissions
                    </Alert>
                </>
            );
    }
    if (!data) {
        return (
            <h2>
                <Spinner animation="border" role="status">
                    <span className="sr-only">Loading...</span>
                </Spinner>
            </h2>
        );
    } else {
        const { ok, shards } = data;
        if (shards.length > 0) {
            return (
                <>
                    <h2>Shards</h2>
                    <Accordion>
                        {shards.map((e, i) => {
                            return (
                                <Shard
                                    key={i}
                                    shard={e}
                                    doRevalidate={doRevalidate}
                                    isDisabled={shards.length === 1}
                                ></Shard>
                            );
                        })}
                    </Accordion>
                    <ShardButtons
                        className="full-width spacer-top-margin"
                        doRevalidate={doRevalidate}
                    />
                </>
            );
        } else {
            return (
                <>
                    <h2>No shards</h2>
                    <ShardButtons
                        className="full-width spacer-top-margin"
                        doRevalidate={doRevalidate}
                    />
                </>
            );
        }
        // return <h2>{JSON.stringify(data)}</h2>;
    }
}
