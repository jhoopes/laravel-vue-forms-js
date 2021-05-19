import { createRouter, createWebHistory, RouterOptions } from 'vue-router'
import routes from './routes';

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes: routes
} as RouterOptions)



router.beforeEach((to, _from, next) => {

    // This goes through the matched routes from last to first, finding the closest route with a title.
    // eg. if we have /some/deep/nested/route and /some, /deep, and /nested have titles, nested's will be chosen.
    const nearestWithTitle = to.matched.slice().reverse().find(r => r.meta && r.meta.title)

    // Find the nearest route element with meta tags.
    // const nearestWithMeta = to.matched.slice().reverse().find(r => r.meta && r.meta.metaTags)

    // If a route with a title was found, set the document (page) title to that value.
    if (nearestWithTitle) document.title = nearestWithTitle.meta.title as string

    // Remove any stale meta tags from the document using the key attribute we set below.
    Array.from(document.querySelectorAll('[data-vue-router-controlled]')).map(el => {
        if (el === null || el.parentNode === null) {

        } else {
            el.parentNode.removeChild(el)
        }
    })

    next()
})

export default router;