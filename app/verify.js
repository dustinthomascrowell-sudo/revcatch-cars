/* RevCatch Cars free photo check: runs a car-detection model on the player's own phone (TensorFlow.js COCO-SSD). No server, no cost. */
(function () {
  var inp = document.getElementById("photo");
  if (!inp) return;
  var model = null, loading = null;
  var msg = function (t) { var m = document.getElementById("capmsg"); if (m) m.textContent = t; };
  var note = document.querySelector("#t-cap .box .note");
  if (note) note.textContent = "Beta rules: one photo per catch, taken within 48 hours. Every photo gets an AI check right on your phone: it has to show a real vehicle, and screenshots are rejected. Passengers and parked cars only. Duplicates don't score and there's a 15-per-hour cap.";
  function loadScript(src) {
    return new Promise(function (ok, no) { var s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
  }
  function getModel() {
    if (model) return Promise.resolve(model);
    if (!loading) loading = loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js")
      .then(function () { return loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js"); })
      .then(function () { return window.cocoSsd.load({ base: "lite_mobilenet_v2" }); })
      .then(function (m) { model = m; return m; });
    return loading;
  }
  var capTab = document.querySelector('[data-t="cap"]');
  if (capTab) capTab.addEventListener("click", function () { getModel().catch(function () {}); });

  document.addEventListener("change", function (e) {
    if (e.target !== inp) return;
    e.stopImmediatePropagation();
    var f = inp.files && inp.files[0];
    photo = null; chk();
    if (!f) return;
    if (Date.now() - f.lastModified > 48 * 3600e3) { msg("That photo is more than 48 hours old. Catches have to be fresh."); return; }
    if (f.type === "image/png" || /screen ?shot/i.test(f.name)) { msg("That looks like a screenshot. Use a photo you took yourself."); return; }
    var r = new FileReader();
    r.onload = function () {
      var img = document.getElementById("prev");
      img.onload = function () {
        msg("AI is checking your photo for a car…");
        getModel().then(function (m) { return m.detect(img); }).then(function (found) {
          var hit = found.filter(function (d) { return ["car", "truck", "bus", "motorcycle", "train", "boat", "airplane"].indexOf(d["class"]) >= 0 && d.score >= 0.2; })
                         .sort(function (a, b) { return b.score - a.score; })[0];
          if (!hit) { photo = r.result; chk(); msg("AI couldn't lock onto a vehicle (rare and custom rides can trip it up). You can still add it. Play fair: real cars only."); return; }
          photo = r.result; chk();
          msg("AI check passed: vehicle found (" + Math.round(hit.score * 100) + "% sure). Pick the car and add it.");
        }).catch(function () {
          photo = r.result; chk();
          msg("Couldn't run the AI check on this phone right now, so this one's on the honor system.");
        });
      };
      img.src = r.result; img.hidden = false;
    };
    r.readAsDataURL(f);
  }, true);
})();

/* Hometown Legends: real local builds, top value. Ids continue after the main list. */
(function () {
  if (typeof CARS === "undefined") return;
  [["O", "Dirty Datsun (Anthony Palladino)", "Hometown Legend"],
   ["O", "Texaco Camaro (Jason Bottenfield)", "Hometown Legend"]].forEach(function (x) {
    if (!CARS.some(function (c) { return c.n === x[1]; })) CARS.push({ id: CARS.length, t: x[0], n: x[1], m: x[2] });
  });
  window.RC_INFO = {
    "Dirty Datsun (Anthony Palladino)": { d: "1969 Datsun roadster on a custom chassis, LS V8 power. Optima Ultimate Street Car Outlaw class champ.", u: "https://lsxmag.com/features/the-dirty-datsun/" },
    "Texaco Camaro (Jason Bottenfield)": { d: "1969 Camaro RS in Texaco livery, supercharged LT5, 760 whp. Optima GTV national champ.", u: "https://lsxmag.com/features/domination-by-design-the-3000-hour-build-texaco-camaro-rs/" }
  };
  gauge = function () { var c = document.getElementById("gauge"), x = c.getContext("2d"), cs = getComputedStyle(document.documentElement), N = CARS.length; x.clearRect(0, 0, 260, 260); var a0 = Math.PI * .75, span = Math.PI * 1.5, f = caught.size / N; x.lineWidth = 18; x.lineCap = "round"; x.strokeStyle = cs.getPropertyValue("--line"); x.beginPath(); x.arc(130, 130, 105, a0, a0 + span); x.stroke(); x.strokeStyle = cs.getPropertyValue("--accent"); x.beginPath(); x.arc(130, 130, 105, a0, a0 + span * Math.max(f, .01)); x.stroke(); x.fillStyle = cs.getPropertyValue("--fg"); x.textAlign = "center"; x.font = "700 54px Chakra Petch, sans-serif"; x.fillText(caught.size, 130, 140); x.fillStyle = cs.getPropertyValue("--mute"); x.font = "500 20px IBM Plex Mono, monospace"; x.fillText("OF " + N, 130, 172); };
})();

/* Search + A-Z: car picker and garage list */
(function () {
  if (typeof CARS === "undefined" || !document.getElementById("pick")) return;
  var pickEl = document.getElementById("pick");
  var q = document.createElement("input");
  q.type = "search"; q.id = "q"; q.autocomplete = "off"; q.placeholder = "Search: Supra, Lambo, pope…";
  pickEl.parentNode.insertBefore(q, pickEl);
  var ABC = CARS.slice().sort(function (a, b) { return a.n.localeCompare(b.n); });
  function fillPick() {
    var s = (q.value || "").toLowerCase().trim();
    var rows = ABC.filter(function (c) { return !s || (c.n + " " + c.m).toLowerCase().indexOf(s) >= 0; });
    var head = s ? (rows.length ? rows.length + " match" + (rows.length > 1 ? "es" : "") + ", pick one…" : "No match. Try another word") : "Choose the car (A–Z)…";
    pickEl.innerHTML = '<option value="">' + head + "</option>" + rows.map(function (c) { return '<option value="' + c.id + '">' + c.n + " (" + T[c.t].n + ")</option>"; }).join("");
    if (s && rows.length === 1) pickEl.value = rows[0].id;
    chk();
  }
  q.addEventListener("input", fillPick);
  fillPick();
  document.getElementById("submit").addEventListener("click", function () { setTimeout(function () { if (!pickEl.value) { q.value = ""; fillPick(); } }, 1500); });

  var filters = document.getElementById("filters");
  var gq = document.createElement("input");
  gq.type = "search"; gq.id = "gq"; gq.autocomplete = "off"; gq.placeholder = "Search all " + CARS.length + " cars";
  filters.parentNode.insertBefore(gq, filters);
  var order = { O: 0, L: 1, E: 2, R: 3, C: 4 };
  list = function () {
    var s = (gq.value || "").toLowerCase().trim();
    var rows = CARS.filter(function (c) { return filt === "all" || c.t === filt || (filt === "got" && caught.has(c.id)) || (filt === "need" && !caught.has(c.id)); })
      .filter(function (c) { return !s || (c.n + " " + c.m).toLowerCase().indexOf(s) >= 0; })
      .sort(function (a, b) { return order[a.t] - order[b.t] || a.n.localeCompare(b.n); });
    document.getElementById("list").innerHTML = rows.map(function (c) { var g = caught.get(c.id); return '<div class="car' + (g ? "" : " no") + '"><div class="bar" style="background:' + T[c.t].c + '"></div><div><div class="nm">' + c.n + '</div><div class="sub">' + c.m + " · " + (g ? (+g.points).toLocaleString() + " pts earned" : T[c.t].p.toLocaleString() + " pts") + '</div>' + (window.RC_INFO && RC_INFO[c.n] ? '<div class="sub" style="margin-top:4px">' + RC_INFO[c.n].d + ' <a href="' + RC_INFO[c.n].u + '" target="_blank" rel="noopener" style="color:var(--accent)">See photos ↗</a></div>' : "") + '</div><span class="tag" style="color:' + (g ? "var(--ok)" : T[c.t].c) + '">' + (g ? "CAUGHT" : T[c.t].n.toUpperCase()) + "</span></div>"; }).join("") + '<p class="note">' + CARS.length + " cars on the launch list. New drops added every month.</p>";
  };
  gq.addEventListener("input", function () { list(); });
  var find = new URLSearchParams(location.search).get("find");
  if (find) gq.value = find;
  if (typeof me !== "undefined" && me) render();
})();
