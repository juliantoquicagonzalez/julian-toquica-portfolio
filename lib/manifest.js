/* window.__BRAND__ — canonical content data.
   Project detail pages and the Work grid are hardcoded HTML (content must
   survive JS failure); this manifest only drives the contact form and the
   filter bar's list of valid category ids. */
(function () {
  "use strict";

  window.__BRAND__ = {
    contact: {
      email: "juliantoquicagonzalez@gmail.com",
      phone: "+57 300 711 8001",
      artstation: "https://www.artstation.com/juliantoquica",
      behance: "https://www.behance.net/juliantoquica",
      linkedin: "https://www.linkedin.com/in/julian-toquica/"
    },

    categories: [
      { id: "environments", label: "Environments" },
      { id: "characters", label: "Characters" },
      { id: "product", label: "3D + AI · Product" },
      { id: "motion", label: "Motion & Animation" }
    ]
  };
})();
