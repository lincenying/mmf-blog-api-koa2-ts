import type { ArticleInsert, ArticleModify, KoaContext } from '~/types'
import * as helper from './backend-article.helper'

/**
 * 获取文章列表的异步函数。
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function getList(res: KoaContext) {
    const reqQuery = res.query as { page: string, limit: string, sort: string }

    res.json(await helper.getList(reqQuery))
}

/**
 * 管理时, 获取单篇文章
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function getItem(res: KoaContext) {
    const reqQuery = res.query as { id: string }

    res.json(await helper.getItem(reqQuery))
}

/**
 * 发布文章
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function insert(res: KoaContext) {
    const reqBody = res.request.body as ArticleInsert

    res.json(await helper.insert(reqBody))
}

/**
 * 管理时, 删除文章
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function deletes(res: KoaContext) {
    const reqQuery = res.query as { id: string }

    res.json(await helper.deletes(reqQuery))
}

/**
 * 管理时, 恢复文章
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function recover(res: KoaContext) {
    const reqQuery = res.query as { id: string }

    res.json(await helper.recover(reqQuery))
}

/**
 * 管理时, 编辑文章
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function modify(res: KoaContext) {
    const reqBody = res.request.body as ArticleModify

    res.json(await helper.modify(reqBody))
}
