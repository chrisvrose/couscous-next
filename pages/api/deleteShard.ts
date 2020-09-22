// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

/* For this we need :
 * 2. Remove shard here - need to contact the elders
 */

import assert from 'assert';
import { NextApiRequest, NextApiResponse } from 'next';
import { mongos } from '../../lib/database';
import { status } from '../../lib/response';

export default async (req: NextApiRequest, res: NextApiResponse<status>) => {
    const location = req.body?.loc;
    try {
        assert(location, 'expecting loc');

        await mongos.connect();
        const db = mongos.db('admin');
        const resp = await db.command({ removeShard: location });

        res.status(200).json({ ok: true, shard: resp });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message ?? 'Error' });
    }
};
