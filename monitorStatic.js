/*
* script 脚本 src
css 样式文件 link 的 href
img 图片 src
background-img 背景图这个怎么处理只能是在背景图的时候使用 src 为空的时候一种替代样式
*
* */


function monitorStatics(){
    window.addEventListener('error', function(e){
        const target = e.target
        const tag = target.tagName
        if (tag === 'SCRIPT'|| tag === 'IMG') {
            sendMessage(tag, target['src'])
        }
        if(tag === 'LINK') {
            sendMessage(tag, target['href'])
        }
    }, true)
}


function sendMessage(type, src) {
    var now = new Date();
    const req = new XMLHttpRequest()
    req.open('POST', 'https://www.zhihu.com/sc-profiler')
    req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    req.send(
        JSON.stringify({
            time: now,
            type: type,
            failUrl: src
        })
    )

}