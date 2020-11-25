import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../../lib/APIErrorHandler';
import { assertAdmin, auth } from '../../../lib/MiscAuth';
import * as User from '../../../lib/mysql/User';
import status from '../../../lib/types/Response';

/**
 * Set priviledge
 * Admin only
 * Warning: Admin can demote himself
 * @param req
 * @param res
 */
async function promote(req: NextApiRequest, res: NextApiResponse<status>) {
    const getAuth = await auth(req);
    const admin = assertAdmin(getAuth);
    const uidRolePacket = await User.getUIDAndRoleFromBody(req);
    await admin;
    const status = await User.setRole(uidRolePacket);
    res.status(200).json({ ok: true, status });
}

export default APIErrorHandler(promote);
