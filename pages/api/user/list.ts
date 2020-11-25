import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../../lib/APIErrorHandler';
import { assertAdmin, auth } from '../../../lib/MiscAuth';
import * as User from '../../../lib/mysql/User';
import status from '../../../lib/types/Response';

/**
 * List all users.
 * Admin only
 * @param req
 * @param res
 */
async function listAll(req: NextApiRequest, res: NextApiResponse<status>) {
    const getAuth = await auth(req);
    const admin = await assertAdmin(getAuth);
    const users = await User.getAll();
    res.status(200).json({ ok: true, users });
}

export default APIErrorHandler(listAll);
