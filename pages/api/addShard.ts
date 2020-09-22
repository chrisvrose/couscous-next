// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

/* For this we need :
 * 1. Initialize replica set in the shard (This is to be done from that side)
 * 2. Add shard here - need to contact the elders
 */

import assert from 'assert';
import { MongoClient } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { status } from '../../lib/response';

export default async (req: NextApiRequest, res: NextApiResponse<status>) => {
    const location = req.body?.loc;
    try {
        assert(location, 'expecting loc');
        const client = new MongoClient(location);
        await client.connect();
        const db = client.db('admin');

        const resp = await db.command({ listShards: 1 });
        res.status(200).json({ ok: true, shards: resp?.shards ?? [] });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message ?? 'Error' });
    }
};
