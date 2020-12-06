import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../../lib/APIErrorHandler';
import { assertAdmin, auth } from '../../../lib/MiscAuth';
import * as Group from '../../../lib/mysql/Group';
import status from '../../../lib/types/Response';

/**
 * Rename a group
 * Admin only
 * @param req
 * @param res
 */
async function rename(req: NextApiRequest, res: NextApiResponse<status>) {
    const getAuth = await auth(req);
    const admin = await assertAdmin(getAuth);
    const { name, gid } = Group.getGIDNameFromBody(req);
    const result = await Group.rename(gid, name);
    res.status(200).json({ ok: true, result });
}

export default APIErrorHandler(rename);
