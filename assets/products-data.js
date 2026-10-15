/* EveryBeloved — product catalog.
   Add a new product = add one object here. It appears on index (first 3),
   shop.html grid, and gets its own page at product.html?id=<id>
   Fields: id, name, price (free shipping included), tagline, desc, badge,
   cat ("daily" | "decor" | "custom"), img (photo path), features, specs.
   HONESTY RULE: only state what is true — solid metal, QC photo before
   shipping, personal handling by Eidon, tracked worldwide delivery,
   QC-first guarantee. NO process claims (no "laser", no "engraved",
   no permanence claims). Keep copy about the keepsake, not the craft. */
window.PRODUCTS = [
  {
    id: "photo-memory-pendant",
    name: "Photo Memory Pendant",
    price: "$34.99",
    tagline: "Their face, close to yours.",
    desc: "A close-up of them, set into a brushed metal round pendant on a 45cm chain. Send your favorite photo after ordering — we'll confirm it looks right before anything is made. Ships in a gift box.",
    badge: "Most loved",
    cat: "custom",
    stock: true,
    img: "assets/products/photo-pendant.jpg",
    features: [
      {t: "Their photo, front and center", d: "A tight crop of their face works best — the expression you knew best, worn close every day."},
      {t: "Made to wear every day", d: "A smooth brushed finish — the photos show exactly how it looks in daylight."},
      {t: "Checked before it ships", d: "Your piece is QC-checked and photographed before it leaves — you see the photos."},
      {t: "Gift-ready", d: "Arrives in a small gift box with a care card — ready to give, or to keep for yourself."}
    ],
    specs: [
      ["Finish", "Brushed metal, as photographed"],
      ["Pendant", "25mm round, brushed finish"],
      ["Chain", "45cm + 5cm extender"],
      ["Photo", "Yours, sent after order — we confirm it before making"],
      ["Delivery", "10–15 days worldwide, tracked"]
    ]
  },
  {
    id: "paw-print-pendant",
    name: "Paw Print Keepsake Pendant",
    price: "$36.99",
    tagline: "The print they actually left.",
    desc: "Their real paw or nose print, reproduced on a 22mm metal pendant. Send a clear photo of the print — a clay or ink impression photographed in daylight is ideal. Ships in a gift box.",
    badge: "The real print",
    cat: "custom",
    stock: true,
    img: "assets/products/paw-pendant.jpg",
    features: [
      {t: "Their print, not a stock icon", d: "Most shops sell a generic paw stamp. Yours is made from your photo of the print they really left."},
      {t: "Any paw, any size", d: "Dogs, cats, rabbits, hamsters, guinea pigs, even birds' feet. A clear, well-lit photo is all we need."},
      {t: "Made to wear every day", d: "A smooth brushed finish — the photos show exactly how it looks in daylight."},
      {t: "Checked before it ships", d: "QC-checked and photographed before it leaves — you see the photos."}
    ],
    specs: [
      ["Finish", "Brushed metal, as photographed"],
      ["Pendant", "22mm round, brushed finish"],
      ["Chain", "45cm + 5cm extender"],
      ["Print", "Your photo of their paw or nose print"],
      ["Delivery", "10–15 days worldwide, tracked"]
    ]
  },
  {
    id: "keepsake-pendant",
    name: "Keepsake Pendant",
    price: "$39.99",
    tagline: "A pinch of them, kept close.",
    desc: "A hollow bone-shaped metal pendant with a screw-top cap. It ships empty — you fill it at home with a pinch of fur or ashes, whenever you're ready. A tiny funnel is included.",
    badge: "Ships empty",
    cat: "custom",
    stock: true,
    img: "assets/products/keepsake-pendant.jpg",
    features: [
      {t: "Ships empty — you fill it at home", d: "Nothing cremated ever crosses a border. The chamber arrives sealed and empty; a funnel is included so you fill it yourself, in your own time."},
      {t: "Screw-top seal", d: "Opens with a twist and closes tight. Holds a small pinch — enough to keep something of them close."},
      {t: "Made to wear every day", d: "A smooth brushed finish — the photos show exactly how it looks in daylight."},
      {t: "Quiet by design", d: "Reads as a simple bone-shaped pendant. Only you know what's inside — that's rather the point."}
    ],
    specs: [
      ["Finish", "Brushed metal, as photographed"],
      ["Pendant", "32 × 14mm bone shape, hollow chamber"],
      ["Chain", "45cm + 5cm extender"],
      ["Filling", "A pinch of fur or ashes, filled by you at home"],
      ["Delivery", "10–15 days worldwide, tracked"]
    ]
  },
  {
    id: "voice-name-bar",
    name: "Voice & Name Bar Pendant",
    price: "$32.99",
    tagline: "Their name — or their words.",
    desc: "A slim vertical bar with your pet's name and the years you had together. For talking birds, we can add the words only they said. Ships in a gift box.",
    badge: "For every species",
    cat: "custom",
    stock: true,
    img: "assets/products/bar-pendant.jpg",
    features: [
      {t: "Names, dates, short phrases", d: "Their name, the years you had together, or a few words that say it."},
      {t: "For talking birds", d: "Parrots and mynas say things only they said. Send us the words and we'll put them on the bar — a keepsake no dog or cat shop offers."},
      {t: "Quiet, everyday design", d: "Reads as a simple slim bar. Meaningful without being overt — easy to wear daily."},
      {t: "Made to wear every day", d: "A smooth brushed finish — the photos show exactly how it looks in daylight."}
    ],
    specs: [
      ["Finish", "Brushed metal, as photographed"],
      ["Pendant", "38 × 8mm vertical bar"],
      ["Chain", "45cm + 5cm extender"],
      ["Text", "Name + dates, a short phrase, or a bird's words"],
      ["Delivery", "10–15 days worldwide, tracked"]
    ]
  },
  {
    id: "heart-photo-pendant",
    name: "Heart Photo Pendant",
    price: "$32.99",
    tagline: "For the one still here.",
    desc: "The same photo keepsake in a heart shape — an easy gift for the pet parent whose companion is still around. Send your favorite photo after ordering. Ships in a gift box.",
    badge: "Gift",
    cat: "custom",
    stock: true,
    img: "assets/products/heart-pendant.jpg",
    features: [
      {t: "A gift that lands", d: "For the pet parent whose best friend is still here — the kind of present people don't buy themselves and never forget receiving."},
      {t: "Their photo, worn close", d: "A tight crop of their face works best. We'll confirm your photo before anything is made."},
      {t: "Made to wear every day", d: "A smooth brushed finish — the photos show exactly how it looks in daylight."},
      {t: "Gift-ready", d: "Arrives in a small gift box with a care card."}
    ],
    specs: [
      ["Finish", "Brushed metal, as photographed"],
      ["Pendant", "24mm heart, brushed finish"],
      ["Chain", "45cm + 5cm extender"],
      ["Photo", "Yours, sent after order — we confirm it before making"],
      ["Delivery", "10–15 days worldwide, tracked"]
    ]
  }
];
