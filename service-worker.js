/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "404.html",
    "revision": "771874c16d3a00f54549da035c0a27c3"
  },
  {
    "url": "assets/css/0.styles.12a6d54f.css",
    "revision": "3623b6e185b07a51fbd2eac26c37ee23"
  },
  {
    "url": "assets/img/search.83621669.svg",
    "revision": "83621669651b9a3d4bf64d1a670ad856"
  },
  {
    "url": "assets/js/10.fd395a91.js",
    "revision": "43cbfa761507d0cafb44a2507a610b32"
  },
  {
    "url": "assets/js/11.fd6cdb1d.js",
    "revision": "9d1d78165d9f92d96ed2cd475fbc2227"
  },
  {
    "url": "assets/js/12.0578da6e.js",
    "revision": "d914bc93da66ba75c3f07d0084f8da80"
  },
  {
    "url": "assets/js/13.2a330af9.js",
    "revision": "712af9e57f1926b31c3a04e906506a7a"
  },
  {
    "url": "assets/js/14.70e2e12d.js",
    "revision": "378994d1506b0eb961d5cf6d8c9298bf"
  },
  {
    "url": "assets/js/2.d9c60309.js",
    "revision": "53c81759058d670a0ea28ecf3879b660"
  },
  {
    "url": "assets/js/3.dabdc007.js",
    "revision": "bcfdaac8844e162b3026dced984eeaee"
  },
  {
    "url": "assets/js/4.24771eb4.js",
    "revision": "943cfa5571fb37abe5cd3476973a3395"
  },
  {
    "url": "assets/js/5.cc0c3a6f.js",
    "revision": "58f6eeebcf8799124a2993e0c388e7ae"
  },
  {
    "url": "assets/js/6.ceb159c9.js",
    "revision": "c2787f3e204113b6accebc35fca43221"
  },
  {
    "url": "assets/js/7.b258807d.js",
    "revision": "9cef126b5399e84f6df688b47e465b82"
  },
  {
    "url": "assets/js/8.95cb02fa.js",
    "revision": "4df9e6f12de8b51b71878004ab3aafef"
  },
  {
    "url": "assets/js/9.da5d5ab8.js",
    "revision": "ed2f54f491aaac94dddfde55dae6aae5"
  },
  {
    "url": "assets/js/app.5db83a4e.js",
    "revision": "f7f7a224018180915c9d5b8609e8196d"
  },
  {
    "url": "guide/index.html",
    "revision": "f61f7fdcc7789c20fe1f23cf88d1c490"
  },
  {
    "url": "head.png",
    "revision": "1547e7aaeca760b28335c880fb4f3ab9"
  },
  {
    "url": "index.html",
    "revision": "44b8cd554db836fc7f1fe7b36a53c54f"
  },
  {
    "url": "logo.png",
    "revision": "70ae9af8f70e53b6eb6c479cfa5fa635"
  },
  {
    "url": "passages/20181001-集合框架/index.html",
    "revision": "83fe06b214d4b5d0194225a730aa2fc3"
  },
  {
    "url": "passages/20181209-红黑树/index.html",
    "revision": "7f6a0fe2e5776df24d17d5dd86ee7f66"
  },
  {
    "url": "passages/20181215-HashMap/index.html",
    "revision": "753e184a1422ab85c0d0eed3f3dede33"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
addEventListener('message', event => {
  const replyPort = event.ports[0]
  const message = event.data
  if (replyPort && message && message.type === 'skip-waiting') {
    event.waitUntil(
      self.skipWaiting().then(
        () => replyPort.postMessage({ error: null }),
        error => replyPort.postMessage({ error })
      )
    )
  }
})
