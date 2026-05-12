# 外贸物流官网国际化实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将当前静态外贸物流官网扩展为简体中文、英文、繁体中文三语言站点，并保持询价、联系和人工查询路径可用。

**架构：** 保留根目录作为简体中文站，新增 `/en/` 和 `/zh-hant/` 两套静态页面目录。三语言共用 `assets/css/style.css`、`assets/js/main.js`、图片资源和 Formspree endpoint；每个语言版本独立维护 HTML 文案、SEO 标记、导航链接和表单提示。

**技术栈：** 静态 HTML、Tailwind CDN、Font Awesome CDN、原生 JavaScript、Formspree、Python 标准库静态验收脚本。

---

## Context

设计规格位于 `docs/superpowers/specs/2026-05-12-site-internationalization-design.md`。当前站点是静态 HTML 结构，根目录已有 7 个页面：`index.html`、`about.html`、`services.html`、`news.html`、`tracking.html`、`inquiry.html`、`contact.html`。上一轮已经完成首页转化、Formspree 表单反馈、服务参数预填、追踪页人工查询说明和移动端 CTA。

第一轮国际化的重点不是引入框架，而是快速建立可抓取、可人工验收、可提交询价的三语言静态站。英文站应按海外买家询盘习惯重写，不做直译；繁体中文站应自然繁体化，避免简繁混杂。

## 文件结构与职责

- 创建：`scripts/verify_i18n.py`
  - 职责：自动检查三语言页面是否存在、返回 200、`html lang` 是否正确、关键链接和追踪页真实性文案是否存在。
  - 说明：只使用 Python 标准库，不引入项目依赖。

- 修改：根目录 7 个 HTML 页面
  - 职责：继续作为简体中文站；补充 `hreflang`、语言切换入口、必要的 meta description；确保中文站内链接仍指向根目录页面。
  - 文件：`index.html`、`about.html`、`services.html`、`news.html`、`tracking.html`、`inquiry.html`、`contact.html`

- 创建：`en/index.html`、`en/about.html`、`en/services.html`、`en/news.html`、`en/tracking.html`、`en/inquiry.html`、`en/contact.html`
  - 职责：英文站完整页面；`html lang="en"`；站内链接留在 `/en/`；文案按海外询盘场景重写。

- 创建：`zh-hant/index.html`、`zh-hant/about.html`、`zh-hant/services.html`、`zh-hant/news.html`、`zh-hant/tracking.html`、`zh-hant/inquiry.html`、`zh-hant/contact.html`
  - 职责：繁体中文站完整页面；`html lang="zh-Hant"`；站内链接留在 `/zh-hant/`；文案自然繁体化。

- 修改：`assets/js/main.js`
  - 职责：保留移动菜单、年份、URL 参数预填、Formspree 提交逻辑；新增三语言 service label、cargo mode、成功失败反馈文案。

- 可选修改：`assets/css/style.css`
  - 职责：仅在语言切换器需要小范围响应式样式时追加；优先使用 Tailwind class，避免新增 CSS。

## 并行执行策略

第一批并行：

1. 子代理 A：自动验收脚本和根目录简体中文国际化骨架。
2. 子代理 B：英文首页、关于、服务页。
3. 子代理 C：英文询价、联系、追踪、物流知识页。
4. 子代理 D：繁体中文 7 个页面。

第二批串行：

5. 集成代理：合并三语言页面链接、`main.js` 本地化、全站验收脚本修正。
6. 最终审查代理：检查 SEO、链接、语言残留、表单、追踪页真实性和移动端菜单。

并行代理不得同时修改同一个文件。第一批中只有子代理 A 修改根目录页面和创建验收脚本；子代理 B 只创建或修改 `en/index.html`、`en/about.html`、`en/services.html`；子代理 C 只创建或修改 `en/news.html`、`en/tracking.html`、`en/inquiry.html`、`en/contact.html`；子代理 D 只创建或修改 `zh-hant/*.html`。`assets/js/main.js` 由第二批集成代理独占。

## 任务 1：建立国际化验收脚本与中文站语言骨架

**文件：**
- 创建：`scripts/verify_i18n.py`
- 修改：`index.html`
- 修改：`about.html`
- 修改：`services.html`
- 修改：`news.html`
- 修改：`tracking.html`
- 修改：`inquiry.html`
- 修改：`contact.html`

- [ ] **步骤 1：确认开始状态**

运行：

```bash
git status --short
git log --oneline -3
```

预期：当前分支包含 `7b3081f docs(官网): 添加国际化设计规格`，且没有已修改的 HTML 文件。如果存在用户未提交改动，先汇报并暂停。

- [ ] **步骤 2：创建失败的国际化验收脚本**

创建 `scripts/verify_i18n.py`，内容如下：

