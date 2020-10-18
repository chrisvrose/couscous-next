import React from 'react';
// import React from 'react';
import { Accordion } from 'react-bootstrap';
import useSWR, { responseInterface } from 'swr';
import { fetcher } from '../lib/fetcher';
import { GetShardsResponse } from '../lib/ShardInfo';
import Shard from './ShardAccordion';
import ShardButtons from './ShardButtons';

export default function PrintShards() {
    // const { ok, shards, statusCode } = props;
    const { data, error, revalidate } = useSWR('/api/getShards', fetcher, {
        revalidateOnFocus: true,
        refreshInterval: 5,
    }) as responseInterface<GetShardsResponse, { status: number }>;
    if (error) {
        return <h2>No permission!</h2>;
    }
    if (!data) {
        return <h2>Loading...</h2>;
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
                                    revalidate={revalidate}
                                ></Shard>
                            );
                        })}
                    </Accordion>
                    <ShardButtons
                        className="full-width spacer-top-margin"
                        revalidate={revalidate}
                    />
                </>
            );
        } else {
            return (
                <>
                    <h2>No shards</h2>
                    <ShardButtons
                        className="full-width spacer-top-margin"
                        revalidate={revalidate}
                    />
                </>
            );
        }
        // return <h2>{JSON.stringify(data)}</h2>;
    }
}
