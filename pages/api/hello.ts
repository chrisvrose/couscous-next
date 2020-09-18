// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {NextApiHandler,NextApiRequest,NextApiResponse} from 'next'

interface name{
  name:string
}

export default (req:NextApiRequest, res:NextApiResponse<name>) => {
  res.statusCode = 200
  res.json({ name: 'John Doe' })
}
