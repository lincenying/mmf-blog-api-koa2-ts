import ArticleM from '../models/article'
import CommentM from '../models/comment'
import { getErrorMessage, getNowTime } from '../utils'
import type { Comment, KoaContext, Lists, ReqListQuery, ResData } from '@/types'

/**
 * 发布评论
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function insert(res: KoaContext) {
    let json: ResData<Comment | null>
    const reqBody = res.request.body as { id: string; content: string }

    const userid = (res.cookies.get('userid') || res.header.userid) as string
    const {
        id: _id,
        content,
    } = reqBody

    const creat_date = getNowTime()
    const timestamp = getNowTime('X')
    if (!_id) {
        json = { code: -200, data: null, message: '参数错误' }
    }
    else if (!content) {
        json = { code: -200, data: null, message: '请输入评论内容' }
    }
    else {
        const data: Comment = {
            article_id: _id,
            userid,
            content,
            creat_date,
            is_delete: 0,
            timestamp,
        }
        try {
            const result = await CommentM.create(data).then(data => data.toObject())
            const filter = { _id }
            const body = {
                $inc: {
                    comment_count: 1,
                },
            }
            await ArticleM.updateOne(filter, body).exec()
            json = { code: 200, data: result, message: '发布成功' }
        }
        catch (err: unknown) {
            json = { code: -200, data: null, message: getErrorMessage(err) }
        }
    }

    res.json(json)
}

/**
 * 前台浏览时, 读取评论列表
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function getList(res: KoaContext) {
    let json: ResData<Nullable<Lists<Comment[]>>>
    const reqQuery = res.query as ReqListQuery

    const {
        all,
        id: article_id,
    } = reqQuery

    let { limit, page } = reqQuery

    if (!article_id) {
        json = { code: -200, data: null, message: '参数错误' }
    }
    else {
        page = Number(page) || 1
        limit = Number(limit) || 10

        const data: {
            article_id: string
            is_delete?: number
        } = {
            article_id,
        }
        const skip = (page - 1) * limit
        if (!all) {
            data.is_delete = 0
        }

        try {
            const [list, total] = await Promise.all([
                CommentM.find(data).sort('-_id').skip(skip).limit(limit).exec().then(data => data.map(item => item.toObject())),
                CommentM.countDocuments(data),
            ])
            const totalPage = Math.ceil(total / limit)
            json = {
                code: 200,
                data: {
                    list,
                    total,
                    hasNext: totalPage > page ? 1 : 0,
                    hasPrev: page > 1 ? 1 : 0,
                },
            }
        }
        catch (err: unknown) {
            json = { code: -200, data: null, message: getErrorMessage(err) }
        }
    }

    res.json(json)
}

/**
 * 评论删除
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function deletes(res: KoaContext) {
    let json: ResData<string | null>
    const reqQuery = res.query as { id: string }

    const {
        id: _id,
    } = reqQuery

    try {
        const filter = { _id }
        const commentBody = { is_delete: 0 }
        const ArticleBody = { $inc: { comment_count: -1 } }
        await Promise.all([
            CommentM.updateOne(filter, commentBody).exec(),
            ArticleM.updateOne(filter, ArticleBody).exec(),
        ])
        json = { code: 200, message: '删除成功', data: 'success' }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    res.json(json)
}

/**
 * 评论恢复
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function recover(res: KoaContext) {
    let json: ResData<string | null>
    const reqQuery = res.query as { id: string }

    const {
        id: _id,
    } = reqQuery

    try {
        const filter = { _id }
        const commentBody = { is_delete: 0 }
        const ArticleBody = { $inc: { comment_count: 1 } }
        await Promise.all([
            CommentM.updateOne(filter, commentBody).exec(),
            ArticleM.updateOne(filter, ArticleBody).exec(),
        ])
        json = { code: 200, message: '恢复成功', data: 'success' }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    res.json(json)
}
