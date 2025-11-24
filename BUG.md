# 1. app/app/GDatas.tsx(已解决)

由于format_style导出的style中background会莫名其妙失效，采用innerhtml解决

下述是原解决方案

```tsx
const format_style = (style: string) => {
    const d = style.split(";").map((e) => e.split(":"))
    const s: { [key: string]: string } = {}
    d.forEach((e) => {
        switch (e[0]) {
            case "border-color":
                s["borderColor"] = e[1]
                break
            case "background":
                s["background"] = e[1]
                break
            default:
                s[e[0]] = e[1]
        }
    })
    console.log(s)
    return s
}

<Link prefetch={false} key={e.href + tag.title} href={`/tag/${tag.title}`} >
    <button className="shadowed small" style={tag.style ? format_style(tag.style) : {}} >
        <div dangerouslySetInnerHTML={{ __html: TR(tag.title) }}></div>
    </button>
</Link>
```
初次刷新页面是正常的，background有的，但你点击上下页，无缝访问时候就出问题了

故采用如下解决方案：

```tsx
<Link prefetch={false} key={e.href + tag.title} href={`/tag/${tag.title}`}
    dangerouslySetInnerHTML={{ __html: `<button class="shadowed small" style=${tag.style}>${TR(tag.title)}</button>` }}>
</Link>
```

**新解决方案：**

background失效原因是因为在末尾包含了`!important`，replace即可恢复正常

```json
{
  color: '#090909',
  borderColor: '#FFD8F3',
  background: 'radial-gradient(#FFD8F3,#dfb8d3) !important'
}
```

# 2. app/app/s/[page_token]/[gallery_id]/client.tsx

首先是最开始的onError触发，但没用，更新的是`data-src`而不是`src`

然后在是去除了lazyload之后，onError不触发

```tsx
<img
    id="pic_cover"
    // loading="lazy"
    className="lazyload blur-up"
    // data-src={src}
    src={src}
    style={{ width: "100%", minHeight: 800 }}
    onError={() => seterror(error + 1)}
/>
```

MPVImage中的如下示例又是正常的,初步判断是同步错误速度产生过快(测试中直接使用μblock屏蔽了请求)

`app/app/mpv/[gallery_id]/[gallery_token]/Image.tsx`

```tsx
<img
    id="pic_cover"
    loading="eager"
    className="lazyload blur-up"
    src={get_url()}
    onError={() => seterror(error + 1)}
    style={{ width: "100%", minHeight: 800 }}
/>
```

先这么处理了再说，现在就是存在两套不同的方案，一套同步(MPVimage)，一套异步(s)

# 3. ServerAction出错无法被catch

ServerAction内部的逻辑导致无论是try catch还是then catch都无法奏效

最为简单的处理方式是直接切换为传统api访问，请求完全由客户端自定义，而不是裹挟在next的ServerAction中进行，但是与之而来的是相对麻烦：类型校验/设置、接口配置等等


# 4. @gfav

在列表页快速收藏任何画廊，但是存在一个问题，弹出弹窗时会将页面拉至顶部，原因未知

但是在详情页，收藏，不会将页面强行拉直顶部

在实际中，这个并行路由的元素总是被添加到`</body>`之前(末尾位置)，无论你layout怎么写

连Suspense也是不生效的
```tsx
<Suspense fallback={<Loading />}>
    {children}
</Suspense>
```

两种不同情况，两种不同反应，很难办啊

**经过分析**

问题原因在于`searchParams`

1. `mui/app/g/[gallery_id]/[gallery_token]/page.tsx` 正常

2. `mui/app/favorites/page.tsx` 不正常

二者均对`searchParams`进行了不同程度的使用

1. 取出了一个变量`searchParams.p`进行使用，该变量为页数

2. 则是直接将整个`searchParams`传递到API实现进行URL拼接，但在实际上产生了新的fetch请求

当然，是推测是产生了新的请求，原本的缓存由fetch的选项实现，实际上的原理并不清楚

```ts
async get(url: URL | string, tags: string[] | undefined, revalidate: number | false | undefined = 7200) {
    const r = await fetch(url, {
        headers: this.header,
        next: {
            revalidate: revalidate,
            tags: tags
        }
    })
    console.log(r.headers.getSetCookie())
    r.headers.getSetCookie().forEach((e) => this.cookies.push(e))
    return r
}
```

当按下述代码将内容强制缓存之后，确实不会强制弹到顶部，之后存在一点上下位移，可以忽略不计

```tsx
const { index: [d, prev, next], fav: fav } = await CacheEveryThing(async () => {
    console.log(searchParams);
    return a.favourite(searchParams)
}, [searchParams.next ?? "next", searchParams.prev ?? "prev"], 3600)()
```

但，强制缓存并不明智

最终选择对传入参数进行处理

```tsx
//在EXAPI.ts中的最远处理
for (let i in searchParams) {
    if (!["gallery_id", "gallery_token"].includes(i)) u.searchParams.set(i, searchParams[i])
}

//在page.tsx中的最近处理
const search = { ...searchParams } //必须复制，不能对原searchParams进行修改，否则并行路由会没反应
delete search.gallery_id
delete search.gallery_token
console.log(search);
```

很遗憾，在开发环境中上述各种策略时有生效，但在生产环境下均完全不奏效

# 5 mui/components/LinkFix.tsx(已修复,待优化)

更新Nextjs版本到16.0.0+后出现的兼容性问题

mui/components/LinkFix.tsx

直接在MUI的Button使用Link会报错：

Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.

```<Button LinkComponent={Link}/>```

https://github.com/mui/material-ui/issues/47109


# 6 vercel nodejs最高版本低于jsdom最新版最低版本要求

会报错显示

```js
Error [ERR_REQUIRE_ESM]: require() of ES Module /dev/test-jsdom/node_modules/parse5/dist/index.js from /dev/test-jsdom/node_modules/jsdom/lib/jsdom/browser/parser/html.js not supported.
Instead change the require of index.js in /dev/test-jsdom/node_modules/jsdom/lib/jsdom/browser/parser/html.js to a dynamic import() which is available in all CommonJS modules.
    at TracingChannel.traceSync (node:diagnostics_channel:315:14)
    at Object.<anonymous> (/dev/test-jsdom/node_modules/jsdom/lib/jsdom/browser/parser/html.js:3:16) {
  code: 'ERR_REQUIRE_ESM'
}

Node.js v22.11.0
```

https://github.com/jsdom/jsdom/issues/3959