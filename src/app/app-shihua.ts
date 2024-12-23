import type { Context } from 'koa'
import type { KoaContext, Lists, ResData, ShiHua } from '~/types'
import fs from 'node:fs'

import pkg from 'baidu-aip-sdk'
import base64Img from 'base64-img'
import { cdnDomain, domain, shihua as shihuaConfig } from '../config'
import ShiHuaM from '../models/shihua'
import { getErrorMessage, getNowTime } from '../utils'
import { checkJWT } from '../utils/check-jwt'

const { imageClassify: AipImageClassifyClient } = pkg

export async function upload(res: Context) {
    const file = res.file
    res.json({ code: '200', url: file.path })
}

function getBase64(img_id: string, cdn: string): Promise<string> {
    if (cdn === 'qiniu') {
        return new Promise((resolve) => {
            const url = `${cdnDomain}app/${img_id}/800x800`
            base64Img.requestBase64(url, (_err: any, _res: any, body: string) => {
                if (body) {
                    body = body.split(',')[1]
                    resolve(body)
                }
                else {
                    resolve('')
                }
            })
        })
    }
    return Promise.resolve(fs.readFileSync(`./uploads/${img_id}`).toString('base64'))
}

export async function shihua(res: KoaContext) {
    const reqQuery = res.query as { id: string, cdn: string }

    const {
        id: img_id,
        cdn,
    } = reqQuery

    const token = (res.cookies.get('user') || res.header.user) as string
    const userid = (res.cookies.get('userid') || res.header.userid) as string
    const username = (res.cookies.get('username') || res.header.username) as string
    const isLogin = await checkJWT(token, userid, username, 'user')
    const getData = async () => {
        const client = new AipImageClassifyClient(shihuaConfig.APP_ID, shihuaConfig.API_KEY, shihuaConfig.SECRET_KEY)
        try {
            console.log(`七牛图片开始时间:${new Date().getTime()}`)
            const image = await getBase64(img_id, cdn)
            console.log(`七牛图片结束时间:${new Date().getTime()}`)
            if (image) {
                const options: Objable = {}
                options.baike_num = '5'
                // 带参数调用植物识别
                console.log(`识图开始时间:${new Date().getTime()}`)
                const shihuaResult = await client.plantDetect(image, options)
                console.log(`识图结束时间:${new Date().getTime()}`)
                if (shihuaResult.result) {
                    if (isLogin) {
                        const length = shihuaResult.result.length
                        let img, name
                        for (let i = 0; i < length; i++) {
                            const item = shihuaResult.result[i]

                            if (item.baike_info && item.baike_info.image_url) {
                                name = item.name
                                img = item.baike_info.image_url
                                break
                            }
                        }
                        if (cdn === 'qiniu') {
                            img = `${cdnDomain}app/${img_id}`
                        }
                        else {
                            img = `${domain}uploads/${img_id}`
                        }

                        if (img && name) {
                            await ShiHuaM.create({
                                user_id: userid,
                                img_id,
                                name,
                                img,
                                result: JSON.stringify(shihuaResult.result),
                                creat_date: getNowTime(),
                                is_delete: 0,
                                timestamp: getNowTime('X'),
                            })
                            // fs.unlinkSync('./uploads/' + img_id)
                        }
                    }
                    return {
                        success: true,
                        data: shihuaResult,
                    }
                }
                return {
                    success: false,
                    err: 'shitu',
                    message: shihuaResult.error_msg,
                }
            }
            return {
                success: false,
                err: 'down-img',
                message: '图片读取失败',
            }
        }
        catch (err: unknown) {
            return { success: false, err: 'unknow', message: getErrorMessage(err) }
        }
    }

    try {
        const filter = { img_id }
        const result = await ShiHuaM.findOne(filter).then(data => data?.toObject())
        if (result) {
            res.json({
                code: 200,
                from: 'db',
                userid,
                result: JSON.parse(result.result),
            })
        }
        else {
            let data = await getData()
            if (!data.success && data.err === 'unknow') {
                data = await getData()
            }
            if (!data.success && data.err === 'unknow') {
                data = await getData()
            }
            if (data.success) {
                res.json({ code: 200, from: 'api', userid, ...data.data })
            }
            else {
                res.json({ code: -200, userid, message: data.message || '读取数据失败' })
            }
        }
    }
    catch (err: unknown) {
        res.json({ code: -200, data: null, message: getErrorMessage(err) })
    }
}

/**
 * 获取识花历史列表
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function getHistory(res: KoaContext) {
    let json: ResData<Nullable<Lists<ShiHua[]>>>
    const reqQuery = res.query as { page?: number, limit?: number }

    const userid = (res.cookies.get('userid') || res.header.userid) as string

    const {
        page = 1,
        limit = 10,
    } = reqQuery

    const payload = {
        is_delete: 0,
        user_id: userid,
    }
    const skip = (page - 1) * limit
    const sort = '-creat_date'

    try {
        const [data, total] = await Promise.all([
            ShiHuaM.find(payload).sort(sort).skip(skip).limit(limit).exec().then(data => data.map(item => item.toObject())),
            ShiHuaM.countDocuments(payload),
        ])
        const totalPage = Math.ceil(total / limit)
        json = {
            code: 200,
            data: {
                list: data.map((item) => {
                    item.result = ''
                    return item
                }),
                total,
                hasNext: totalPage > page ? 1 : 0,
                hasPrev: page > 1 ? 1 : 0,
            },
        }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    res.json(json)
}

/**
 * 删除识花历史列表
 * @method delHistory
 * @param res 上下文对象，包含请求和响应的信息。
 * @returns 返回一个Promise，解析为处理后的响应数据。
 */
export async function delHistory(res: KoaContext) {
    let json: ResData<string | null>
    const reqQuery = res.query as { img_id: string }

    const userid = (res.cookies.get('userid') || res.header.userid) as string
    const { img_id } = reqQuery

    try {
        await ShiHuaM.deleteOne({ img_id, user_id: userid })
        fs.unlinkSync(`./uploads/${img_id}`)
        json = { code: 200, data: null, message: '删除成功' }
    }
    catch (err: unknown) {
        json = { code: -200, data: null, message: getErrorMessage(err) }
    }

    res.json(json)
}
