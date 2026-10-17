"""Check the Hugo output against the source work IDs, without third-party packages."""
from html.parser import HTMLParser
from pathlib import Path
import re
import sys

output = Path(sys.argv[1] if len(sys.argv) > 1 else 'public')

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.links = []
        self.images = []
        self.root = {}
        self.title = ''
        self.in_title = False
        self.description = ''
        self.feed(path.read_text())
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'html': self.root = attrs
        if tag == 'a': self.links.append(attrs)
        if tag == 'img': self.images.append(attrs)
        if tag == 'title': self.in_title = True
        if tag == 'meta' and attrs.get('name') == 'description': self.description = attrs['content']
    def handle_endtag(self, tag):
        if tag == 'title': self.in_title = False
    def handle_data(self, text):
        if self.in_title: self.title += text

count = 0
for series in sorted(Path('content/series').glob('*/_index.ru.md')):
    bilingual_ids = []
    for lang in ['ru', 'en']:
        source = series.with_name(f'_index.{lang}.md').read_text()
        ids = re.findall(r'^\s*- id: (\S+)', source, re.M)
        bilingual_ids.append(ids)
        assert ids and len(ids) == len(set(ids)), series
        base = ('/en' if lang == 'en' else '') + f'/series/{series.parent.name}/'
        urls = [base] + [base + work + '/' for work in ids[1:]]
        for index, (work, url) in enumerate(zip(ids, urls)):
            page = Page(output / url.lstrip('/') / 'index.html')
            assert page.root['lang'] == lang
            assert page.root['data-page-kind'] == 'work'
            assert page.root['data-work-id'] == work
            assert int(page.root['data-work-index']) == index
            image, = [a for a in page.images if 'data-artwork-image' in a]
            assert (output / image['src'].lstrip('/')).is_file(), image
            assert image.get('alt') and page.description and not page.title.startswith(' |')
            nav = [a for a in page.links if 'nav' in a.get('class', '').split()]
            dots = [a for a in page.links if 'slider-dot' in a.get('class', '').split()]
            if len(ids) == 1:
                assert not nav and not dots
            else:
                prev, nxt = nav
                assert prev['href'] == urls[(index - 1) % len(ids)]
                assert nxt['href'] == urls[(index + 1) % len(ids)]
                assert [a['href'] for a in dots] == urls
                assert [i for i, a in enumerate(dots) if a.get('aria-current') == 'page'] == [index]
            for link in nav + dots:
                target = Page(output / link['href'].lstrip('/') / 'index.html')
                target_image, = [a for a in target.images if 'data-artwork-image' in a]
                assert link['data-transition-image'] == target_image['src']
            count += 1
    assert bilingual_ids[0] == bilingual_ids[1], series

for lang in ['', 'en/']:
    home = Page(output / lang / 'index.html')
    cards = [a for a in home.links if 'card' in a.get('class', '').split()]
    assert len(cards) == 13
    assert all('data-work-id' in a for a in cards)
    for card in cards:
        target = Page(output / card['href'].lstrip('/') / 'index.html')
        target_image, = [a for a in target.images if 'data-artwork-image' in a]
        assert card['data-transition-image'] == target_image['src']
        back, = [a for a in target.links if 'data-gallery-back' in a]
        assert back['data-transition-image'] in [image['src'] for image in home.images]
    assert all((output / a['href'].lstrip('/') / 'index.html').is_file() for a in cards)

rendered_count = sum(Page(p).root.get('data-page-kind') == 'work' for p in output.rglob('index.html'))
assert rendered_count == count, (rendered_count, count)
print(f'OK: {count} bilingual work pages, cyclic links, images, metadata, 13 series cards per language')