```python
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from threading import Thread
from urllib.parse import quote
from urllib.request import urlopen
import socket

ROOT = Path(__file__).resolve().parents[1]

PAGES = [
    ("/index.html", "zh-CN", "深圳国际货代"),
    ("/about.html", "zh-CN", "关于厦普林克"),
    ("/services.html", "zh-CN", "服务中心"),
    ("/news.html", "zh-CN", "物流知识"),
    ("/tracking.html", "zh-CN", "未接入船司、航司或第三方实时追踪接口"),
    ("/inquiry.html?service=air-freight", "zh-CN", "在线询价"),
    ("/contact.html?subject=" + quote("货物状态查询"), "zh-CN", "联系我们"),
    ("/en/index.html", "en", "China Freight Forwarder"),
    ("/en/about.html", "en", "About ShipLink"),
    ("/en/services.html", "en", "Freight Services"),
    ("/en/news.html", "en", "Logistics Knowledge"),
    ("/en/tracking.html", "en", "not connected to carrier or airline real-time tracking systems"),
    ("/en/inquiry.html?service=air-freight", "en", "Get a Freight Quote"),
    ("/en/contact.html?subject=Shipment%20Status%20Check", "en", "Contact Us"),
    ("/zh-hant/index.html", "zh-Hant", "深圳國際貨代"),
    ("/zh-hant/about.html", "zh-Hant", "關於廈普林克"),
    ("/zh-hant/services.html", "zh-Hant", "服務中心"),
    ("/zh-hant/news.html", "zh-Hant", "物流知識"),
    ("/zh-hant/tracking.html", "zh-Hant", "未接入船司、航司或第三方即時追蹤接口"),
    ("/zh-hant/inquiry.html?service=sea-freight", "zh-Hant", "線上詢價"),
    ("/zh-hant/contact.html?subject=" + quote("貨物狀態查詢"), "zh-Hant", "聯絡我們"),
]

FORBIDDEN_TRACKING_PHRASES = [
    "实时掌握",
    "即時掌握",
    "Real-time tracking",
    "运输途中",
    "運輸途中",
    "预计到达",
    "預計到達",
    "Simulating tracking",
]

LANG_LINKS = ["hreflang=\"zh-CN\"", "hreflang=\"en\"", "hreflang=\"zh-Hant\""]


def read_url(port, page):
    with urlopen(f"http://127.0.0.1:{port}{page}", timeout=5) as response:
        body = response.read().decode("utf-8")
        assert response.status == 200, f"{page} returned {response.status}"
        return body


def verify_html(page, lang, marker, html):
    assert f"lang=\"{lang}\"" in html or f"lang='{lang}'" in html, f"{page} missing lang {lang}"
    assert marker in html, f"{page} missing marker {marker}"
    for link in LANG_LINKS:
        assert link in html, f"{page} missing {link}"
    assert "Open main menu" not in html, f"{page} has English sr-only menu text"
    assert "fab fa-weixin" not in html and "fab fa-linkedin" not in html, f"{page} has placeholder social icon"
    if "/tracking.html" in page:
        for phrase in FORBIDDEN_TRACKING_PHRASES:
            assert phrase not in html, f"{page} still contains misleading tracking phrase: {phrase}"


def main():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        port = sock.getsockname()[1]

    server = ThreadingHTTPServer(("127.0.0.1", port), SimpleHTTPRequestHandler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()

    try:
        for page, lang, marker in PAGES:
            html = read_url(port, page)
            verify_html(page, lang, marker, html)
            print(f"OK {page} [{lang}]")
        print("i18n verification passed")
    finally:
        server.shutdown()


if __name__ == "__main__":
    main()
```

- [ ] **步骤 3：运行脚本确认失败**

运行：

```bash
python scripts/verify_i18n.py
```

预期：失败，报错包含 `/en/index.html` 返回 404 或缺少英文页面。这证明验收脚本能发现国际化页面未完成。

- [ ] **步骤 4：给根目录 7 个中文页面补 `hreflang`**

在每个根目录页面的 `<head>` 中，`<link rel="stylesheet" href="assets/css/style.css">` 后追加对应页面的 alternate links。

`index.html` 使用：

```html
<link rel="alternate" hreflang="zh-CN" href="index.html">
<link rel="alternate" hreflang="en" href="en/index.html">
<link rel="alternate" hreflang="zh-Hant" href="zh-hant/index.html">
<link rel="alternate" hreflang="x-default" href="en/index.html">
```

其他页面按文件名替换。例如 `about.html` 使用：

```html
<link rel="alternate" hreflang="zh-CN" href="about.html">
<link rel="alternate" hreflang="en" href="en/about.html">
<link rel="alternate" hreflang="zh-Hant" href="zh-hant/about.html">
<link rel="alternate" hreflang="x-default" href="en/about.html">
```

`services.html`、`news.html`、`tracking.html`、`inquiry.html`、`contact.html` 同样按文件名处理。

- [ ] **步骤 5：给根目录 7 个中文页面补语言切换器**

在桌面导航链接列表最后一个 `联系我们` 链接后追加：

```html
<div class="flex items-center border-l border-dark-border pl-4 ml-2 space-x-2 text-sm">
    <span class="text-white font-semibold">简体</span>
    <a href="en/index.html" class="text-dark-text-secondary hover:text-white">EN</a>
    <a href="zh-hant/index.html" class="text-dark-text-secondary hover:text-white">繁體</a>
</div>
```

每个页面要把 `en/index.html` 和 `zh-hant/index.html` 替换成对应文件名。例如 `services.html` 中应为：

```html
<a href="en/services.html" class="text-dark-text-secondary hover:text-white">EN</a>
<a href="zh-hant/services.html" class="text-dark-text-secondary hover:text-white">繁體</a>
```

在移动端菜单最后一个页面链接后追加：

```html
<div class="border-t border-dark-border pt-3 mt-3 px-3 flex items-center gap-4 text-base">
    <span class="text-white font-semibold">简体</span>
    <a href="en/index.html" class="text-dark-text-secondary hover:text-white">EN</a>
    <a href="zh-hant/index.html" class="text-dark-text-secondary hover:text-white">繁體</a>
</div>
```

同样按当前页面文件名替换语言切换链接。

- [ ] **步骤 6：补中文页面 meta description**

如果页面 `<head>` 中没有 meta description，在 `<meta name="viewport" ...>` 后追加对应描述：

`index.html`：

```html
<meta name="description" content="厦普林克国际物流位于深圳，提供中国发全球的国际海运、空运、拖车、报关、仓储配送和外贸物流询价服务。">
```

`about.html`：

```html
<meta name="description" content="了解厦普林克国际物流（深圳）有限公司，我们服务工厂、外贸公司和进出口企业，协助判断运输方式、准备资料并获取报价方向。">
```

`services.html`：

```html
<meta name="description" content="厦普林克国际物流提供国际海运、国际空运、拖车陆运、报关服务、仓储配送和跨境小批量物流服务。">
```

`news.html`：

```html
<meta name="description" content="外贸物流知识与国际运输常见问题，帮助工厂和外贸企业了解海运、空运、报关、拖车和询价资料准备。">
```

`tracking.html`：

```html
<meta name="description" content="货物状态人工查询入口。当前网站未接入船司、航司或第三方实时追踪接口，请联系人工客服核实货物状态。">
```

`inquiry.html`：

```html
<meta name="description" content="提交国际物流询价需求，提供品名、起运地、目的地、重量体积和时效要求，获取海运、空运、拖车、报关或仓储配送报价方向。">
```

`contact.html`：

```html
<meta name="description" content="联系厦普林克国际物流，电话、微信、WhatsApp：0086-13129567120，邮箱：MichaelZhang@szshiplink.com。">
```

- [ ] **步骤 7：运行局部验证**

运行：

```bash
git diff --check
python scripts/verify_i18n.py
```

