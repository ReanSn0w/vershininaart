"""Exercise authors' edits against a real Hugo build, without per-work Markdown."""
from pathlib import Path
import shutil
import subprocess
import tempfile
import time

adapter = Path('content/series/_content.gotmpl').resolve()
with tempfile.TemporaryDirectory(prefix='art-adapter-') as temp:
    root = Path(temp)
    (root / 'hugo.yaml').write_text('''baseURL: https://example.test/
defaultContentLanguage: ru
build:
  cachebusters:
    - source: assets/series-source/.*/_index[.](ru|en)[.]md$
      target: .*
module:
  mounts:
    - source: content/series
      target: assets/series-source
languages:
  ru:
    weight: 1
  en:
    weight: 2
''')
    series = root / 'content/series/example'
    series.mkdir(parents=True)
    shutil.copy(adapter, series.parent / adapter.name)
    layouts = root / 'layouts/_default'
    layouts.mkdir(parents=True)
    (layouts / 'single.html').write_text('{{ .Params.work_id }}|{{ .Title }}|{{ .Parent.Title }}')
    (layouts / 'list.html').write_text('{{ .Title }}')

    def write(ids=('cover', 'second'), draft=False, title='Work'):
        for lang in ('ru', 'en'):
            works = ''.join(f'  - id: {id}\n    title: {title} {lang}\n' for id in ids)
            (series / f'_index.{lang}.md').write_text(
                f'---\ntitle: Series {lang}\ndraft: {str(draft).lower()}\nworks:\n{works}---\nBody\n')

    def build(ok=True):
        result = subprocess.run(['hugo', '--source', temp, '--cleanDestinationDir'], capture_output=True, text=True)
        assert (result.returncode == 0) == ok, result.stdout + result.stderr
        return result.stdout + result.stderr

    def page(id, lang='ru'):
        return root / 'public' / ('' if lang == 'ru' else 'en') / 'series/example' / id / 'index.html'

    write()
    build()
    for lang in ('ru', 'en'):
        assert page('second', lang).read_text() == f'second|Work {lang}|Series {lang}'
        assert not page('cover', lang).exists()
    write(('cover', 'second', 'third'))
    build()
    assert page('third').exists() and page('third', 'en').exists()
    write()
    build()
    assert not page('third').exists() and not page('third', 'en').exists()
    write(draft=True)
    build()
    assert not page('second').exists() and not page('second', 'en').exists()
    for ids in [('cover', 'cover'), ('cover', ''), ('cover', '../bad')]:
        write(ids)
        assert 'work id' in build(ok=False)

    # Metadata is mounted as resources; ensure Hugo tracks edits and new series.
    write()
    build()
    with (root / 'watch.log').open('w') as log:
        watcher = subprocess.Popen(['hugo', '--source', temp, '--watch'], stdout=log, stderr=log)
        try:
            deadline = time.monotonic() + 10
            while 'Watching for changes' not in (root / 'watch.log').read_text():
                assert watcher.poll() is None and time.monotonic() < deadline, (root / 'watch.log').read_text()
                time.sleep(.1)
            new_series = series.parent / 'new-series'
            shutil.copytree(series, new_series)
            new_page = root / 'public/series/new-series/second/index.html'
            deadline = time.monotonic() + 10
            while not (new_page.exists() and (root / 'public/en/series/new-series/second/index.html').exists()):
                assert watcher.poll() is None and time.monotonic() < deadline, (root / 'watch.log').read_text()
                time.sleep(.1)
            write(('cover', 'second', 'third'), title='Edited')
            deadline = time.monotonic() + 10
            while not (page('third').exists() and page('third', 'en').exists()
                       and 'Edited' in page('second').read_text()):
                assert watcher.poll() is None and time.monotonic() < deadline, (root / 'watch.log').read_text()
                time.sleep(.1)
        finally:
            watcher.terminate()
            watcher.wait(timeout=5)
print('OK: bilingual generation, add/remove, drafts, invalid IDs, and live rebuild')
