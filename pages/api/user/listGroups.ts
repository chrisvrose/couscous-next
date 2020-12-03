import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../../lib/APIErrorHandler';
import { auth } from '../../../lib/MiscAuth';
import * as Group from '../../../lib/mysql/Group';
import status from '../../../lib/types/Response';

/**
 * List all groups self is in
 * @param req
 * @param res
 */
async function listGroups(req: NextApiRequest, res: NextApiResponse<status>) {
    const { uid } = await auth(req);
    const groups = await Group.getOneMemberList(uid);
    res.status(200).json({ ok: true, groups });
}

export default APIErrorHandler(listGroups);
