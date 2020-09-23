/*
 * My work -
 * authenticate
 * then, throw an error if the jwt doesnt work
 */

import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

export interface JWTPayload {
    uid: string;
}

/**
 * Validate an incoming JWT Token
 * @param req Request
 * @param res Response
 */
export default async function auth(req: NextApiRequest, res: NextApiResponse) {
    const authHeader = res.getHeader('authorization')?.toString();
    const atoken = authHeader?.split(' ')[1];
    console.log(atoken);
    throw Error('REEE');
}

/**
 * Generate a JWT Token
 * @param payload payload to sign
 */
export async function GenerateJWToken(payload: JWTPayload) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
}
