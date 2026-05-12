# 外贸物流官网国际化设计规格

## 目标

将当前静态外贸物流官网从单一简体中文站，扩展为简体中文、英文、繁体中文三语言站点。第一轮重点是让海外客户可以用英文完成从了解服务到提交询价的完整路径，同时为港台客户提供繁体中文入口。

## 范围

第一轮覆盖当前 7 个页面：

- `index.html`：首页
- `about.html`：关于我们
- `services.html`：服务中心
- `news.html`：物流知识
- `tracking.html`：货物追踪 / 人工查询说明
- `inquiry.html`：在线询价
- `contact.html`：联系我们

第一轮不引入构建工具，不改成单页应用，不接入 CMS，不新增数据库，不改 Formspree endpoint。

## URL 结构

保留现有根目录作为简体中文站：

- `/index.html`
- `/about.html`
- `/services.html`
- `/news.html`
- `/tracking.html`
- `/inquiry.html`
- `/contact.html`

新增英文站目录：

- `/en/index.html`
- `/en/about.html`
- `/en/services.html`
- `/en/news.html`
- `/en/tracking.html`
- `/en/inquiry.html`
- `/en/contact.html`

新增繁体中文站目录：

- `/zh-hant/index.html`
- `/zh-hant/about.html`
- `/zh-hant/services.html`
- `/zh-hant/news.html`
- `/zh-hant/tracking.html`
- `/zh-hant/inquiry.html`
- `/zh-hant/contact.html`

根目录不重定向到英文，避免影响现有中文路径和本地验收习惯。

## 语言与 SEO

每个页面设置对应的 `lang`：

- 简体中文：`zh-CN`
- 英文：`en`
- 繁体中文：`zh-Hant`

每组对应页面都添加 `hreflang`：

```html
<link rel="alternate" hreflang="zh-CN" href="../index.html">
<link rel="alternate" hreflang="en" href="../en/index.html">
<link rel="alternate" hreflang="zh-Hant" href="../zh-hant/index.html">
<link rel="alternate" hreflang="x-default" href="../en/index.html">
```

实际路径需要按页面所在目录调整。根目录页面使用相对路径 `en/...` 和 `zh-hant/...`；子目录页面使用 `../...`。

每个语言版本都要本地化：

- `<title>`
- 页面首屏标题
- meta description（如当前页面没有 description，则本轮可补齐）
- 导航文字
- CTA 文案
- 表单 label、placeholder、按钮、反馈文案
- 页脚联系方式说明

英文站不是逐字翻译，而是按海外客户搜索和询盘习惯重写。核心关键词包括：

- China Freight Forwarder
- Freight Forwarder in Shenzhen
- Sea Freight from China
- Air Freight from China
- Customs Clearance
- Trucking and Warehousing
- Cross-border Logistics
- Get a Freight Quote

繁体中文站以自然繁体表达为主，避免简繁混杂。

## 导航与语言切换

每个页面导航栏增加语言切换入口：

- 简体
- EN
- 繁體

切换规则：

- 在首页切换语言时，跳到对应语言首页。
- 在服务页切换语言时，跳到对应语言服务页。
- 在询价页切换语言时，保留页面级别，不强制保留查询参数。
- 当前语言使用高亮或不可点击状态，避免用户不知道自己在哪个版本。

移动端菜单也需要包含语言切换入口，保证手机用户可切换语言。

## 站内链接规则

同语言内部跳转必须留在同语言目录内。

示例：英文服务页内的询价按钮应跳到：

```html
<a href="inquiry.html?service=sea-freight">Get a Quote</a>
```

因为该链接位于 `/en/services.html`，所以相对路径会进入 `/en/inquiry.html?service=sea-freight`。

繁体中文服务页同理：

```html
<a href="inquiry.html?service=sea-freight">索取海運報價</a>
```

根目录简体中文站继续使用当前链接规则。

## 表单与参数

三语言站共用当前 Formspree endpoint：

```html
https://formspree.io/f/mgvkgzvj
```

