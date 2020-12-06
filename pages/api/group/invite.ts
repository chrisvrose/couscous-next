import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../../lib/APIErrorHandler';
import { assertAdmin, auth } from '../../../lib/MiscAuth';
import * as Group from '../../../lib/mysql/Group';
import status from '../../../lib/types/Response';

/**
 * List all users.
 * Admin only
 * @param req
 * @param res
 */
async function invite(req: NextApiRequest, res: NextApiResponse<status>) {
    const getAuth = await auth(req);
    const admin = assertAdmin(getAuth);

    const { uid, gid } = Group.getGIDUIDFromBody(req);
    await admin;

    const changed = await Group.invite(uid, gid);
    res.status(200).json({ ok: true, changed });
}

export default APIErrorHandler(invite);
