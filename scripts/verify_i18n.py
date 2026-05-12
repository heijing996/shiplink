#!/usr/bin/env python3
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from threading import Thread
from urllib.parse import quote
from urllib.request import urlopen
import re
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
INTERNAL_ROOT_LINK_RE = re.compile(r'href="\.\./(?:services|inquiry|contact)\.html[^"]*"')
ALLOWED_CROSS_LANGUAGE_TEXT = ('简体', '繁體')


def is_allowed_cross_language_link(match, html):
    tag_start = html.rfind('<', 0, match.start())
    tag_end = html.find('>', match.end())
    if tag_start == -1 or tag_end == -1:
        return False
    tag = html[tag_start:tag_end + 1]
    if tag.startswith('<link '):
        return 'rel="alternate"' in tag
    if not tag.startswith('<a '):
        return False
    end = html.find('</a>', tag_end)
    if end == -1:
        return False
    link_text = html[tag_end + 1:end]
    return any(text in link_text for text in ALLOWED_CROSS_LANGUAGE_TEXT)
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
    if lang != "en":
        assert "Open main menu" not in html, f"{page} has English sr-only menu text"
    assert "fab fa-weixin" not in html and "fab fa-linkedin" not in html, f"{page} has placeholder social icon"
    if page.startswith('/en/') or page.startswith('/zh-hant/'):
        for match in INTERNAL_ROOT_LINK_RE.finditer(html):
            assert is_allowed_cross_language_link(match, html), f"{page} has root-language internal link: {match.group(0)}"
    if "/tracking.html" in page:
        for phrase in FORBIDDEN_TRACKING_PHRASES:
            assert phrase not in html, f"{page} still contains misleading tracking phrase: {phrase}"


def main():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        port = sock.getsockname()[1]

    handler = partial(SimpleHTTPRequestHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", port), handler)
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
