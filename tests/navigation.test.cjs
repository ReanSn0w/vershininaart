const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const code = fs.readFileSync('static/js/view-transitions.js', 'utf8');
const swipeCode = fs.readFileSync('static/js/slider.js', 'utf8');
class Events {
  listeners = {};
  addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); }
  fire(type, data = {}) { for (const fn of this.listeners[type] || []) fn(data); }
}
function element() {
  return { dataset: {}, style: { removeProperty(k) { delete this[k.replace(/-([a-z])/g, (_, c) => c.toUpperCase())]; } },
    complete: true, naturalWidth: 800, getBoundingClientRect: () => ({ width: 400, height: 300, top: 10, bottom: 310, left: 10, right: 410 }) };
}
function environment(path, opts = {}) {
  const url = new URL(path, 'https://example.test');
  const root = element();
  root.lang = path.startsWith('/en/') ? 'en' : 'ru';
  root.dataset = { pageKind: opts.kind || 'work', workIndex: String(opts.index || 0) };
  const image = element(), info = element(), back = element();
  const elements = [image, info];
  const store = opts.store || new Map();
  const document = new Events(), window = new Events();
  const card = { href: 'https://example.test/series/a/', querySelector: () => image };
  document.documentElement = root;
  document.referrer = opts.referrer || '';
  document.querySelector = (selector) => ({ '[data-artwork-image]': image, '.series__info': info, '[data-gallery-back]': back })[selector];
  document.querySelectorAll = (selector) => selector === '.card[data-work-id]' ? [card] : elements.filter(e => 'transitionNamed' in e.dataset);
  const history = { state: opts.state || null, replaceState(value) { this.state = value; } };
  window.navigation = opts.navigation;
  window.scrollY = opts.scroll || 0;
  const env = { document, window, history, location: url, URL, Date, innerWidth: 1200, innerHeight: 800, scrollY: window.scrollY,
    matchMedia: () => ({matches: !!opts.reduced}),
    performance: { getEntriesByType: () => [{ type: opts.loadType || 'navigate' }] },
    sessionStorage: { removeItem: k => store.delete(k), getItem: k => { if (opts.blockStorage) throw Error('denied'); return store.get(k) || null; }, setItem: (k,v) => { if (opts.blockStorage) throw Error('denied'); store.set(k,v); } },
  };
  window.scrollTo = ({top}) => { window.scrollY = env.scrollY = top; };
  vm.runInNewContext(code, env);
  function transition() {
    return { skipped: false, ready: Promise.resolve(), finished: new Promise(() => {}), skipTransition() {this.skipped = true;} };
  }
  function click(to, direction, extra = {}) {
    const link = {href: new URL(to, url).href, dataset: {workDirection: direction}, hasAttribute: () => false};
    document.fire('click', {target: {closest: () => link}, button: 0, ...extra});
  }
  function leave(to, direction, activation) {
    click(to, direction);
    const t = transition();
    window.fire('pageswap', {activation: activation || {entry: {url:new URL(to,url).href}, navigationType:'push'}, viewTransition:t});
    return {value:JSON.parse(store.get('art-navigation') || 'null'), transition:t};
  }
  return {window, document, root, image, back, history, store, env, transition, click, leave};
}

