import type { KoaContext } from '~/types'
import * as helper from './backend-user.helper'

/**
 * 获取管理员列表
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function getList(res: KoaContext) {
    const reqQuery = res.query as { page?: number; limit?: number }

    res.json(await helper.getList(reqQuery))
}

/**
 * 获取单个管理员
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function getItem(res: KoaContext) {
    const reqQuery = res.query as { id: string }

    res.json(await helper.getItem(reqQuery))
}

/**
 * 管理员登录
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function login(res: KoaContext) {
    const reqBody = res.request.body as { password: string; username: string }

    const json = await helper.login(reqBody)

    const remember_me = 30 * 24 * 60 * 60 * 1000 // 30天
    res.cookies.set('b_user', json.data?.user, { maxAge: remember_me, httpOnly: false })
    res.cookies.set('b_userid', json.data?.userid, { maxAge: remember_me })
    res.cookies.set('b_username', json.data?.username, { maxAge: remember_me })

    res.json(json)
}

/**
 * 初始化时添加管理员
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function insert(res: KoaContext) {
    const reqBody = res.request.body as { email: string; password: string; username: string }
    const { email, password, username } = reqBody
    const message = await helper.insert(email, password, username)
    await res.render('admin-add', { message })
}

/**
 * 管理员编辑
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function modify(res: KoaContext) {
    const reqBody = res.request.body as { id: string; email: string; password: string; username: string }

    res.json(helper.modify(reqBody))
}

/**
 * 管理员删除
 * @method deletes
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function deletes(res: KoaContext) {
    const reqQuery = res.query as { id: string }

    res.json(await helper.deletes(reqQuery))
}

/**
 * 管理员恢复
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function recover(res: KoaContext) {
    const reqQuery = res.query as { id: string }

    res.json(await helper.recover(reqQuery))
}
