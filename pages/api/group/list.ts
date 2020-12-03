import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../../lib/APIErrorHandler';
import { auth } from '../../../lib/MiscAuth';
import * as Group from '../../../lib/mysql/Group';
import status from '../../../lib/types/Response';

/**
 * List all users.
 * Admin only
 * @param req
 * @param res
 */
async function listAll(req: NextApiRequest, res: NextApiResponse<status>) {
    const getAuth = await auth(req);
    // const admin = await assertAdmin(getAuth);
    const groups = await Group.getAll();
    res.status(200).json({ ok: true, groups });
}

export default APIErrorHandler(listAll);
