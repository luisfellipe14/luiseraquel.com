"""Validate the built project-site asset paths and social metadata."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote
import hashlib

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist/pages'
PREFIX = '/convite-luis-raquel'
ORIGIN = 'https://luisfellipe.com'

class Page(HTMLParser):
    def __init__(self, html):
        super().__init__()
        self.references = []
        self.meta = {}
        self.feed(html)

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag == 'meta':
            self.meta[attrs.get('property', attrs.get('name'))] = attrs.get('content')
        for key in ('src', 'href'):
            if value := attrs.get(key):
                self.references.append(value)

assert (DIST / 'index.html').exists(), 'Build the Pages export first'
assert (DIST / '.nojekyll').is_file(), 'Pages must serve _next without Jekyll filtering'
assert '*.pdf binary' in (DIST / '.gitattributes').read_text()
html = (DIST / 'index.html').read_text(encoding='utf-8')
page = Page(html)
assert page.meta['og:url'] == ORIGIN + PREFIX
assert page.meta['og:image'] == ORIGIN + PREFIX + '/og-capa-1080-v3.jpg'
assert page.meta['og:image:width'] == '1080' and page.meta['og:image:height'] == '1920'
count = 0
for reference in page.references:
    url = urlparse(reference)
    if url.netloc or not url.path:
        continue
    path = unquote(url.path)
    assert path.startswith(PREFIX + '/'), f'Unprefixed local reference: {reference}'
    target = DIST / path.removeprefix(PREFIX + '/')
    assert target.is_file(), f'Missing public asset: {target}'
    count += 1
assert count >= 6
for path in ('images/flores.webp', 'images/flor-central.jpg', 'casamento-luis-raquel.ics', 'Convite-Luis-e-Raquel.pdf'):
    assert PREFIX + '/' + path in html
assert hashlib.sha256((DIST / 'og-capa.jpg').read_bytes()).hexdigest() == 'a057072336f00df446e33022f5c441095d910b99d2afa15674ee947cb4015d92'
assert hashlib.sha256((DIST / 'og-capa-1080-v3.jpg').read_bytes()).hexdigest() == '729556d1b07e3a2da116fbe603cec5eadc2c8152bc44496d641183aa8bede363'
print(f'PASS: {count} local references, social URLs and original cover in Pages export')
