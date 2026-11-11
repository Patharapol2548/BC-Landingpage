/* ==========================================================================
   Landing page behaviour + two WebGL scenes
   1. Hero  : wireframe globe with continent outlines, Berlin → Bangkok arc, travelling pulse
   2. Tracks: octagonal badge (an echo of the faculty's hexagon mark)
   Everything degrades gracefully to plain HTML without WebGL.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- data */
  var TRACKS = [
    { code: 'CS', name: 'Computer Science', kind: 'Core track',
      study: 'A theory-first track: algorithms analysis, database design, embedded systems and computer graphics, applied to fundamental problems in computing.',
      fit: 'you like knowing why something works, not only that it does.' },
    { code: 'DB', name: 'Database & Intelligent Systems', kind: 'Core track',
      study: 'Database design, data warehousing and data mining, digital image processing, and intelligent techniques for pattern recognition.',
      fit: 'you like patterns, data, and getting a machine to make sense of both.' },
    { code: 'CN', name: 'Computer Networks', kind: 'Core track',
      study: 'Internet architecture and protocols, network management, network programming, computer forensics, and wired and wireless IP network design.',
      fit: 'you want to know what actually happens between two machines.' },
    { code: 'SE', name: 'Software Engineering', kind: 'Core track',
      study: 'Software design and architecture, project management, the development process, testing, maintenance and quality assurance.',
      fit: 'you want to ship software other people can still maintain in five years.' },
    { code: 'EB', name: 'Electronic Business Systems', kind: 'Applied track',
      study: 'E-business modelling, customer relationship management, and the infrastructure and platforms that online business runs on.',
      fit: 'you are as interested in the business as in the code.' },
    { code: 'MM', name: 'Multimedia Systems', kind: 'Applied track',
      study: 'Computer animation, computer graphics and virtual reality, including how to capture, edit and manipulate audio and video data.',
      fit: 'you want to build things people watch, play and feel.' },
    { code: 'MS', name: 'Management Information Systems', kind: 'Applied track',
      study: 'How IT and information systems improve business processes — hardware, software, data, processes and people.',
      fit: 'you like fixing how an organisation works, not only how its systems run.' },
    { code: 'HT', name: 'Health Information Technology', kind: 'Applied track',
      study: 'Healthcare and clinical information systems, e-Health and telehealth, and IT for delivering quality care.',
      fit: 'you want your code to end up in a hospital, helping someone.' }
  ];

  /* ---------------------------------------------------------------- nav */
  var nav = document.getElementById('nav');
  var bar = document.getElementById('progress');

  function onScroll() {
    var y = window.scrollY || 0;
    nav.classList.toggle('solid', y > 40);
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? Math.min(1, y / h) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------- reveal */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });

  /* ---------------------------------------------------------------- counters */
  var counters = document.querySelectorAll('[data-count]');
  var co = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target, target = parseInt(el.getAttribute('data-count'), 10);
      co.unobserve(el);
      if (reduceMotion) { el.textContent = target; return; }
      var t0 = performance.now(), dur = 1100;
      (function step(t) {
        var p = Math.min(1, (t - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }, { threshold: 0.6 });
  counters.forEach(function (el) { co.observe(el); });

  /* ---------------------------------------------------------------- faq */
  document.querySelectorAll('#faq .q').forEach(function (q) {
    var btn = q.querySelector('button');
    var panel = q.querySelector('.a');
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      // close siblings
      document.querySelectorAll('#faq .q').forEach(function (other) {
        if (other === q) return;
        var ob = other.querySelector('button');
        if (ob.getAttribute('aria-expanded') === 'true') {
          ob.setAttribute('aria-expanded', 'false');
          other.querySelector('.a').style.height = '0px';
        }
      });
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      panel.style.height = open ? '0px' : panel.firstElementChild.offsetHeight + 'px';
    });
  });
  window.addEventListener('resize', function () {
    document.querySelectorAll('#faq .q').forEach(function (q) {
      var btn = q.querySelector('button');
      if (btn.getAttribute('aria-expanded') === 'true') {
        var p = q.querySelector('.a');
        p.style.height = p.firstElementChild.offsetHeight + 'px';
      }
    });
  });

  /* ---------------------------------------------------------------- track UI */
  var listEl = document.getElementById('trackList');
  var tdKind = document.getElementById('tdKind');
  var tdName = document.getElementById('tdName');
  var tdStudy = document.getElementById('tdStudy');
  var tdFit = document.getElementById('tdFit');
  var buttons = [];
  var current = 0;

  TRACKS.forEach(function (t, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'track-btn';
    b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    b.innerHTML = '<span class="c">' + t.code + '</span><span class="t">' +
      (t.kind === 'Core track' ? 'Core' : 'Applied') + '</span>';
    b.addEventListener('click', function () { select(i); });
    listEl.appendChild(b);
    buttons.push(b);
  });

  function renderDetail(i) {
    var t = TRACKS[i];
    tdKind.textContent = t.kind;
    tdName.textContent = t.name;
    tdStudy.textContent = t.study;
    tdFit.innerHTML = 'Good fit if <b>' + t.fit + '</b>';
    var d = document.getElementById('trackDetail');
    d.style.opacity = '0';
    d.style.transform = 'translateY(8px)';
    requestAnimationFrame(function () {
      d.style.transition = 'opacity .45s ease, transform .45s ease';
      d.style.opacity = '1';
      d.style.transform = 'none';
    });
  }

  function select(i) {
    current = i;
    buttons.forEach(function (b, k) { b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
    renderDetail(i);
    if (window.__prismSelect) window.__prismSelect(i);
  }
  select(0);

  /* ---------------------------------------------------------------- webgl */
  function hasWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  }

  if (!window.THREE || !hasWebGL()) {
    document.body.classList.add('no3d');
    return;
  }

  var THREE = window.THREE;

  /* ================================================================ globe */
  function initGlobe() {
    var canvas = document.getElementById('globe');
    if (!canvas) return;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    if ('outputEncoding' in renderer && THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 3.45);

    var root = new THREE.Group();
    scene.add(root);

    var R = 1;
    var TEAL = 0x2BA79F, GOLD = 0xD8BE7A, SOFT = 0x2E6F6C;

    /* --- graticule ------------------------------------------------------ */
    function sph(lat, lon, r) {
      var la = lat * Math.PI / 180, lo = lon * Math.PI / 180;
      return new THREE.Vector3(
        r * Math.cos(la) * Math.sin(lo),
        r * Math.sin(la),
        r * Math.cos(la) * Math.cos(lo)
      );
    }
    var gridMat = new THREE.LineBasicMaterial({ color: SOFT, transparent: true, opacity: 0.16 });
    for (var lat = -60; lat <= 60; lat += 20) {
      var pts = [];
      for (var a = -180; a <= 180; a += 4) pts.push(sph(lat, a, R));
      root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
    }
    for (var lon = -180; lon < 180; lon += 20) {
      var pl = [];
      for (var b = -90; b <= 90; b += 4) pl.push(sph(b, lon, R));
      root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pl), gridMat));
    }

    /* --- continents ------------------------------------------------------ */
    /* Natural Earth 110m coastline, pre-projected into flat lon/lat pairs. */
    if (window.EARTH_COAST) {
      var C = window.EARTH_COAST, idx = C.i, pp = C.p;
      var total = pp.length / 2;
      var seg = [];
      for (var li = 0; li < idx.length; li++) {
        var start = idx[li];
        var stop = (li + 1 < idx.length) ? idx[li + 1] : total;
        for (var pi = start; pi < stop - 1; pi++) {
          var v1 = sph(pp[pi * 2 + 1], pp[pi * 2], 1.006);
          var v2 = sph(pp[(pi + 1) * 2 + 1], pp[(pi + 1) * 2], 1.006);
          seg.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
        }
      }
      var cgeo = new THREE.BufferGeometry();
      cgeo.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
      root.add(new THREE.LineSegments(cgeo, new THREE.LineBasicMaterial({
        color: 0x3FBCB1, transparent: true, opacity: 0.62
      })));
      // a second, tighter pass reads as a soft glow around the coast
      root.add(new THREE.LineSegments(cgeo.clone(), new THREE.LineBasicMaterial({
        color: 0x9BE3DC, transparent: true, opacity: 0.16
      })));
    }

    /* --- rim ------------------------------------------------------------ */
    var rimPts = [];
    for (var i = 0; i <= 128; i++) {
      var th = i / 128 * Math.PI * 2;
      rimPts.push(new THREE.Vector3(Math.sin(th) * R, Math.cos(th) * R, 0));
    }
    root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(rimPts),
      new THREE.LineBasicMaterial({ color: TEAL, transparent: true, opacity: 0.55 })));

    /* --- particle field -------------------------------------------------- */
    var pcount = 460, pp = new Float32Array(pcount * 3);
    for (var k = 0; k < pcount; k++) {
      var u = Math.random() * 2 - 1, ph = Math.random() * Math.PI * 2;
      var rr = 1.02 + Math.random() * 0.62;
      var s = Math.sqrt(1 - u * u);
      pp[k * 3] = Math.cos(ph) * s * rr;
      pp[k * 3 + 1] = u * rr;
      pp[k * 3 + 2] = Math.sin(ph) * s * rr;
    }
    var pgeo = new THREE.BufferGeometry();
    pgeo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
    root.add(new THREE.Points(pgeo, new THREE.PointsMaterial({
      color: 0xBFDCD9, size: 0.013, transparent: true, opacity: 0.38, sizeAttenuation: true
    })));

    /* --- arc ------------------------------------------------------------ */
    var A = sph(52.52, 13.40, 1), B = sph(13.75, 100.50, 1);
    var arcPts = [], N = 160;
    var va = A.clone().normalize(), vb = B.clone().normalize();
    for (var j = 0; j <= N; j++) {
      var t = j / N;
      var om = Math.acos(Math.min(1, Math.max(-1, va.dot(vb))));
      var so = Math.sin(om) || 1e-6;
      var p = va.clone().multiplyScalar(Math.sin((1 - t) * om) / so)
        .add(vb.clone().multiplyScalar(Math.sin(t * om) / so)).normalize();
      p.multiplyScalar(1 + 0.11 * Math.sin(Math.PI * t));
      arcPts.push(p);
    }
    var arcGeo = new THREE.BufferGeometry().setFromPoints(arcPts);
    var cols = [];
    var c1 = new THREE.Color(GOLD), c2 = new THREE.Color(TEAL);
    for (var m = 0; m <= N; m++) {
      var c = c1.clone().lerp(c2, m / N);
      cols.push(c.r, c.g, c.b);
    }
    arcGeo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    var arcMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.95 });
    root.add(new THREE.Line(arcGeo, arcMat));

    /* a thin tube gives the route real weight (linewidth is ignored in WebGL) */
    try {
      var curve = new THREE.CatmullRomCurve3(arcPts);
      var RAD = 7, TUB = 150;
      var tube = new THREE.TubeGeometry(curve, TUB, 0.0062, RAD - 1, false);
      var tpos = tube.attributes.position;
      var tcol = new Float32Array(tpos.count * 3);
      for (var q = 0; q < tpos.count; q++) {
        var tt = Math.floor(q / RAD) / TUB;
        var cc = c1.clone().lerp(c2, tt);
        tcol[q * 3] = cc.r; tcol[q * 3 + 1] = cc.g; tcol[q * 3 + 2] = cc.b;
      }
      tube.setAttribute('color', new THREE.BufferAttribute(tcol, 3));
      root.add(new THREE.Mesh(tube, new THREE.MeshBasicMaterial({
        vertexColors: true, transparent: true, opacity: 0.85
      })));
    } catch (err) { /* the 1px line remains as a fallback */ }

    /* --- glow sprite ---------------------------------------------------- */
    function glowTexture() {
      var cv = document.createElement('canvas');
      cv.width = cv.height = 128;
      var g = cv.getContext('2d');
      var grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      grd.addColorStop(0, 'rgba(43,167,159,.85)');
      grd.addColorStop(0.45, 'rgba(43,167,159,.22)');
      grd.addColorStop(1, 'rgba(43,167,159,0)');
      g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
      var tex = new THREE.CanvasTexture(cv);
      if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
      return tex;
    }
    var halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture(), blending: THREE.AdditiveBlending, transparent: true, opacity: 0.55, depthWrite: false
    }));
    halo.scale.set(3.4, 3.4, 1);
    halo.position.z = -0.6;
    root.add(halo);

    /* --- markers + travelling pulse ------------------------------------- */
    function marker(pos, color) {
      var g = new THREE.Group();
      g.add(new THREE.Mesh(
        new THREE.SphereGeometry(0.018, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      ));
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTexture(), color: color, blending: THREE.AdditiveBlending,
        transparent: true, opacity: 0.9, depthWrite: false
      }));
      sp.scale.set(0.30, 0.30, 1);
      g.add(sp);
      g.position.copy(pos.clone().normalize().multiplyScalar(1.004));
      return g;
    }
    root.add(marker(A, GOLD));
    root.add(marker(B, TEAL));

    var pulse = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture(), color: 0xffffff, blending: THREE.AdditiveBlending,
      transparent: true, opacity: 0.95, depthWrite: false
    }));
    pulse.scale.set(0.22, 0.22, 1);
    root.add(pulse);

    /* --- interaction ---------------------------------------------------- */
    var pointer = { x: 0, y: 0 }, smooth = { x: 0, y: 0 };
    window.addEventListener('pointermove', function (e) {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    function layout() {
      var w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      var compact = w < 900;
      camera.fov = compact ? 52 : 42;
      camera.updateProjectionMatrix();
      root.position.set(compact ? 0 : 1.02, compact ? 0.52 : 0.02, 0);
      root.scale.setScalar(compact ? 0.74 : 0.78);
    }
    layout();
    window.addEventListener('resize', layout);

    var scrollRot = 0;
    window.addEventListener('scroll', function () {
      scrollRot = (window.scrollY || 0) / window.innerHeight * 0.55;
    }, { passive: true });

    var clock = new THREE.Clock();
    var visible = true;
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; })
      .observe(canvas);

    function frame() {
      requestAnimationFrame(frame);
      if (!visible) return;
      var t = clock.getElapsedTime();

      smooth.x += (pointer.x - smooth.x) * 0.05;
      smooth.y += (pointer.y - smooth.y) * 0.05;

      if (!reduceMotion) {
        // start with Europe–Asia facing the camera (midpoint of the route ≈ 57°E)
        root.rotation.y = -1.0 + t * 0.05 + smooth.x * 0.30 + scrollRot;
        root.rotation.x = smooth.y * 0.15 - 0.10;
      } else {
        root.rotation.y = -1.0; root.rotation.x = -0.10;
      }

      var pt = (t * 0.14) % 1;
      if (reduceMotion) pt = 0.55;
      var idx = Math.floor(pt * (arcPts.length - 1));
      pulse.position.copy(arcPts[idx]);
      pulse.material.opacity = 0.35 + 0.6 * Math.sin(Math.PI * ((pt * 1) % 1));

      renderer.render(scene, camera);
    }
    frame();
  }

  /* ================================================================ prism */
  function initPrism() {
    var canvas = document.getElementById('prism');
    if (!canvas) return;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    if ('outputEncoding' in renderer && THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, 3.15);

    var group = new THREE.Group();
    scene.add(group);

    var R = 1.06;
    var FACETS = 8;
    var step = Math.PI * 2 / FACETS;
    var w = 2 * R * Math.tan(Math.PI / FACETS) * 0.94;
    var hgt = 1.28;

    function facetTexture(t, index) {
      var S = 512;
      var cv = document.createElement('canvas');
      cv.width = cv.height = S;
      var g = cv.getContext('2d');

      var grd = g.createLinearGradient(0, 0, S, S);
      grd.addColorStop(0, '#0B2220');
      grd.addColorStop(1, '#071513');
      g.fillStyle = grd;
      g.fillRect(0, 0, S, S);

      // accent edge
      var accent = t.kind === 'Core track' ? '#2BA79F' : '#D8BE7A';
      g.fillStyle = accent;
      g.globalAlpha = 0.85;
      g.fillRect(0, 0, S, 6);
      g.globalAlpha = 1;

      // index number
      g.fillStyle = 'rgba(255,255,255,.20)';
      g.font = '400 34px "JetBrains Mono", monospace';
      g.fillText('0' + (index + 1), 46, 90);

      // code
      g.fillStyle = accent;
      g.font = '600 150px "Sora", sans-serif';
      g.fillText(t.code, 42, 246);

      // kind
      g.fillStyle = 'rgba(237,244,242,.42)';
      g.font = '400 24px "JetBrains Mono", monospace';
      g.fillText(t.kind.toUpperCase().replace(' TRACK', '') + ' TRACK', 46, 300);

      // name (wrapped)
      g.fillStyle = '#EDF4F2';
      g.font = '600 42px "Sora", sans-serif';
      var words = t.name.split(' ');
      var lines = [], line = '';
      words.forEach(function (word) {
        var test = line ? line + ' ' + word : word;
        if (g.measureText(test).width > S - 92 && line) { lines.push(line); line = word; }
        else line = test;
      });
      lines.push(line);
      lines.slice(0, 3).forEach(function (ln, i) { g.fillText(ln, 46, 366 + i * 48); });

      var tex = new THREE.CanvasTexture(cv);
      tex.anisotropy = 4;
      if (THREE.sRGBEncoding) tex.encoding = THREE.sRGBEncoding;
      return tex;
    }

    var planes = [];
    for (var i = 0; i < FACETS; i++) {
      var angle = i * step;
      var geo = new THREE.PlaneGeometry(w, hgt, 1, 1);
      var mat = new THREE.MeshBasicMaterial({
        map: facetTexture(TRACKS[i], i), transparent: false, side: THREE.FrontSide
      });
      var mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(Math.sin(angle) * R, 0, Math.cos(angle) * R);
      mesh.rotation.y = angle;
      group.add(mesh);
      planes.push(mesh);
    }

    // edges
    var edgePts = [];
    var vR = R / Math.cos(Math.PI / FACETS);
    for (var e = 0; e < FACETS; e++) {
      var a0 = e * step - step / 2, a1 = e * step + step / 2;
      var x0 = Math.sin(a0) * vR, z0 = Math.cos(a0) * vR;
      var x1 = Math.sin(a1) * vR, z1 = Math.cos(a1) * vR;
      edgePts.push(new THREE.Vector3(x0, -hgt / 2, z0), new THREE.Vector3(x0, hgt / 2, z0));
      edgePts.push(new THREE.Vector3(x0, hgt / 2, z0), new THREE.Vector3(x1, hgt / 2, z1));
      edgePts.push(new THREE.Vector3(x0, -hgt / 2, z0), new THREE.Vector3(x1, -hgt / 2, z1));
    }
    var edges = new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints(edgePts),
      new THREE.LineBasicMaterial({ color: 0x2BA79F, transparent: true, opacity: 0.42 })
    );
    group.add(edges);

    // ground glow
    var gcv = document.createElement('canvas');
    gcv.width = gcv.height = 256;
    var gg = gcv.getContext('2d');
    var gr = gg.createRadialGradient(128, 128, 0, 128, 128, 128);
    gr.addColorStop(0, 'rgba(43,167,159,.45)');
    gr.addColorStop(1, 'rgba(43,167,159,0)');
    gg.fillStyle = gr; gg.fillRect(0, 0, 256, 256);
    var gt = new THREE.CanvasTexture(gcv);
    var glow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 3.4),
      new THREE.MeshBasicMaterial({ map: gt, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
    );
    glow.position.set(0, -hgt / 2 - 0.15, 0);
    glow.rotation.x = -Math.PI / 2;
    scene.add(glow);

    var targetRot = 0, currentRot = 0, velocity = 0, dragging = false, lastX = 0, idle = 0;

    window.__prismSelect = function (i) {
      targetRot = -i * step;
      idle = 0;
    };

    function layout() {
      var wpx = canvas.clientWidth || 1, hpx = canvas.clientHeight || 1;
      renderer.setSize(wpx, hpx, false);
      camera.aspect = wpx / hpx;
      camera.updateProjectionMatrix();
    }
    layout();
    window.addEventListener('resize', layout);

    canvas.addEventListener('pointerdown', function (ev) {
      dragging = true; lastX = ev.clientX; velocity = 0;
      canvas.setPointerCapture && canvas.setPointerCapture(ev.pointerId);
    });
    canvas.addEventListener('pointermove', function (ev) {
      if (!dragging) return;
      var dx = ev.clientX - lastX;
      lastX = ev.clientX;
      velocity = dx * 0.006;
      currentRot += velocity;
      targetRot = currentRot;
      idle = 0;
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      // snap to nearest facet
      var nearest = Math.round(-currentRot / step);
      targetRot = -nearest * step;
      var idx = ((nearest % FACETS) + FACETS) % FACETS;
      if (idx !== current) select(idx);
    }
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
    canvas.addEventListener('pointerleave', endDrag);

    var clock = new THREE.Clock();
    var visible = true;
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(canvas);

    function frame() {
      requestAnimationFrame(frame);
      if (!visible) return;
      var t = clock.getElapsedTime();

      if (!dragging) {
        idle += 1 / 60;
        if (idle > 7 && !reduceMotion) targetRot -= 0.0045;
        currentRot += (targetRot - currentRot) * 0.09;
      }

      group.rotation.y = currentRot;
      if (!reduceMotion) {
        group.position.y = Math.sin(t * 0.7) * 0.035;
        group.rotation.x = Math.sin(t * 0.42) * 0.045;
      }
      edges.material.opacity = 0.32 + Math.sin(t * 1.4) * 0.08;

      renderer.render(scene, camera);
    }
    frame();
  }

  /* ---------------------------------------------------------------- boot */
  function boot() {
    initGlobe();
    initPrism();
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(boot).catch(boot);
  } else {
    boot();
  }
})();
