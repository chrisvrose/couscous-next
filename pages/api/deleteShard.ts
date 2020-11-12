// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

/* For this we need :
 * 2. Remove shard here - need to contact the elders
 */

import assert from 'assert';
import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../lib/APIErrorHandler';
import { assertAdmin, auth } from '../../lib/MiscAuth';
import { mongos } from '../../lib/mongo/database';
import status from '../../lib/types/Response';

async function deleteShard(req: NextApiRequest, res: NextApiResponse<status>) {
    const getAuth = await auth(req);
    const admin = assertAdmin(getAuth);

    const location = req.body?.loc;
    assert(location, 'expecting loc');

    //check if admin
    await admin;

    await mongos.connect();
    const db = mongos.db('admin');
    const resp = await db.command({ removeShard: location });

    res.status(200).json({ ok: true, shard: resp });
}

export default APIErrorHandler(deleteShard);
