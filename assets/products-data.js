/* Eidon Sourcing — product catalog. Add a new product = add one object here.
   It appears automatically on index (first 3), shop.html grid, and gets its
   own detail page at product.html?id=<id>
   Fields: id, name, price (free shipping included), tagline, desc, badge,
   stock (true = in stock; set false to hide when sold out; no count shown), curator_note
   (personal note shown on detail page), img (optional photo path), features, specs */
window.PRODUCTS = [
  {
    id: "bag-charm-trio",
    name: "Bag Charm Trio",
    price: "$24.99",
    tagline: "Three bag charms. One statement bag.",
    desc: "Three hand-finished charms in mixed finishes — engineered to hang straight, built to survive daily keys-and-chaos. Ships in a gift pouch. Free worldwide shipping included.",
    badge: "Free shipping",
    stock: true,
    curator_note: "",
    features: [
      {t: "Curated picks", d: "Selected accessories, not random marketplace filler."},
      {t: "Built to last", d: "Solid hardware, reinforced clasps, 200+ cycle tested."},
      {t: "Mix & match", d: "Three finishes designed to stack or swap daily."},
      {t: "Gift-ready", d: "Soft pouch + gift box, ready to give as-is."}
    ],
    specs: [
      ["Material", "316 stainless steel, acrylic, alloy"],
      ["Length", "9–11 cm per charm"],
      ["Weight", "~28 g total"],
      ["In the box", "3 charms + gift pouch + care card"]
    ]
  },
  {
    id: "chunky-chain-necklace",
    name: "Chunky Chain Necklace",
    price: "$29.99",
    tagline: "The streetwear power piece. No brand tax.",
    desc: "Thick 316 stainless steel chain with a weight that feels intentional. Does not fade, does not turn your neck green. Free worldwide shipping included.",
    badge: "Free shipping",
    stock: true,
    curator_note: "",
    features: [
      {t: "316 stainless steel", d: "Sweat-proof, shower-proof, does not fade or turn skin green."},
      {t: "Real weight", d: "Feels substantial — not hollow costume jewelry."},
      {t: "Unisex", d: "One size, 50–55 cm, works across every fit."},
      {t: "Layers well", d: "Designed to stack with thinner chains or wear solo."}
    ],
    specs: [
      ["Material", "316 stainless steel"],
      ["Length", "50–55 cm"],
      ["Weight", "~85 g"],
      ["In the box", "chain + gift pouch + care card"]
    ]
  },
  {
    id: "claw-clip-set",
    name: "Claw Clip Set (4 pcs)",
    price: "$19.99",
    tagline: "Four finishes. A week of effortless updos.",
    desc: "Matte black, tortoiseshell, pearl and color-pop — four clips that hold thick hair without slipping, styled as part of the look. Free worldwide shipping included.",
    badge: "Free shipping",
    stock: true,
    curator_note: "",
    features: [
      {t: "Holds thick hair", d: "Strong spring, tested on thick and curly hair types."},
      {t: "Four finishes", d: "Matte, tortoiseshell, pearl, color-pop — one per mood."},
      {t: "Gentle teeth", d: "Rounded teeth grip without snapping strands."},
      {t: "Travel pouch", d: "Comes with a soft pouch so they don't scratch each other."}
    ],
    specs: [
      ["Material", "Acrylic, steel spring"],
      ["Size", "8–11 cm per clip"],
      ["Weight", "~90 g set"],
      ["In the box", "4 clips + soft pouch"]
    ]
  },
  {
    id: "beaded-phone-charm",
    name: "Beaded Phone Charm",
    price: "$14.99",
    tagline: "Beaded phone charm. Secure anti-loss patch.",
    desc: "Beaded phone charm with a secure anti-loss patch — the accessory your phone case was missing. Free worldwide shipping included.",
    badge: "Free shipping",
    stock: true,
    curator_note: "",
    features: [
      {t: "Beaded", d: "Securely strung with an anti-loss patch."},
      {t: "Anti-loss patch", d: "Sticker patch threads through any case — holds firm."},
      {t: "Colorways", d: "Three palettes: earth, pastel, monochrome."},
      {t: "Feather-light", d: "Adds style without weight — ~15 g with patch."}
    ],
    specs: [
      ["Material", "Acrylic & glass beads, nylon cord"],
      ["Length", "16–18 cm drop"],
      ["Weight", "~15 g"],
      ["In the box", "charm + anti-loss patch + spare knot"]
    ]
  },
  {
    id: "resin-ring",
    name: "Colorful Resin Ring",
    price: "$12.99",
    tagline: "One pop of color, stacked or solo.",
    desc: "Resin ring in saturated colorways — light on the hand, loud on the fit. Free worldwide shipping included.",
    badge: "Free shipping",
    stock: true,
    curator_note: "",
    features: [
      {t: "Resin", d: "Polished smooth, saturated color."},
      {t: "Saturated color", d: "Pigment mixed in, not painted on — won't chip off."},
      {t: "Feather-light", d: "~3 g. You forget it's on until someone compliments it."},
      {t: "Stackable", d: "True-to-size bands designed to stack in pairs."}
    ],
    specs: [
      ["Material", "Epoxy resin, hand-polished"],
      ["Sizes", "US 6 / 7 / 8"],
      ["Weight", "~3 g"],
      ["In the box", "ring + micro pouch"]
    ]
  },
  {
    id: "canvas-tote-bundle",
    name: "Canvas Tote + Charm Bundle",
    price: "$52.99",
    tagline: "The full kit: tote, charm, chain. Save 18%.",
    desc: "The complete carry kit — printed canvas tote, one bag charm and a mini chain, curated to work as one look. Free worldwide shipping included.",
    badge: "Best value",
    stock: true,
    curator_note: "",
    features: [
      {t: "Curated as one look", d: "Colors and finishes chosen to work together, not just stacked."},
      {t: "Heavy canvas", d: "12 oz washed canvas — structured, not floppy."},
      {t: "Save 18%", d: "Bundle pricing under the cost of buying pieces separately."},
      {t: "Gift-ready", d: "Ships boxed — the easiest 'I saw this and thought of you' gift."}
    ],
    specs: [
      ["Tote", "12 oz washed canvas, 34 × 30 × 10 cm"],
      ["Includes", "tote + bag charm + mini chain"],
      ["Weight", "~420 g"],
      ["In the box", "all pieces + gift box"]
    ]
  }
];
