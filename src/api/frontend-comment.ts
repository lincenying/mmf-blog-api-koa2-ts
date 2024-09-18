import type { KoaContext, ReqListQuery } from '~/types'
import * as helper from './frontend-comment.helper'

/**
 * 发布评论
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function insert(res: KoaContext) {
    const reqBody = res.request.body as { id: string; content: string }

    const userid = (res.cookies.get('userid') || res.header.userid) as string

    res.json(await helper.insert(reqBody, userid))
}

/**
 * 前台浏览时, 读取评论列表
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function getList(res: KoaContext) {
    const reqQuery = res.query as ReqListQuery

    res.json(await helper.getList(reqQuery))
}

/**
 * 评论删除
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function deletes(res: KoaContext) {
    const reqQuery = res.query as { id: string }

    res.json(await helper.deletes(reqQuery))
}

/**
 * 评论恢复
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function recover(res: KoaContext) {
    const reqQuery = res.query as { id: string }

    res.json(await helper.recover(reqQuery))
}