预期：`git diff --check` 通过；`python scripts/verify_i18n.py` 仍失败，因为英文和繁体页面还未创建。失败位置应在 `/en/` 或 `/zh-hant/`，不应是根目录中文页面。

- [ ] **步骤 8：提交任务 1**

运行：

```bash
git add scripts/verify_i18n.py index.html about.html services.html news.html tracking.html inquiry.html contact.html
git commit -m "feat(官网): 添加国际化验收与中文站语言入口"
```

## 任务 2：创建英文首页、关于页、服务页

**文件：**
- 创建：`en/index.html`
- 创建：`en/about.html`
- 创建：`en/services.html`

- [ ] **步骤 1：创建英文目录并复制基础页面**

运行：

```bash
mkdir -p en
cp index.html en/index.html
cp about.html en/about.html
cp services.html en/services.html
```

预期：`en/` 目录存在，3 个英文页面已创建。

- [ ] **步骤 2：调整 `en/index.html` 基础路径和语言**

将顶部改为：

```html
<html lang="en" class="dark">
```

将资源路径改为：

```html
<link rel="stylesheet" href="../assets/css/style.css">
<img class="h-10 w-auto" src="../assets/images/companylogo.jpg" alt="ShipLink International Logistics Logo">
<script src="../assets/js/main.js"></script>
```

页面中所有 `assets/images/`、`assets/css/`、`assets/js/` 路径都要加 `../`。

- [ ] **步骤 3：替换 `en/index.html` SEO 与首屏文案**

将 title 和 description 改为：

```html
<title>China Freight Forwarder - ShipLink International Logistics</title>
<meta name="description" content="ShipLink International Logistics helps factories, trading companies and importers arrange sea freight, air freight, trucking, customs clearance and warehousing from China to worldwide destinations.">
```

将首屏 H1 改为：

```html
<h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
    <span class="block">China Freight Forwarder from Shenzhen</span>
    <span class="block text-sky-400 mt-3">Sea, air, trucking, customs and warehousing quotes</span>
</h1>
```

将首屏说明改为：

```html
<p class="mt-7 max-w-lg mx-auto text-xl text-gray-300 sm:max-w-3xl">
    For factories, trading companies and importers shipping from China. Share the product name, pickup city, destination, weight, volume and timing requirement, and we will suggest a practical shipping option.
</p>
```

将主要 CTA 改为：

```html
<a href="inquiry.html?service=sea-freight" class="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 md:py-4 md:text-lg md:px-10">
    <i class="fas fa-calculator mr-2"></i> Get a Freight Quote
</a>
<a href="tel:+8613129567120" class="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-sky-400 text-base font-medium rounded-md text-sky-400 bg-opacity-20 bg-sky-900 hover:bg-opacity-40 md:py-4 md:text-lg md:px-10">
    <i class="fas fa-phone-alt mr-2"></i> Call Us
</a>
```

- [ ] **步骤 4：调整 `en/index.html` 导航、语言切换和站内链接**

英文桌面导航使用：

```html
<a href="index.html" class="bg-dark-bg text-white px-3 py-2 rounded-md text-sm font-medium" aria-current="page">Home</a>
<a href="about.html" class="text-dark-text-secondary hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">About</a>
<a href="services.html" class="text-dark-text-secondary hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Services</a>
<a href="news.html" class="text-dark-text-secondary hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Knowledge</a>
<a href="tracking.html" class="text-dark-text-secondary hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Tracking</a>
<a href="inquiry.html" class="text-dark-text-secondary hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Quote</a>
<a href="contact.html" class="text-dark-text-secondary hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Contact</a>
<div class="flex items-center border-l border-dark-border pl-4 ml-2 space-x-2 text-sm">
    <a href="../index.html" class="text-dark-text-secondary hover:text-white">简体</a>
    <span class="text-white font-semibold">EN</span>
    <a href="../zh-hant/index.html" class="text-dark-text-secondary hover:text-white">繁體</a>
</div>
```

移动端菜单使用同样英文导航，并在底部追加语言切换：

```html
<div class="border-t border-dark-border pt-3 mt-3 px-3 flex items-center gap-4 text-base">
    <a href="../index.html" class="text-dark-text-secondary hover:text-white">简体</a>
    <span class="text-white font-semibold">EN</span>
    <a href="../zh-hant/index.html" class="text-dark-text-secondary hover:text-white">繁體</a>
</div>
```

- [ ] **步骤 5：调整 `en/index.html` 服务卡片文案**

首页核心服务卡片至少包含以下英文服务标题和链接文案：

```html
<h3 class="text-xl font-semibold text-dark-text-primary mb-2">Sea Freight from China</h3>
<p class="text-dark-text-secondary">LCL and FCL options for shipments from China to major worldwide ports.</p>
<a href="inquiry.html?service=sea-freight" class="mt-5 inline-flex items-center text-sm font-semibold text-sky-400 hover:text-sky-300">Ask for a sea freight quote <i class="fas fa-arrow-right ml-2"></i></a>
```

同页其他服务卡片使用：

- `Air Freight from China` / `Ask for an air freight quote` / `inquiry.html?service=air-freight`
- `Trucking and Inland Transport` / `Ask about trucking` / `inquiry.html?service=land-transport`
- `Warehousing and Delivery` / `Ask about warehousing` / `inquiry.html?service=warehousing`
- `Small-batch Cross-border Logistics` / `Ask about small-batch shipping` / `inquiry.html?service=ecommerce-logistics`
- `Customs Clearance Support` / `Ask about customs clearance` / `inquiry.html?service=customs`

- [ ] **步骤 6：调整 `en/about.html`**

将 title、description、导航和资源路径按英文页面规则调整。主要内容使用：

```html
<h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">About ShipLink</h1>
<p class="mt-6 max-w-3xl mx-auto text-xl text-gray-300">
    Based in Shenzhen, we help factories, trading companies and importers arrange practical freight solutions from China.
</p>
```

公司简介段落使用：

```html
<p>ShipLink International Logistics (Shenzhen) Co., Ltd. is based in Longhua, Shenzhen. We mainly serve factories, trading companies and cross-border businesses that need international shipping support from China.</p>
<p>Our services include sea freight, air freight, trucking, customs clearance, warehousing and delivery. If you are not sure whether to use LCL, FCL, air freight or door-to-door delivery, you can send us the cargo details first.</p>
<p>Phone / WeChat / WhatsApp: 0086-13129567120. Email: MichaelZhang@szshiplink.com. Address: Room 308, Building C, Tianhui Building, Longhua District, Shenzhen, China.</p>
```

