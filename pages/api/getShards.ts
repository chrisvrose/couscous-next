// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import assert from 'assert';
import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../lib/APIErrorHandler';
import { auth } from '../../lib/MiscAuth';
import { mdb } from '../../lib/mongo/database';
import status from '../../lib/types/Response';

async function getShards(req: NextApiRequest, res: NextApiResponse<status>) {
    await auth(req);
    // await mongos.connect();
    const db = await mdb('admin');
    const resp = await db.command({ listShards: 1 });
    assert(resp.shards, 'Could not get shardList');
    res.status(200).json({ ok: true, shards: resp?.shards ?? [] });
}

export default APIErrorHandler(getShards);
