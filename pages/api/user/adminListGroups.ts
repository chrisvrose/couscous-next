import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../../lib/APIErrorHandler';
import { assertAdmin, auth } from '../../../lib/MiscAuth';
import * as Group from '../../../lib/mysql/Group';
import * as User from '../../../lib/mysql/User';
import status from '../../../lib/types/Response';

/**
 * List all groups user is in
 * Requires admin
 * @param req needs uid
 * @param res
 */
async function listUserGrp(req: NextApiRequest, res: NextApiResponse<status>) {
    const getAuth = await auth(req);
    const admin = assertAdmin(getAuth);
    const { uid } = await User.getUIDFromBody(req);
    await admin;
    const groups = await Group.getOneMemberList(uid);
    res.status(200).json({ ok: true, groups });
}

export default APIErrorHandler(listUserGrp);