- [ ] **步骤 7：调整 `en/services.html`**

将 title、description、导航和资源路径按英文页面规则调整。服务页标题使用：

```html
<h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">Freight Services from China</h1>
<p class="mt-6 max-w-3xl mx-auto text-xl text-gray-300">
    Sea freight, air freight, trucking, customs clearance, warehousing and cross-border logistics support for your China shipments.
</p>
```

服务 CTA 链接必须覆盖以下参数：

```html
<a href="inquiry.html?service=sea-freight">Get a Sea Freight Quote</a>
<a href="inquiry.html?service=air-freight">Get an Air Freight Quote</a>
<a href="inquiry.html?service=land-transport">Ask About Trucking</a>
<a href="inquiry.html?service=customs">Ask About Customs Clearance</a>
<a href="inquiry.html?service=warehousing">Ask About Warehousing</a>
<a href="inquiry.html?service=ecommerce-logistics">Ask About Small-batch Shipping</a>
```

保留原有按钮样式，只替换 `href` 和英文文字。

- [ ] **步骤 8：运行英文前三页局部验证**

运行：

```bash
git diff --check
python - <<'PY'
from pathlib import Path
for page, marker in {
    'en/index.html': 'China Freight Forwarder',
    'en/about.html': 'About ShipLink',
    'en/services.html': 'Freight Services',
}.items():
    html = Path(page).read_text(encoding='utf-8')
    assert 'lang="en"' in html, page
    assert marker in html, page
    assert '../assets/css/style.css' in html, page
    assert 'href="../index.html"' in html, page
    assert 'href="../zh-hant/' in html, page
print('English marketing pages verified')
PY
```

预期：输出 `English marketing pages verified`。

- [ ] **步骤 9：提交任务 2**

运行：

```bash
git add en/index.html en/about.html en/services.html
git commit -m "feat(官网): 添加英文首页关于与服务页"
```

## 任务 3：创建英文询价、联系、追踪、物流知识页

**文件：**
- 创建：`en/inquiry.html`
- 创建：`en/contact.html`
- 创建：`en/tracking.html`
- 创建：`en/news.html`

- [ ] **步骤 1：复制英文页面基础文件**

运行：

```bash
cp inquiry.html en/inquiry.html
cp contact.html en/contact.html
cp tracking.html en/tracking.html
cp news.html en/news.html
```

预期：`en/` 目录下 4 个页面已创建。

- [ ] **步骤 2：统一英文页面基础设置**

对 4 个页面执行以下调整：

- `<html lang="zh-CN" class="dark">` 改为 `<html lang="en" class="dark">`
- `assets/css/style.css` 改为 `../assets/css/style.css`
- `assets/js/main.js` 改为 `../assets/js/main.js`
- `assets/images/` 改为 `../assets/images/`
- 导航改为英文，并保证站内链接为 `index.html`、`about.html`、`services.html`、`news.html`、`tracking.html`、`inquiry.html`、`contact.html`
- 语言切换器中简体链接指向 `../对应文件名`，繁体链接指向 `../zh-hant/对应文件名`

- [ ] **步骤 3：调整 `en/inquiry.html`**

将 title 和 description 改为：

```html
<title>Get a Freight Quote - ShipLink International Logistics</title>
<meta name="description" content="Send your cargo details and request a freight quote for sea freight, air freight, trucking, customs clearance or warehousing from China.">
```

页面标题使用：

```html
<h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">Get a Freight Quote</h1>
<p class="mt-6 max-w-3xl mx-auto text-xl text-gray-300">
    Share the product name, pickup city, destination, weight, volume and timing requirement. We will help you choose a practical shipping option.
</p>
```

字段 label 和 placeholder 至少替换为：

```html
<label for="name" class="block text-sm font-medium text-dark-text-secondary">Your Name <span class="text-red-400">*</span></label>
<label for="email" class="block text-sm font-medium text-dark-text-secondary">Email <span class="text-red-400">*</span></label>
<label for="phone" class="block text-sm font-medium text-dark-text-secondary">Phone / WhatsApp</label>
<label for="origin" class="block text-sm font-medium text-dark-text-secondary">Pickup City in China</label>
<label for="destination" class="block text-sm font-medium text-dark-text-secondary">Destination</label>
<label for="cargoName" class="block text-sm font-medium text-dark-text-secondary">Cargo Name</label>
<label for="cargoWeight" class="block text-sm font-medium text-dark-text-secondary">Weight</label>
<label for="cargoVolume" class="block text-sm font-medium text-dark-text-secondary">Volume</label>
<label for="cargoMode" class="block text-sm font-medium text-dark-text-secondary">Preferred Shipping Mode</label>
<label for="cargoRemarks" class="block text-sm font-medium text-dark-text-secondary">Cargo Details / Requirements</label>
```

提交按钮文字改为：

```html
<i class="fas fa-paper-plane mr-2"></i> Submit Quote Request
```

条款说明改为：

```html
I confirm that the submitted information will be used for this freight quote request, and I agree to receive replies by phone, WeChat, WhatsApp or email.
```

成功区标题改为 `Quote request submitted`，失败区备用联系方式文案保留电话、微信、WhatsApp 和邮箱。

- [ ] **步骤 4：调整 `en/contact.html`**

将 title 和 description 改为：

```html
<title>Contact Us - ShipLink International Logistics</title>
<meta name="description" content="Contact ShipLink International Logistics in Shenzhen. Phone, WeChat and WhatsApp: 0086-13129567120. Email: MichaelZhang@szshiplink.com.">
```

页面标题使用：

```html
<h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">Contact Us</h1>
<p class="mt-6 max-w-3xl mx-auto text-xl text-gray-300">
    Send us your cargo details or contact us directly by phone, WeChat, WhatsApp or email.
</p>
```

联系信息标题替换为：

- Company Address
- Phone / WeChat / WhatsApp
- Email
- Business Hours
- Follow / Contact Us

联系表单字段替换为：

- Your Name
- Email
- Phone / WhatsApp
- Subject
- Message
- Send Message

