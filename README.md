# ElectronPageTentacle

ElectronPageTentacle 讲道理是一个基于 electronjs 的爬虫框架



## 框架结构

主要构成：Manager，Worker，Inject_js_handler

#### Manager

专注于业务逻辑，控制众多 Worker 进行工作。比方说模拟登陆，然后进入商品列表页啊，然后逐个商品详情页点开啊，然后再记录每个商品的价格等数据啊

#### Worker

控制 electron 的窗口，封装了一些奇奇怪怪的函数，什么模拟鼠标事件，模拟触摸事件之类的。当然还有通过 Inject_js_handler 来给对应打开的页面注入你的 js 

#### Inject_js_handler

把你要注入的 js 写好给 Inject_js_handler 实例就行了，然后把这实例丢给 Worker，然后 Worker 在 Manager 的控制下进行操作。



## 使用说明

心情不好，不写了！反正又没有钱，写教程是不可能写教程的了！！！



## 关于 ElectronJS 来做爬虫的杂记

[杂记或笔记](zaji.md)