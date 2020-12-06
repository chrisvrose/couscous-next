import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../../lib/APIErrorHandler';
import { assertAdmin, auth } from '../../../lib/MiscAuth';
import * as Group from '../../../lib/mysql/Group';
import status from '../../../lib/types/Response';

/**
 * List all users in a group
 * Admin only
 * @param req
 * @param res
 */
async function listAll(req: NextApiRequest, res: NextApiResponse<status>) {
    const getAuth = await auth(req);
    const admin = assertAdmin(getAuth);
    const { gid } = Group.getGIDFromBody(req);
    await admin;
    const users = await Group.getMembers(gid);
    res.status(200).json({ ok: true, users });
}

export default APIErrorHandler(listAll);