“关注我们”说明改为：

```html
<p class="text-dark-text-secondary">Please add us directly on WeChat or WhatsApp: 0086-13129567120. Public LinkedIn or official account links will be added after they are ready.</p>
```

- [ ] **步骤 5：调整 `en/tracking.html`**

将 title 和 description 改为：

```html
<title>Shipment Status Check - ShipLink International Logistics</title>
<meta name="description" content="Manual shipment status checking entry. This website is not connected to carrier or airline real-time tracking systems.">
```

首屏使用：

```html
<h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">Shipment Status Check</h1>
<p class="mt-6 max-w-3xl mx-auto text-xl text-gray-300">
    This website is not connected to carrier or airline real-time tracking systems. Please contact our team with your BL number, order number or container number for manual status checking.
</p>
```

查询提示使用：

```html
<p class="mb-6 rounded-md border border-yellow-700 bg-yellow-900/20 px-4 py-3 text-sm text-yellow-200">
    Please use this page as a manual checking entry only. Final shipment status should be confirmed by our team through phone, WeChat, WhatsApp or email.
</p>
```

按钮文字使用：

```html
<i class="fas fa-search mr-2"></i> View Manual Checking Guide
```

人工联系按钮使用：

```html
<a href="contact.html?subject=Shipment%20Status%20Check" class="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-sky-400 text-base font-medium rounded-md text-sky-400 hover:bg-sky-900/40 transition-colors">
    <i class="fas fa-headset mr-2"></i> Contact Our Team
</a>
```

结果说明标题使用 `Manual Checking Guide`，不得出现 `Real-time tracking`、`Estimated arrival` 或固定运输状态。

- [ ] **步骤 6：调整 `en/news.html`**

将 title 和 description 改为：

```html
<title>Logistics Knowledge - ShipLink International Logistics</title>
<meta name="description" content="Practical logistics knowledge for sea freight, air freight, customs clearance, trucking and quote preparation for shipments from China.">
```

页面标题使用：

```html
<h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">Logistics Knowledge</h1>
<p class="mt-6 max-w-3xl mx-auto text-xl text-gray-300">
    Practical notes for preparing China shipments and requesting freight quotes.
</p>
```

文章卡片标题至少替换为英文摘要标题：

- What Information Is Needed for a Freight Quote?
- Sea Freight vs. Air Freight: How to Choose?
- Basic Documents for Export Customs Clearance

如果原页面有更多文章卡片，保留布局并将标题、摘要和按钮改为自然英文。

- [ ] **步骤 7：运行英文后四页局部验证**

运行：

```bash
git diff --check
python - <<'PY'
from pathlib import Path
checks = {
    'en/inquiry.html': ['lang="en"', 'Get a Freight Quote', 'Submit Quote Request'],
    'en/contact.html': ['lang="en"', 'Contact Us', 'Send Message'],
    'en/tracking.html': ['lang="en"', 'Shipment Status Check', 'not connected to carrier or airline real-time tracking systems'],
    'en/news.html': ['lang="en"', 'Logistics Knowledge'],
}
for page, markers in checks.items():
    html = Path(page).read_text(encoding='utf-8')
    for marker in markers:
        assert marker in html, f'{page} missing {marker}'
    assert '../assets/js/main.js' in html, page
    assert '../zh-hant/' in html, page
print('English conversion pages verified')
PY
```

预期：输出 `English conversion pages verified`。

- [ ] **步骤 8：提交任务 3**

运行：

```bash
git add en/inquiry.html en/contact.html en/tracking.html en/news.html
git commit -m "feat(官网): 添加英文询价联系追踪与知识页"
```

## 任务 4：创建繁体中文站 7 个页面

**文件：**
- 创建：`zh-hant/index.html`
- 创建：`zh-hant/about.html`
- 创建：`zh-hant/services.html`
- 创建：`zh-hant/news.html`
- 创建：`zh-hant/tracking.html`
- 创建：`zh-hant/inquiry.html`
- 创建：`zh-hant/contact.html`

- [ ] **步骤 1：创建繁体目录并复制页面**

运行：

```bash
mkdir -p zh-hant
cp index.html zh-hant/index.html
cp about.html zh-hant/about.html
cp services.html zh-hant/services.html
cp news.html zh-hant/news.html
cp tracking.html zh-hant/tracking.html
cp inquiry.html zh-hant/inquiry.html
cp contact.html zh-hant/contact.html
```

预期：`zh-hant/` 目录下 7 个页面已创建。

- [ ] **步骤 2：统一繁体页面基础设置**

对 7 个页面执行以下调整：

- `<html lang="zh-CN" class="dark">` 改为 `<html lang="zh-Hant" class="dark">`
- `assets/css/style.css` 改为 `../assets/css/style.css`
- `assets/js/main.js` 改为 `../assets/js/main.js`
- `assets/images/` 改为 `../assets/images/`
- 站内导航链接改为 `index.html`、`about.html`、`services.html`、`news.html`、`tracking.html`、`inquiry.html`、`contact.html`
- 语言切换器中简体链接指向 `../对应文件名`，英文链接指向 `../en/对应文件名`，当前语言显示为 `繁體`

- [ ] **步骤 3：替换繁体导航和通用页脚文案**

桌面导航使用：

```html
<a href="index.html">首頁</a>
<a href="about.html">關於我們</a>
<a href="services.html">服務中心</a>
<a href="news.html">物流知識</a>
<a href="tracking.html">貨物查詢</a>
<a href="inquiry.html">線上詢價</a>
<a href="contact.html">聯絡我們</a>
```

页脚通用标题使用：

- 關於我們
- 核心服務
- 快速連結
- 聯絡我們

联系方式保留原号码和邮箱，地址繁体化为：

```text
深圳市龍華區龍華街道富康社區天匯大廈 C 棟 3 樓 308
```

- [ ] **步骤 4：调整 `zh-hant/index.html` 首页文案**

title 和 description 使用：

```html
<title>深圳國際貨代，中國發全球 - 廈普林克國際物流</title>
<meta name="description" content="廈普林克國際物流位於深圳，提供中國發全球的國際海運、空運、拖車、報關、倉儲配送和外貿物流詢價服務。">
```

首屏 H1 使用：

