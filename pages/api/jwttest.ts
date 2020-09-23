// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '../../lib/authenticate';
import status from '../../lib/response';

export default async (req: NextApiRequest, res: NextApiResponse<status>) => {
    await auth(req, res);
    res.status(200).json({ ok: true, test: true });
};
