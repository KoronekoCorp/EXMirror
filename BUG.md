# 1. app/app/GDatas.tsx

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