test('gallery context survives page turns and restores exact scroll', () => {
  const first = environment('/#paintings', {kind:'gallery',scroll:1234});
  const out = first.leave('/series/a/');
  assert.equal(out.value.context.y, 1234);
  const work = environment('/series/a/', {store:first.store, referrer:'https://example.test/'});
  work.document.fire('DOMContentLoaded');
  assert.equal(work.back.href,'https://example.test/#paintings');
  const next = work.leave('/series/a/two/','next');
  assert.equal(next.value.context.y,1234);
  const second = environment('/series/a/two/', {store:first.store,referrer:'https://example.test/series/a/',index:1});
  second.document.fire('DOMContentLoaded');
  second.leave('/#paintings');
  const gallery = environment('/#paintings', {kind:'gallery',store:first.store,referrer:'https://example.test/series/a/two/'});
  gallery.window.fire('pagereveal',{viewTransition:gallery.transition()});
  assert.equal(gallery.env.scrollY,1234);
  assert.equal(gallery.root.dataset.transition,undefined); // different artwork never morphs into cover
});
test('direct entry rejects stale transfer from a different source', () => {
  const first = environment('/',{kind:'gallery'});
  first.leave('/series/a/');
  const direct = environment('/series/a/',{store:first.store});
  direct.document.fire('DOMContentLoaded');
  assert.equal(direct.back.href,undefined);
  assert.equal(direct.history.state.artReturn,null);
});
test('transfer is consumed once and is not replayed by a fresh direct visit', () => {
  const first=environment('/',{kind:'gallery'}); first.leave('/series/a/');
  const work=environment('/series/a/',{store:first.store,referrer:'https://example.test/'});
  work.document.fire('DOMContentLoaded');
  assert.equal(first.store.has('art-navigation'),false);
  const direct=environment('/series/a/',{store:first.store,referrer:'https://example.test/'});
  direct.document.fire('DOMContentLoaded');
  assert.equal(direct.history.state.artReturn,null);
});
test('reload preserves its own context but does not replay an animation', () => {
  const e=environment('/series/a/',{loadType:'reload',state:{artReturn:{url:'https://example.test/#paintings',y:100}}});
  e.window.fire('pagereveal',{viewTransition:e.transition()});
  assert.equal(e.back.href,'https://example.test/#paintings');
  assert.equal(e.root.dataset.transition,undefined);
});
test('blocked storage and missing same-document API keep actions functional', () => {
  const e=environment('/series/a/',{blockStorage:true});
  e.document.fire('DOMContentLoaded');
  assert.doesNotThrow(()=>e.leave('/series/a/two/','next'));
  let updates=0;
  e.window.artTransitions.run(()=>updates++);
  assert.equal(updates,1);
});
test('reduced motion skips both kinds of animation but performs mutations', () => {
  const e=environment('/series/a/',{reduced:true});
  const out=e.leave('/series/a/two/','next');
  assert.equal(out.transition.skipped,true);
  let updates=0; e.document.startViewTransition=()=>{throw Error('must not run');};
  e.window.artTransitions.run(()=>updates++);
  assert.equal(updates,1);
});
test('modified clicks do not capture navigation context', () => {
  const e=environment('/',{kind:'gallery'});
  e.click('/series/a/',null,{metaKey:true});
  assert.equal(e.store.size,0);
});
test('next/prev disambiguate the same destination in a two-work series', () => {
  for(const direction of ['next','prev']) {
    const e=environment('/series/a/');
    e.leave('/series/a/two/',direction);
    assert.equal(e.root.dataset.transition,`work-${direction}`);
  }
});
test('unready incoming image skips a shared transition without delaying navigation', () => {
  const first=environment('/',{kind:'gallery'}); first.leave('/series/a/');
  const target=environment('/series/a/',{store:first.store,referrer:'https://example.test/'});
  target.image.complete=false;
  const t=target.transition(); target.window.fire('pagereveal',{viewTransition:t});
  assert.equal(t.skipped,true);
});
test('information pages slide only between gallery and information', () => {
  const open=environment('/',{kind:'gallery'}); open.leave('/about/');
  assert.equal(open.root.dataset.transition,'info-open');
  const close=environment('/about/',{kind:'info'}); close.leave('/');
  assert.equal(close.root.dataset.transition,'info-close');
  const other=environment('/about/',{kind:'info'}); other.leave('/cv/');
  assert.equal(other.root.dataset.transition,undefined);
});
test('history edges reverse direction on Back and retain it on Forward', () => {
  const first=environment('/series/a/'); first.leave('/series/a/two/','next');
  const second=environment('/series/a/two/',{store:first.store,referrer:'https://example.test/series/a/', navigation:{activation:{navigationType:'push',entry:{key:'b',index:1},from:{key:'a',index:0,url:'https://example.test/series/a/'}}}});
  second.document.fire('DOMContentLoaded');
  const back=second.leave('/series/a/',null,{navigationType:'traverse',from:{key:'b',index:1},entry:{key:'a',index:0,url:'https://example.test/series/a/'}});
  assert.equal(back.value.direction,'prev');
  const again=environment('/series/a/',{store:first.store});
  const forward=again.leave('/series/a/two/',null,{navigationType:'traverse',from:{key:'a',index:0},entry:{key:'b',index:1,url:'https://example.test/series/a/two/'}});
  assert.equal(forward.value.direction,'next');
});

function swipe() {
  const surface=new Events(), window=new Events(); window.innerWidth=390;
  let opened=false, clicks=[];
  surface.querySelector=(selector)=>({click:()=>clicks.push(selector.includes('prev')?'prev':'next')});
  const document={querySelector:()=>surface,body:{classList:{contains:()=>opened}}};
  vm.runInNewContext(swipeCode,{window,document,Date,setTimeout:()=>1,clearTimeout:()=>{}});
  const touch=(x,y)=>({clientX:x,clientY:y});
  const gesture=(x,y,cancel=false)=>{
    surface.fire('touchstart',{touches:[touch(100,100)]});
    surface.fire('touchmove',{touches:[touch(100+x,100+y)]});
    surface.fire(cancel?'touchcancel':'touchend',{changedTouches:[touch(100+x,100+y)]});
  };
  return {surface,window,clicks,gesture,setOpen:v=>opened=v,touch};
}
test('swipe switches on release only and suppresses its synthetic click',()=>{
  const e=swipe();
  e.surface.fire('touchstart',{touches:[e.touch(100,100)]});
  e.surface.fire('touchmove',{touches:[e.touch(50,100)]});
  assert.equal(e.clicks.length,0);
  e.surface.fire('touchend',{changedTouches:[e.touch(50,100)]});
  assert.deepEqual(e.clicks,['next']);
  let prevented=false;
  e.surface.fire('click',{preventDefault:()=>prevented=true,stopImmediatePropagation:()=>{}});
  assert.equal(prevented,true);
  e.gesture(-50,0); assert.equal(e.clicks.length,1);
  e.window.fire('pageshow'); e.gesture(50,0); assert.deepEqual(e.clicks,['next','prev']);
});
test('vertical, short, cancelled, multitouch and viewer gestures never navigate',()=>{
  const e=swipe();
  e.gesture(-5,0); e.gesture(-40,70); e.gesture(-70,0,true);
  e.surface.fire('touchstart',{touches:[e.touch(100,100)]});
  e.surface.fire('touchmove',{touches:[e.touch(40,100),e.touch(90,100)]});
  e.surface.fire('touchend',{changedTouches:[e.touch(40,100)]});
  e.setOpen(true); e.gesture(-80,0);
  assert.deepEqual(e.clicks,[]);
});
