/* RevCatch Cars: mobile fit fix + Hometown Legend detail cards */
(function () {
  var st = document.createElement("style");
  st.textContent = "input,select,textarea{font-size:16px!important}" +
    ".lg-card{display:grid;grid-template-columns:4px 1fr;gap:12px;padding:12px 0;border-bottom:1px solid var(--line)}" +
    ".lg-card img{width:100%;border-radius:10px;display:block;margin:8px 0;aspect-ratio:16/9;object-fit:cover;background:var(--panel)}" +
    ".lg-card details{margin-top:6px}.lg-card summary{cursor:pointer;color:var(--accent);font-size:13px;font-weight:600}" +
    ".lg-card ul{margin:8px 0 0;padding-left:18px;font-size:13px;line-height:1.5;color:var(--fg)}";
  document.head.appendChild(st);
  var vp = document.querySelector('meta[name=viewport]');
  if (vp) vp.setAttribute("content", "width=device-width,initial-scale=1,viewport-fit=cover");
  if (typeof CARS === "undefined") return;
  var IMG = window.RC_LEGEND_IMG || {};
  var SPEC = {
    "Dirty Datsun (Anthony Palladino)": [
      "1969 Datsun Sport 2000 roadster body on a custom tube chassis with integrated cage (C5 Corvette running gear)",
      "5.7L LS1, Holley STS twin-turbo kit at 6 psi, about 500 hp",
      "TREMEC T56 transaxle, Spec II clutch, Fidanza flywheel",
      "Penske shocks, Eibach springs, Hotchkis sway bars, C6 Z06 6-piston front brakes",
      "18\" TSW Nurburgring wheels on Yokohama Advan A052 tires",
      "Custom widebody, ducted hood, splitter, diffuser, Holley 12\" Pro Dash",
      "Optima Ultimate Street Car: Outlaw Class National Champion in his first racing season",
      "Built by owner Anthony Palladino in just over a year"
    ],
    "Texaco Camaro (Jason Bottenfield)": [
      "1969 Chevrolet Camaro RS, frame-off build with one-off aero by DuSold Designs (TX)",
      "2019 LT5 crate engine, Eaton 2650 supercharger at ~14 psi, MoTeC management",
      "760 whp / 720 lb-ft, 162.4 mph best at Road America",
      "One-off SADEV sequential gearbox, narrowed Speedway 9\" rear, 3.70 gears",
      "Texaco-style livery in PPG satin, #18 on the doors (his high school baseball number)",
      "2020: 1st GTV at NCM; 1st First-Timer at Pikes Peak",
      "2021: Optima GTV National Champion",
      "2022: Pro Class win at Goodguys Texas; 1st GTV at Road America",
      "3,000+ build hours"
    ]
  };
  var oldList = list;
  list = function () {
    oldList();
    var el = document.getElementById("list");
    el.querySelectorAll(".car").forEach(function (row) {
      var nm = row.querySelector(".nm"); if (!nm) return;
      var n = nm.textContent, sp = SPEC[n]; if (!sp) return;
      var info = (window.RC_INFO || {})[n] || {};
      var c = CARS.find(function (x) { return x.n === n; }); var g = caught.get(c.id);
      var d = document.createElement("div"); d.className = "lg-card";
      d.innerHTML = '<div class="bar" style="background:' + T[c.t].c + ';height:auto;border-radius:2px"></div><div>' +
        '<div class="rw"><div class="nm" style="font-weight:600">' + n + '</div><span class="tag" style="color:' + (g ? "var(--ok)" : T[c.t].c) + '">' + (g ? "CAUGHT" : "ONE-OF-ONE") + '</span></div>' +
        '<div class="sub">Hometown Legend · 10,000 pts</div>' +
        (IMG[n] ? '<img alt="' + n + '" src="' + IMG[n] + '">' : "") +
        '<details><summary>Specs &amp; wins</summary><ul>' + sp.map(function (s) { return "<li>" + s + "</li>"; }).join("") + '</ul>' +
        (info.u ? '<p class="sub" style="margin:8px 0 0"><a href="' + info.u + '" target="_blank" rel="noopener" style="color:var(--accent)">More photos (LSX Magazine) ↗</a></p>' : "") + '</details></div>';
      row.replaceWith(d);
    });
  };
  if (typeof me !== "undefined" && me) list();
})();
