import { NextApiRequest, NextApiResponse } from 'next';
import APIErrorHandler from '../../../lib/APIErrorHandler';
import { assertAdmin, auth } from '../../../lib/MiscAuth';
import * as User from '../../../lib/mysql/User';
import status from '../../../lib/types/Response';

/**
 * Email to UID helper
 * @param req
 * @param res
 */
async function toUID(req: NextApiRequest, res: NextApiResponse<status>) {
    const getAuth = await auth(req);
    await assertAdmin(getAuth);
    const { email } = User.getEmailFromBody(req);
    const result = await User.toUID(email);
    res.status(200).json({ ok: true, ...result });
}

export default APIErrorHandler(toUID);