```html
<h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
    <span class="block">深圳國際貨代，中國發全球</span>
    <span class="block text-sky-400 mt-3">海運、空運、拖車、報關都可以先詢價</span>
</h1>
```

CTA 使用：

```html
<a href="inquiry.html?service=sea-freight" class="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 md:py-4 md:text-lg md:px-10">
    <i class="fas fa-calculator mr-2"></i> 立即詢價
</a>
<a href="tel:+8613129567120" class="w-full sm:w-auto flex items-center justify-center px-8 py-3 border border-sky-400 text-base font-medium rounded-md text-sky-400 bg-opacity-20 bg-sky-900 hover:bg-opacity-40 md:py-4 md:text-lg md:px-10">
    <i class="fas fa-phone-alt mr-2"></i> 電話諮詢
</a>
```

- [ ] **步骤 5：调整 `zh-hant/services.html` 服务页文案**

服务标题使用：

- 國際海運
- 國際空運
- 拖車 / 陸運
- 報關服務
- 倉儲配送
- 小批量 / 跨境物流

服务 CTA 使用：

```html
<a href="inquiry.html?service=sea-freight">索取海運報價</a>
<a href="inquiry.html?service=air-freight">索取空運報價</a>
<a href="inquiry.html?service=land-transport">諮詢拖車 / 陸運</a>
<a href="inquiry.html?service=customs">諮詢報關服務</a>
<a href="inquiry.html?service=warehousing">諮詢倉儲配送</a>
<a href="inquiry.html?service=ecommerce-logistics">小批量物流詢價</a>
```

保留原有按钮样式，只替换 `href` 和繁体文字。

- [ ] **步骤 6：调整 `zh-hant/inquiry.html` 和 `zh-hant/contact.html`**

询价页标题使用：

```html
<title>線上詢價 - 廈普林克國際物流</title>
<h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">線上詢價</h1>
```

询价页字段使用繁体：

- 您的姓名
- 電子郵箱
- 聯絡電話 / WhatsApp
- 起運地
- 目的地
- 貨物品名
- 重量
- 體積
- 運輸方式
- 貨物詳情 / 需求
- 提交詢價

联系页标题使用：

```html
<title>聯絡我們 - 廈普林克國際物流</title>
<h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">聯絡我們</h1>
```

联系页字段使用繁体：

- 您的姓名
- 電子郵箱
- 聯絡電話
- 主題
- 留言內容
- 發送留言

- [ ] **步骤 7：调整 `zh-hant/tracking.html` 和 `zh-hant/news.html`**

繁体追踪页必须使用人工查询表达：

```html
<h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">貨物狀態查詢</h1>
<p class="mt-6 max-w-3xl mx-auto text-xl text-gray-300">
    如需查詢貨物狀態，請提交單號或直接聯絡專人核實。頁面僅提供人工查詢入口說明，不代表即時軌跡系統。
</p>
<p class="mb-6 rounded-md border border-yellow-700 bg-yellow-900/20 px-4 py-3 text-sm text-yellow-200">
    目前網站未接入船司、航司或第三方即時追蹤接口。請以客服透過電話、微信、WhatsApp 或電子郵箱核實的結果為準。
</p>
```

繁体物流知识页标题使用：

```html
<h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">物流知識</h1>
```

文章卡片标题至少繁体化为：

- 外貿物流詢價需要提供哪些資料？
- 海運和空運應該怎麼選？
- 出口報關通常需要哪些文件？

- [ ] **步骤 8：运行繁体站局部验证**

运行：

```bash
git diff --check
python - <<'PY'
from pathlib import Path
checks = {
    'zh-hant/index.html': ['lang="zh-Hant"', '深圳國際貨代', '立即詢價'],
    'zh-hant/about.html': ['lang="zh-Hant"', '關於廈普林克'],
    'zh-hant/services.html': ['lang="zh-Hant"', '服務中心', '索取海運報價'],
    'zh-hant/news.html': ['lang="zh-Hant"', '物流知識'],
    'zh-hant/tracking.html': ['lang="zh-Hant"', '貨物狀態查詢', '未接入船司、航司或第三方即時追蹤接口'],
    'zh-hant/inquiry.html': ['lang="zh-Hant"', '線上詢價'],
    'zh-hant/contact.html': ['lang="zh-Hant"', '聯絡我們'],
}
for page, markers in checks.items():
    html = Path(page).read_text(encoding='utf-8')
    for marker in markers:
        assert marker in html, f'{page} missing {marker}'
    assert '../assets/js/main.js' in html, page
    assert '../en/' in html, page
print('Traditional Chinese pages verified')
PY
```

预期：输出 `Traditional Chinese pages verified`。

- [ ] **步骤 9：提交任务 4**

运行：

```bash
git add zh-hant/index.html zh-hant/about.html zh-hant/services.html zh-hant/news.html zh-hant/tracking.html zh-hant/inquiry.html zh-hant/contact.html
git commit -m "feat(官网): 添加繁体中文站页面"
```

## 任务 5：集成 `main.js` 三语言表单反馈与参数预填

**文件：**
- 修改：`assets/js/main.js`
- 可选修改：`assets/css/style.css`

- [ ] **步骤 1：读取当前 `main.js`**

运行：

```bash
node --check assets/js/main.js
```

预期：无输出，说明当前 JS 语法有效。

- [ ] **步骤 2：新增语言检测和字典**

在 `DOMContentLoaded` 回调内，读取 URL 参数之前追加：

