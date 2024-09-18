import KoaRouter from '@koa/router'

import * as backendUser from '../api/backend-user'
import app from './app'
import backend from './backend'
import frontend from './frontend'

const router = new KoaRouter()
// 添加管理员
router.get('/backend', async (ctx) => {
    ctx.state = {
        title: '后台登录',
        message: '',
    }
    await ctx.render('admin-add', {})
})
router.post('/backend', backendUser.insert)

router.use('/api/backend', backend.routes(), backend.allowedMethods())
router.use('/api/frontend', frontend.routes(), frontend.allowedMethods())
router.use('/api/app', app.routes(), app.allowedMethods())

router.get('(.*)', async (ctx) => {
    ctx.body = {
        code: 404,
        data: null,
        message: '页面没有找到',
    }
})

export default router
