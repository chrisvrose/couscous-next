// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

// import { } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

export default (req: NextApiRequest, res: NextApiResponse) => {
    res.status(200).json({ ok: true });
};
