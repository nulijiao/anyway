
function P(fn) {
   this.successCallbacks = [];
   this.status = 'pending';
   this.errorCallbacks = []
   const self = this;
   const postError = (err) => {
        if(this.status === 'pending') {
            console.error('unhandledRejection')
        }else {
            self.status === 'reject'
            reject(err)
        }
   }

   try{
       fn(resolve, reject)
   }catch(err) {
       postError(err)
   }

    function resolve(val){
       console.log(val)
       this.val = val
        setTimeout(()=>{
            self.status = 'resolve'
            self.successCallbacks.forEach(item => {
                item(val)
            })
        })
    }
    function reject(err) {
        self.err = err
        setTimeout(()=>{
            self.status = 'reject'
            self.errorCallbacks.forEach(item => {
                item(err)
            })
        })
    }
}

P.prototype.then = function (onFufilled, onReject){
    onFufilled = onFufilled || (val => val)
    onReject = onFufilled || (val => val)
    const self = this
    const status = this.status
    let p2;
    if(status === 'pending') {

        p2 = new Promise((resolve, reject) => {
            console.log(onFufilled)
           self.successCallbacks.push((val) => {
               try{
                   const resolveValue = onFufilled(val)
                   console.log('pengding',onFufilled)
                   console.log('onFufilled')
                   // 连接一个新 promise 就会发现
                   resolvePromise(resolveValue, p2, resolve, reject)
               }catch(err) {
                   reject(err)
               }
           })
            self.errorCallbacks.push((err) => {
                try{
                    const resolveValue = onReject(err)
                    resolvePromise(resolveValue, self, resolve, reject)
                }catch(err) {
                    reject(err)
                }
            })

        });

    }
    if(status === 'resolve') {
        p2 = new Promise((resolve, reject) => {
            try{
                 const resolveValue = onFufilled(self.val)

                    // 连接一个新 promise 就会发现
                    resolvePromise(resolveValue, p2, resolve, reject)
                }catch(err) {
                    reject(err)
                }

        });
    }
    if(status === 'reject') {
        p2 = new Promise((resolve, reject) => {
            try{
                const resolveValue = onReject(self.err)
                // 连接一个新 promise 就会发现
                resolvePromise(resolveValue, p2, resolve, reject)
            }catch(err) {
                reject(err)
            }

        });
    }
    return p2;
}
function resolvePromise(value, newPromise, resolve, reject) {
    if(value instanceof P) {
        if(value.status === 'pending') {
            // 让内部的 promise 先被解析成功，只有里面的打开了最外面无法感知的 promise 才能被打开
                value.then((val)=>{
                // 这里到底在干啥，想一下哈，如果你的值是一个 promise 的话，里面的不结束，你必须先等待里面的promise被resolve以后才可以打开最外面的怎么可以把最外面的值直接 resolve 掉但是你同时还需要记得最外层的 promise，不然最外层无法 resolve
                console.log('传进来的promise的值',val)
                resolvePromise(val, newPromise, resolve, reject)
            }, err => reject(err))
        }else {
            // 表示是一个普通值但是桥接的新对象我们只能自己添加 then 函数
            value.then(resolve, reject)
        }
    }else {
        // 已经是一个新的我们无法感知的 promise 里面了，所以即使调用了还要看后面是否接了 then，已经把值给传递给then 里面了
        console.log(value)
        resolve(value)
    }
}

//  结构解释

// p1 是一个 promise 里面有方法当我们为其添加 then 的时候就返回了一个我们没有感知的 promise，同时根据状态我们把回调函数重新改写，在 promise pending时候在新返回的 promise里面 push 执行原来的函数的同时还要根据回调执行结果的来进行是否桥接的 promise 是否进行 resolve 返回值，这样打开桥接的 promise/

P.all = function(allPromise) {
    var length = allPromise.length
    var result = []

    return new Promise((res, rej) => {
        for(let i = 1; i < length; i++){
           allPromise[i].then(val => {
                result.push(val)
            })
        }
        if(result.length === length) {
            res(result)
        }
    })
}

P.race = function(allPromise) {
    var length = allPromise.length
    var result = []
    return new Promise((res, rej) => {
        for(let i = 1; i < length; i++){
            allPromise[i].then(val => {
                result.push(val)
            })
        }
        if(result.length === 1) {
            res(result)
            return
        }
    })
}

P.resolve = function(val) {
    return new Promise((res, rej)=>{
        res(val)
    })
}

P.prototype.catch = function(reject){
    this.then(null, reject)
}

// 测试传递 promise
var p1 = new P(function(res){
    res(9)
})

const t = p1.then(function(val){
    return  new P(function(res){
        res(11)
    })
})
t.then(v=>{console.log(v)})

// 测试error
var p1 = new P(function(res){
    throw new Error('hhh')
})

// 测试 catch
var p1 = new P(function(res, rej){
    rej('90')
}).catch(err=>{
    console.log(err)
})

// 测试 res 之后
var p1 = new P(function(res, rej){
    res(new Error('901'))
}).catch(err=>{
    console.log(err)
})
// 测试 P.resolve
P.resolve(new P(function(res, rej){
    res(new Error('9010'))
})).then(v=>{
    console.log(v)
})
// 测试 all
const p11 = new P(function(res, rej){
    res(new Error('9011'))
})
const p21 = new P(function(res, rej){
    res(new Error('9012'))
})
const p31 = new P(function(res, rej){
    res(new Error('9013'))
})
P.all([p11,p21,p31]).then(val=>console.log(val))
// 测试 race
const p111 = new P(function(res, rej){
    res('90111')
})
const p211 = new P(function(res, rej){
    res('90121')
})
const p311 = new P(function(res, rej){
    res('90131')
})
P.race([p111, p211, p311]).then(val=>console.log(val))