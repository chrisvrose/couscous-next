// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

/* For this we need :
 * 1. Add shard here - need to contact the elders
 */

import assert from 'assert';
import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../lib/APIErrorHandler';
import { mongos } from '../../lib/mongo/database';
import status from '../../lib/types/Response';

async function addShard(req: NextApiRequest, res: NextApiResponse<status>) {
    const location = req.body?.loc;
    assert(location, 'expecting loc');

    await mongos.connect();
    const db = mongos.db('admin');
    const resp = await db.command({ addShard: location });

    res.status(200).json({ ok: true, shard: resp });
}

export default APIErrorHandler(addShard);
