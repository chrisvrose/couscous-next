// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import assert from 'assert';
import { NextApiRequest, NextApiResponse } from 'next';
import { mongos } from '../../lib/mongo/database';
import status from '../../lib/response';

export default async (req: NextApiRequest, res: NextApiResponse<status>) => {
    try {
        await mongos.connect();
        const db = mongos.db('admin');
        const resp = await db.command({ listShards: 1 });
        assert(resp.shards);
        res.status(200).json({ ok: true, shards: resp?.shards ?? [] });
    } catch (err) {
        res.status(500).json({ ok: false, status: err?.message ?? 'error' });
    }
};
