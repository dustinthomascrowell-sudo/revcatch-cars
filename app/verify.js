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
          var hit = found.filter(function (d) { return ["car", "truck", "bus", "motorcycle"].indexOf(d["class"]) >= 0 && d.score >= 0.4; })
                         .sort(function (a, b) { return b.score - a.score; })[0];
          if (!hit) { photo = null; chk(); msg("AI didn't find a vehicle in that photo. Try a clearer shot of the car."); return; }
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
