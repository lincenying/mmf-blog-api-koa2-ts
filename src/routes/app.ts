import KoaRouter from '@koa/router'

import multer from '@lincy/multer'
import * as appPublic from '../app/app-public'
import * as appShihua from '../app/app-shihua'
import * as appWeiBo from '../app/app-weibo'
import * as appQiniu from '../app/app-qiniu'
import * as appDouYin from '../app/app-douyin'

import cors from '../middlewares/cors'
import isUser from '../middlewares/user'

const router = new KoaRouter()

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, './uploads')
    },
    filename(req, file, cb) {
        const ext = file.originalname.split('.').pop()
        cb(null, `shihua-${Date.now()}.${ext}`)
    },
})
const Upload = multer({ storage }).single('file')

// API
// ================= APP =================
// ------- 检测版本更新 ------
router.get('/check', cors, appPublic.checkUpdate)

// ------ 识花 ------
router.post('/shihua/upload', cors, Upload, appShihua.upload)
router.get('/shihua/get', cors, appShihua.shihua)
router.get('/shihua/history/list', cors, isUser, appShihua.getHistory)
router.get('/shihua/history/delete', cors, isUser, appShihua.delHistory)
// ------ 微博 ------
router.get('/weibo/list', cors, appWeiBo.list)
router.get('/weibo/get', cors, appWeiBo.get)
router.get('/weibo/user', cors, appWeiBo.user)
router.get('/weibo/card', cors, appWeiBo.card)
router.get('/weibo/video', cors, appWeiBo.video)
router.get('/weibo/beauty-video', cors, appWeiBo.beautyVideo)
router.get('/weibo/detail', cors, appWeiBo.detail)
// ------ 七牛 token -----
router.get('/qiniu/token', cors, appQiniu.token)
// ------ 抖音视频 -------
router.post('/douyin/user/insert', cors, appDouYin.insertUser)
router.post('/douyin/insert', cors, appDouYin.insert)
router.get('/douyin/list', cors, appDouYin.getList)
router.get('/douyin/item', cors, appDouYin.getItem)

export default router
