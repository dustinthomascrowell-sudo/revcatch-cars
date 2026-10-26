/* Hometown Legend photos, stored in Supabase (cars_imgs RPC). Loads, then redraws the garage list. */
(function () {
  var K = "sb_publishable_uS4a9iqB3eS3Lya8B21NGw_fozLbuVF";
  fetch("https://hmfgxxmrrpknjpiqciru.supabase.co/rest/v1/rpc/cars_imgs", { method: "POST", headers: { apikey: K, Authorization: "Bearer " + K, "Content-Type": "application/json" }, body: "{}" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      if (!d) return;
      var m = window.RC_LEGEND_IMG = window.RC_LEGEND_IMG || {};
      m["Dirty Datsun (Anthony Palladino)"] = [d.dd1, d.dd2].filter(Boolean);
      m["Texaco Camaro (Jason Bottenfield)"] = [d.tc1, d.tc2].filter(Boolean);
      if (typeof me !== "undefined" && me && typeof list === "function") list();
    }).catch(function () {});
})();