`service` 参数继续使用同一组稳定键名：

- `sea-freight`
- `air-freight`
- `land-transport`
- `customs`
- `warehousing`
- `ecommerce-logistics`

`subject` 参数继续用于联系页主题预填。

`assets/js/main.js` 需要根据当前页面语言输出本地化反馈文案。语言来源按以下优先级判断：

1. `document.documentElement.lang`
2. URL 路径前缀 `/en/` 或 `/zh-hant/`
3. 默认 `zh-CN`

表单提交成功和失败文案需支持三语言。字段 `name` 保持英文下划线风格，避免影响 Formspree 数据接收。

## 内容策略

### 英文首页

英文首页重点不是介绍公司历史，而是快速回答海外客户关心的问题：

- Can you ship from China to my country?
- What information do I need for a quote?
- Do you handle sea freight, air freight, trucking, customs and warehousing?
- How can I contact a real person?

首屏推荐表达：

```text
China Freight Forwarder for Sea, Air, Trucking and Customs
Get a practical shipping quote from Shenzhen to worldwide destinations.
```

### 英文服务页

服务页按服务拆分，每个服务都要有明确询价入口：

- Sea Freight
- Air Freight
- Trucking / Inland Transport
- Customs Clearance
- Warehousing and Delivery
- Small-batch / Cross-border Logistics

### 英文追踪页

追踪页必须延续上一轮的真实性原则。英文页面不得暗示已接入实时追踪接口。推荐表达：

```text
This website is not connected to carrier or airline real-time tracking systems. Please contact our team with your BL number, order number or container number for manual status checking.
```

### 繁体中文站

繁体中文站可以基于简体中文内容转换，但关键 CTA 和说明要自然化。例如：

- 在线询价 → 線上詢價
- 联系我们 → 聯絡我們
- 货物追踪 → 貨物查詢
- 国际海运 → 國際海運
- 报关服务 → 報關服務

## 技术方案

采用静态页面复制方案：

1. 保留根目录简体中文页面。
2. 新建 `/en/` 和 `/zh-hant/` 目录。
3. 复制当前 7 个页面到两个目录。
4. 分别替换页面语言、标题、导航、正文、表单和页脚文案。
5. 调整同语言站内链接和语言切换链接。
6. 扩展 `assets/js/main.js` 的本地化文案映射。
7. 保持 `assets/css/style.css` 和图片资源共用。

这样可以避免引入构建流程，同时让搜索引擎直接抓取每个语言页面。

## 验收标准

第一轮完成后，以下路径必须能返回 200：

- `/index.html`
- `/en/index.html`
- `/zh-hant/index.html`
- `/en/services.html`
- `/zh-hant/services.html`
- `/en/inquiry.html?service=air-freight`
- `/zh-hant/inquiry.html?service=sea-freight`
- `/en/contact.html?subject=Shipment%20Status%20Check`
- `/zh-hant/contact.html?subject=貨物狀態查詢`

页面级检查：

- 每个页面的 `html lang` 正确。
- 每个页面有三语言切换入口。
- 每个页面的主要导航链接留在当前语言目录。
- 英文页面没有大段中文正文残留。
- 繁体页面没有大段简体正文残留。
- 英文和繁体询价页能根据 `service` 参数预填服务意图。
- 英文和繁体联系页能根据 `subject` 参数预填主题。
- 英文和繁体追踪页都明确说明未接入实时追踪接口。
- 移动端菜单在三语言页面均可展开和收起。

命令级检查：

```bash
git diff --check
node --check assets/js/main.js
python -m http.server 8000
```

并通过脚本或人工浏览确认关键页面返回 200。

## 不在第一轮范围内

- 不引入 Astro、Next.js、Vite 等构建工具。
- 不做自动语言识别跳转。
- 不创建独立 CMS。
- 不做机器翻译运行时切换。
- 不新增隐私政策、条款页面。
- 不虚构海外分公司、资质、客户案例或实时追踪能力。
- 不改 Formspree endpoint。
- 不 push 到远端。
