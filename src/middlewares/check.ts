import jwt from 'jsonwebtoken'
import * as config from '../config'

export default (token: string, type: string): Promise<jwt.JwtPayload | false> => {
    const secret = type === 'admin' ? config.secretServer : config.secretClient
    return new Promise((resolve) => {
        jwt.verify(token, secret, (err, decoded) => {
            if (err || !decoded || typeof decoded === 'string') {
                resolve(false)
            }
            else {
                resolve(decoded)
            }
        })
    })
}
