/* window.__BRAND__ — canonical content data.
   Project detail pages are hardcoded HTML (content must survive JS failure);
   this manifest only drives the Work grid, Home teaser and filter bar. */
(function () {
  "use strict";

  window.__BRAND__ = {
    name: "Julian Toquica",
    role: "3D Artist & AI Designer",
    tagline: "3D artist and designer working the seam between traditional craft and generative AI.",

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
      { id: "product", label: "3D + AI · Product" }
    ],

    /* order matters for the Work grid; "featured" projects surface on Home */
    projects: [
      { id: "gum-house", category: "environments", title: "Gum House", tagline: "A candy pagoda, floating.", tools: ["Blender", "Substance"], featured: true, status: "live" },
      { id: "snow-base", category: "environments", title: "Snow Base", tagline: "Layered mountain composition.", tools: ["Blender", "Substance"], featured: false, status: "live" },
      { id: "orange-train-station", category: "environments", title: "Orange Train Station", tagline: "Grease-pencil 2D built into the 3D from the start.", tools: ["Blender", "Substance"], featured: true, status: "live" },
      { id: "castillo-bosque", category: "environments", title: "Forest Castle", tagline: "A gothic silhouette, staged in depth.", tools: ["Blender", "Substance", "Gaea", "Nuke", "Geoscatter"], featured: true, status: "live" },
      { id: "castillo-calle-medieval", category: "environments", title: "Medieval Street Castle", tagline: "The same castle, rebuilt as a modular kit.", tools: ["Blender", "Substance", "Geoscatter", "Nuke"], featured: false, status: "live" },
      { id: "bubbles-environments", category: "environments", title: "Bubbles and Friends — Sets", tagline: "Sets built for a real animated series.", tools: ["Blender", "Substance"], featured: false, status: "live" },
      { id: "composicion-automovil", category: "environments", title: "Road Composition", tagline: "A Nuke-first exploration in scene composition.", tools: ["Nuke", "Blender"], featured: false, status: "upcoming" },
      { id: "orange-train-station-v2", category: "environments", title: "Orange Train Station v2", tagline: "Same graphic language, new concept.", tools: ["Blender", "Substance"], featured: false, status: "upcoming" },

      { id: "can-anybody-hear-me", category: "characters", title: "Can Anybody Hear Me?", tagline: "Izumi and MiniIzumi, modeled in 3D and staged with AI.", tools: ["Blender", "Substance", "ZBrush", "Midjourney", "Weave"], featured: true, status: "live" },
      { id: "agnes", category: "characters", title: "Agnes", tagline: "A robot rabbit in a gas mask.", tools: ["Blender", "Substance", "ZBrush", "Marmoset"], featured: true, status: "live" },
      { id: "goblin", category: "characters", title: "Goblin", tagline: "Client work, built for VFX integration.", tools: ["Blender", "Substance", "ZBrush"], featured: false, status: "live" },
      { id: "bubbles-characters", category: "characters", title: "Bubbles and Friends — Cast", tagline: "Five characters, one real production.", tools: ["Blender", "Substance", "ZBrush"], featured: false, status: "live" },

      { id: "teradar", category: "product", title: "Teradar", tagline: "Product render meets a custom point-cloud system.", tools: ["Blender", "Midjourney", "Weave"], featured: true, status: "live" },
      { id: "natilus", category: "product", title: "Natilus", tagline: "Compositing a real aircraft into AI-built worlds.", tools: ["Blender", "Hunyuan 3D", "Meshy", "Midjourney", "Weave", "Photoshop", "After Effects"], featured: true, status: "live" },
      { id: "kosmo", category: "product", title: "Kosmo", tagline: "A 360° capture device, rendered and animated.", tools: ["Blender", "Substance", "After Effects", "Weave"], featured: true, status: "live" }
    ]
  };
})();
