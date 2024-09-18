import type { Next } from 'koa'
import type { KoaContext } from '~/types'
import { Buffer } from 'node:buffer'
import check from './check'

export default async (ctx: KoaContext, next: Next) => {
    const token = ctx.cookies.get('b_user')
    const userid = ctx.cookies.get('b_userid')
    let username = ctx.cookies.get('b_username') || ''
    username = Buffer.from(username, 'base64').toString()
    if (token) {
        const decoded = await check(token, 'admin')
        if (decoded && decoded.id === userid && decoded.username === username) {
            ctx.decoded = decoded
            await next()
        }
        else {
            ctx.cookies.set('b_user', '', { maxAge: 0, httpOnly: false })
            ctx.cookies.set('b_userid', '', { maxAge: 0 })
            ctx.cookies.set('b_username', '', { maxAge: 0 })
            ctx.body = {
                code: -500,
                message: '登录验证失败',
                data: '',
            }
        }
    }
    else {
        ctx.body = {
            code: -500,
            message: '请先登录',
            data: '',
        }
    }
}
