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