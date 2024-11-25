import type { KoaContext } from '~/types'
import * as helper from './frontend-user.helper'

/**
 * 用户列表
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function getList(res: KoaContext) {
    const reqQuery = res.query as { page?: number, limit?: number }

    res.json(await helper.getList(reqQuery))
}

/**
 * 用户登录
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function login(res: KoaContext) {
    const reqBody = res.body as { username: string, password: string }

    const json = await helper.login(reqBody)

    const remember_me = 30 * 24 * 60 * 60 * 1000 // 30天
    res.cookies.set('user', json.data?.user, { maxAge: remember_me, httpOnly: false })
    res.cookies.set('userid', json.data?.userid, { maxAge: remember_me, httpOnly: false })
    res.cookies.set('username', json.data?.username, { maxAge: remember_me, httpOnly: false })
    res.cookies.set('useremail', json.data?.useremail, { maxAge: remember_me, httpOnly: false })

    res.json(json)
}

/**
 * 微信登录
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function jscodeToSession(res: KoaContext) {
    const reqBody = res.body as { js_code: string }

    res.json(await helper.jscodeToSession(reqBody))
}
/**
 * 微信登录
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function wxLogin(res: KoaContext) {
    const reqBody = res.body as { nickName: string, wxSignature: string, avatar: string }

    res.json(await helper.wxLogin(reqBody))
}

/**
 * 用户退出
 * @param res 上下文对象，包含请求和响应的信息。
 */
export function logout(res: KoaContext) {
    const json = helper.logout()

    res.cookies.set('user', '', { maxAge: -1, httpOnly: false })
    res.cookies.set('userid', '', { maxAge: -1, httpOnly: false })
    res.cookies.set('username', '', { maxAge: -1, httpOnly: false })
    res.cookies.set('useremail', '', { maxAge: -1, httpOnly: false })

    res.json(json)
}

/**
 * 用户注册
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function insert(res: KoaContext) {
    const reqBody = res.body as { email: string, password: string, username: string }

    res.json(await helper.insert(reqBody))
}

/**
 * 获取用户信息
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function getItem(res: KoaContext) {
    const reqQuery = res.query as { id: string }

    const userid = (reqQuery.id || res.cookies.get('userid') || res.header.userid) as string

    res.json(await helper.getItem(userid))
}

/**
 * 用户编辑
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function modify(res: KoaContext) {
    const reqBody = res.body as { id: string, email: string, password: string, username: string }

    res.json(await helper.modify(reqBody))
}

/**
 * 账号编辑
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function account(res: KoaContext) {
    const reqBody = res.body as { email: string }

    const user_id = (res.cookies.get('userid') || res.header.userid) as string
    res.json(await helper.account(reqBody, user_id))
}

/**
 * 密码编辑
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function password(res: KoaContext) {
    const reqBody = res.body as { old_password: string, password: string }

    const user_id = (res.cookies.get('userid') || res.header.userid) as string

    res.json(await helper.password(reqBody, user_id))
}

/**
 * 用户删除
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function deletes(res: KoaContext) {
    const reqQuery = res.query as { id: string }

    res.json(await helper.deletes(reqQuery))
}

/**
 * 用户恢复
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function recover(res: KoaContext) {
    const reqQuery = res.query as { id: string }

    res.json(await helper.recover(reqQuery))
}