```js
const pageLang = document.documentElement.lang || 'zh-CN';
const normalizedLang = pageLang.toLowerCase();
const currentLang = normalizedLang.startsWith('en') ? 'en' : (normalizedLang.includes('hant') ? 'zh-Hant' : 'zh-CN');

const i18n = {
    'zh-CN': {
        serviceLabels: {
            'sea-freight': '国际海运询价',
            'air-freight': '国际空运询价',
            'land-transport': '拖车/陆运询价',
            'customs': '报关服务询价',
            'warehousing': '仓储配送询价',
            'ecommerce-logistics': '小批量/跨境物流询价'
        },
        submitting: '<i class="fas fa-spinner fa-spin mr-2"></i> 正在提交',
        success: '留言已提交，我们会尽快通过电话、微信、WhatsApp 或邮箱回复。',
        error: '提交失败。请直接通过电话 / 微信 / WhatsApp 联系：0086-13129567120。',
        inquiryError: '请稍后重试，或直接通过电话 / 微信 / WhatsApp 联系：0086-13129567120。'
    },
    en: {
        serviceLabels: {
            'sea-freight': 'Sea freight quote',
            'air-freight': 'Air freight quote',
            'land-transport': 'Trucking / inland transport quote',
            'customs': 'Customs clearance inquiry',
            'warehousing': 'Warehousing and delivery inquiry',
            'ecommerce-logistics': 'Small-batch / cross-border logistics inquiry'
        },
        submitting: '<i class="fas fa-spinner fa-spin mr-2"></i> Submitting',
        success: 'Your message has been submitted. We will reply by phone, WeChat, WhatsApp or email as soon as possible.',
        error: 'Submission failed. Please contact us directly by phone / WeChat / WhatsApp: 0086-13129567120.',
        inquiryError: 'Please try again later, or contact us directly by phone / WeChat / WhatsApp: 0086-13129567120.'
    },
    'zh-Hant': {
        serviceLabels: {
            'sea-freight': '國際海運詢價',
            'air-freight': '國際空運詢價',
            'land-transport': '拖車 / 陸運詢價',
            'customs': '報關服務詢價',
            'warehousing': '倉儲配送詢價',
            'ecommerce-logistics': '小批量 / 跨境物流詢價'
        },
        submitting: '<i class="fas fa-spinner fa-spin mr-2"></i> 正在提交',
        success: '留言已提交，我們會盡快透過電話、微信、WhatsApp 或電子郵箱回覆。',
        error: '提交失敗。請直接透過電話 / 微信 / WhatsApp 聯絡：0086-13129567120。',
        inquiryError: '請稍後重試，或直接透過電話 / 微信 / WhatsApp 聯絡：0086-13129567120。'
    }
};

const messages = i18n[currentLang];
```

- [ ] **步骤 3：替换 service label 逻辑**

将原来的：

```js
const serviceLabels = {
    'sea-freight': '国际海运询价',
    'air-freight': '国际空运询价',
    'land-transport': '拖车/陆运询价',
    'customs': '报关服务询价',
    'warehousing': '仓储配送询价',
    'ecommerce-logistics': '小批量/跨境物流询价'
};
cargoRemarks.value = serviceLabels[service] ? `咨询服务：${serviceLabels[service]}` : `咨询服务：${service}`;
```

替换为：

```js
const serviceLabel = messages.serviceLabels[service] || service;
const servicePrefix = currentLang === 'en' ? 'Service: ' : (currentLang === 'zh-Hant' ? '諮詢服務：' : '咨询服务：');
cargoRemarks.value = `${servicePrefix}${serviceLabel}`;
```

保留 `modeMap`，不要翻译 option value，因为表单 select 的 value 仍使用 `LCL`、`Air`、`Land`、`Multimodal`。

- [ ] **步骤 4：替换提交反馈文案**

在 `setupFormspreeForm` 中，将提交中按钮文案：

```js
submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> 正在提交';
```

替换为：

```js
submitButton.innerHTML = messages.submitting;
```

将联系表单成功反馈：

```js
feedback.textContent = '留言已提交，我们会尽快通过电话、微信、WhatsApp 或邮箱回复。';
```

替换为：

```js
feedback.textContent = messages.success;
```

将联系表单失败反馈：

```js
feedback.textContent = '提交失败。请直接通过电话 / 微信 / WhatsApp 联系：0086-13129567120。';
```

替换为：

```js
feedback.textContent = messages.error;
```

将询价错误区 message：

```js
message.textContent = '请稍后重试，或直接通过电话 / 微信 / WhatsApp 联系：0086-13129567120。';
```

替换为：

```js
message.textContent = messages.inquiryError;
```

- [ ] **步骤 5：检查语言切换器是否需要 CSS**

如果语言切换器在移动端菜单中使用 Tailwind class 后已经显示正常，不修改 `assets/css/style.css`。如果出现底部固定 CTA 和语言切换重叠，只允许在 `assets/css/style.css` 底部追加页面级选择器，示例：

```css
@media (max-width: 767px) {
    .language-switcher-mobile {
        border-top: 1px solid #334155;
    }
}
```

不要新增影响所有 `a` 或所有 `nav` 的宽泛选择器。

- [ ] **步骤 6：运行 JS 验证**

运行：

```bash
node --check assets/js/main.js
python - <<'PY'
from pathlib import Path
js = Path('assets/js/main.js').read_text(encoding='utf-8')
for marker in ['currentLang', 'Sea freight quote', '國際海運詢價', 'messages.submitting', 'messages.success', 'messages.error']:
    assert marker in js, marker
print('main.js i18n messages verified')
PY
```

预期：`node --check` 无输出；脚本输出 `main.js i18n messages verified`。

- [ ] **步骤 7：提交任务 5**

运行：

```bash
git add assets/js/main.js assets/css/style.css
git commit -m "feat(官网): 支持三语言表单反馈与询价预填"
```

如果 `assets/css/style.css` 没有修改，则运行：

```bash
git add assets/js/main.js
git commit -m "feat(官网): 支持三语言表单反馈与询价预填"
```

## 任务 6：全站集成验证与链接修正

**文件：**
- 修改：`scripts/verify_i18n.py`
- 修改：`index.html`
- 修改：`about.html`
- 修改：`services.html`
- 修改：`news.html`
- 修改：`tracking.html`
- 修改：`inquiry.html`
- 修改：`contact.html`
- 修改：`en/index.html`
- 修改：`en/about.html`
- 修改：`en/services.html`
- 修改：`en/news.html`
- 修改：`en/tracking.html`
- 修改：`en/inquiry.html`
- 修改：`en/contact.html`
- 修改：`zh-hant/index.html`
- 修改：`zh-hant/about.html`
- 修改：`zh-hant/services.html`
- 修改：`zh-hant/news.html`
- 修改：`zh-hant/tracking.html`
- 修改：`zh-hant/inquiry.html`
- 修改：`zh-hant/contact.html`

- [ ] **步骤 1：运行完整国际化验收脚本**

运行：

```bash
python scripts/verify_i18n.py
```

预期：如果失败，错误信息指出具体页面和缺失 marker。逐个修复页面，不要放宽断言绕过问题。

