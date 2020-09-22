// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next';
import { status } from '../../lib/response';

export default (req: NextApiRequest, res: NextApiResponse<status>) => {
    res.status(200).json({ ok: true, test: true });
};