- [ ] **步骤 2：检查三语言页面数量**

运行：

```bash
python - <<'PY'
from pathlib import Path
root_pages = sorted(p.name for p in Path('.').glob('*.html'))
en_pages = sorted(p.name for p in Path('en').glob('*.html'))
hant_pages = sorted(p.name for p in Path('zh-hant').glob('*.html'))
expected = ['about.html', 'contact.html', 'index.html', 'inquiry.html', 'news.html', 'services.html', 'tracking.html']
assert root_pages == expected, root_pages
assert en_pages == expected, en_pages
assert hant_pages == expected, hant_pages
print('Page sets verified')
PY
```

预期：输出 `Page sets verified`。

- [ ] **步骤 3：检查英文页面中文残留**

运行：

```bash
python - <<'PY'
from pathlib import Path
allowed = ['简体', '繁體', '微信', 'WhatsApp', 'MichaelZhang', '0086']
for path in Path('en').glob('*.html'):
    html = path.read_text(encoding='utf-8')
    stripped = html
    for token in allowed:
        stripped = stripped.replace(token, '')
    has_cjk = any('一' <= ch <= '鿿' for ch in stripped)
    assert not has_cjk, f'{path} has unexpected Chinese text'
print('English pages have no unexpected Chinese text')
PY
```

预期：输出 `English pages have no unexpected Chinese text`。如果失败，优先翻译正文、导航、表单、页脚；语言切换器中的 `简体` 和 `繁體` 可以保留。

- [ ] **步骤 4：检查繁体页面简体残留**

运行：

```bash
python - <<'PY'
from pathlib import Path
simplified_markers = ['联系我们', '关于我们', '服务中心', '货物追踪', '在线询价', '国际海运', '报关服务', '仓储配送', '提交询价', '发送留言']
for path in Path('zh-hant').glob('*.html'):
    html = path.read_text(encoding='utf-8')
    for marker in simplified_markers:
        assert marker not in html, f'{path} has simplified marker {marker}'
print('Traditional Chinese pages have no common simplified markers')
PY
```

预期：输出 `Traditional Chinese pages have no common simplified markers`。

- [ ] **步骤 5：检查同语言站内链接**

运行：

```bash
python - <<'PY'
from pathlib import Path
for path in Path('en').glob('*.html'):
    html = path.read_text(encoding='utf-8')
    assert 'href="../services.html"' not in html, f'{path} links back to root services'
    assert 'href="../inquiry.html' not in html, f'{path} links back to root inquiry'
    assert 'href="../contact.html' not in html, f'{path} links back to root contact'
for path in Path('zh-hant').glob('*.html'):
    html = path.read_text(encoding='utf-8')
    assert 'href="../services.html"' not in html, f'{path} links back to root services'
    assert 'href="../inquiry.html' not in html, f'{path} links back to root inquiry'
    assert 'href="../contact.html' not in html, f'{path} links back to root contact'
print('Same-language internal links verified')
PY
```

预期：输出 `Same-language internal links verified`。语言切换器可以链接到 `../...` 和 `../en/...`，但正文、导航和 CTA 不应回到根目录。

- [ ] **步骤 6：运行完整静态检查**

运行：

```bash
git diff --check
node --check assets/js/main.js
python scripts/verify_i18n.py
```

预期：全部通过，`python scripts/verify_i18n.py` 输出 `i18n verification passed`。

- [ ] **步骤 7：浏览器人工验收**

运行：

```bash
python -m http.server 8000
```

浏览器打开并检查：

- `http://localhost:8000/index.html`
- `http://localhost:8000/en/index.html`
- `http://localhost:8000/zh-hant/index.html`
- `http://localhost:8000/en/services.html`
- `http://localhost:8000/zh-hant/services.html`
- `http://localhost:8000/en/inquiry.html?service=air-freight`
- `http://localhost:8000/zh-hant/inquiry.html?service=sea-freight`
- `http://localhost:8000/en/contact.html?subject=Shipment%20Status%20Check`
- `http://localhost:8000/zh-hant/contact.html?subject=貨物狀態查詢`
- `http://localhost:8000/en/tracking.html`
- `http://localhost:8000/zh-hant/tracking.html`

预期：语言切换可用；移动菜单可用；英文页面没有大段中文；繁体页面没有明显简体；询价页备注能根据参数预填；联系页主题能根据参数预填；追踪页只显示人工查询说明。

- [ ] **步骤 8：提交任务 6**

运行：

```bash
git status --short
git add scripts/verify_i18n.py index.html about.html services.html news.html tracking.html inquiry.html contact.html en zh-hant assets/js/main.js assets/css/style.css
git commit -m "feat(官网): 完成三语言站点集成"
```

如果 `assets/css/style.css` 没有修改，不影响 `git add` 命令；Git 会忽略未修改文件。

## 最终审查清单

- [ ] `docs/superpowers/specs/2026-05-12-site-internationalization-design.md` 中的所有范围项都有实现：根目录简体、`/en/` 英文、`/zh-hant/` 繁体。
- [ ] 21 个页面存在：根目录 7 个、英文 7 个、繁体 7 个。
- [ ] 每页有正确 `lang`。
- [ ] 每页有 `hreflang="zh-CN"`、`hreflang="en"`、`hreflang="zh-Hant"`。
- [ ] 每页有语言切换入口，桌面端和移动端都可见。
- [ ] 英文页面站内链接不跳回根目录中文页。
- [ ] 繁体页面站内链接不跳回根目录中文页。
- [ ] `assets/js/main.js` 能按 `document.documentElement.lang` 输出三语言服务预填和提交反馈。
- [ ] 英文和繁体追踪页没有暗示实时追踪能力。
- [ ] `python scripts/verify_i18n.py` 通过。
- [ ] `node --check assets/js/main.js` 通过。
- [ ] `git diff --check` 通过。
- [ ] 浏览器人工验收关键路径通过。

## 不在第一轮范围内

- 不引入 Astro、Next.js、Vite 或其他构建工具。
- 不做自动语言识别跳转。
- 不创建 CMS 或翻译管理系统。
- 不做运行时机器翻译。
- 不新增隐私政策或服务条款页面。
- 不虚构海外分公司、海外仓、资质、客户案例或实时追踪接口。
- 不修改 Formspree endpoint。
- 不 push 到远端。
