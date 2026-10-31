/* Exploratory designs, deliberately separate from the canonical skin registry.
 * AUDHD-08 / GUIDE.md#audhd-08-use-visuals-to-support-decisions:
 * every palette uses the same named roles so comparisons have a stable meaning.
 * Regional references describe creative starting points, not cultural authenticity.
 */
window.SKIN_STUDIES = [
  {
    id: 'murica', name: 'Murica', description: 'Americana · ten light studies',
    note: 'Print shops, diners, civic lettering, denim and roadside signage. All ten use light reading surfaces.',
    variants: [
      ['M01', 'Union Paper', 'Warm paper, navy ink and a restrained flag red.', 'Fraunces', 'Source Sans 3', '#f7f2e8 #fffdf7 #142b48 #a62c35 #244d72 #d2a553 #296a57 #a62c35'],
      ['M02', 'Federal Ledger', 'Engraved civic lettering, parchment and oxblood.', 'Libre Baskerville', 'Public Sans', '#f1ede2 #fffcf2 #243347 #7d2435 #355681 #b38c4a #486044 #9e3032'],
      ['M03', 'Denim & Canvas', 'Washed canvas, workwear blue and brick stitching.', 'Bitter', 'IBM Plex Sans', '#eee8db #faf6ec #263b48 #365e80 #a14734 #c89449 #4e6954 #a03635'],
      ['M04', 'Route 66', 'Road-sign proportions, cream enamel and petrol blue.', 'Oswald', 'Barlow', '#fff2d8 #fffaf0 #243a44 #a52e2a #176475 #dbaa37 #4b6c4d #b12d31'],
      ['M05', 'County Fair', 'Bold poster lettering with cherry, mustard and sky.', 'Archivo Black', 'Atkinson Hyperlegible', '#fff6e8 #fffdf6 #352c3a #b72c42 #326b99 #e1ae38 #407453 #ac3043'],
      ['M06', 'General Store', 'Slab-serif storefront lettering and faded red paint.', 'Bevan', 'Work Sans', '#f6ead7 #fff8ec #3f322a #943d31 #3a596a #b69058 #537148 #963c37'],
      ['M07', 'Lakehouse', 'Sun-bleached boards, lake blue and cranberry.', 'Arvo', 'Nunito Sans', '#eef2ed #fcfffa #23414b #28657a #a53f49 #c1a46a #35745d #a73146'],
      ['M08', 'Sunday Edition', 'Editorial type, newsprint, blue ink and scarlet.', 'Newsreader', 'Libre Franklin', '#f4f0e8 #fffdf8 #252b3a #9d273b #1e4b7b #ad895b #38654d #a62a36'],
      ['M09', 'Soda Counter', 'Chunky diner lettering, pale aqua and cherry red.', 'Bungee', 'DM Sans', '#edf7f4 #fffcf3 #203e4b #ae2e3e #266b77 #dd9e58 #26735c #b73349'],
      ['M10', 'Porchlight', 'An elegant Americana palette of ivory, indigo and dusty rose.', 'Playfair Display', 'Lato', '#f8f0e8 #fffaf5 #353746 #873b4d #3f537d #c59a65 #486b55 #9a3542']
    ]
  },
  {
    id: 'canto', name: 'Canto', description: 'Contemporary Cantonese city influences',
    note: 'Hong Kong print, tiled cafés, harbor light and contemporary signage; modern type rather than imitation brush lettering.',
    variants: [
      ['C01', 'Harbor Glass', 'Cool glass, jade water and a sharp vermilion accent.', 'Space Grotesk', 'Noto Sans', '#eef6f3 #fcfffd #163e3c #14665f #b64b36 #8ec9bd #23735a #b43b37'],
      ['C02', 'Neon Receipt', 'A light receipt-paper canvas with violet and coral signage.', 'Syne', 'DM Sans', '#f8f2fa #fffcff #33213f #773998 #b83852 #f2b24c #34745d #b33148'],
      ['C03', 'Jade Tile', 'Green café tiles, warm porcelain and red stamps.', 'Chivo', 'Source Sans 3', '#edf2df #fafbef #253d31 #3d684f #a44435 #c6a253 #416640 #ad3735'],
      ['C04', 'Tram Signal', 'Condensed signage, enamel white and tram green.', 'Barlow Condensed', 'Barlow', '#f1f5ee #ffffff #253d37 #196952 #ae3a33 #e3b14c #2f7154 #b43a35'],
      ['C05', 'Tea Counter', 'Milk-tea cream, espresso ink and lacquer red.', 'Outfit', 'Manrope', '#f7eee1 #fffaf0 #413328 #9d4131 #48625b #d0a16d #486c50 #a23b32'],
      ['C06', 'Kowloon Print', 'Geometric magazine type with cobalt, raspberry and lemon.', 'Urbanist', 'Figtree', '#f4f4f8 #ffffff #242840 #2854a2 #b53167 #e9c951 #28765b #b73748'],
      ['C07', 'Pearl River', 'Silver-blue paper with aquatic teal and plum.', 'Sora', 'IBM Plex Sans', '#edf5f8 #faffff #253e4b #216b80 #79466f #a6c6d2 #347862 #a13e52'],
      ['C08', 'Night Ferry', 'An evening alternative: ink harbor, mint light and coral.', 'Exo 2', 'Inter', '#102d35 #183c45 #f0faf6 #9fe0cd #ffb9a3 #96b9eb #a6dfac #ffb6b3'],
      ['C09', 'Porcelain Studio', 'Clean multilingual typography, blue porcelain and persimmon.', 'Noto Sans HK', 'Noto Sans', '#f5f5ed #fffffa #263649 #315f9e #b5482d #cfb373 #3b765a #b13b40'],
      ['C10', 'Signwriter', 'Wide futuristic lettering over pale pink and ultramarine.', 'Unbounded', 'Public Sans', '#faf0ee #fffaf9 #372f46 #4c47a4 #aa4057 #d6b354 #4f7252 #ac3548']
    ]
  },
  {
    id: 'szechuan', name: 'Szechuan', description: 'Historical Chinese material and print influences',
    note: 'Sichuan-inspired tea, bamboo and lacquer, alongside broader Chinese ceramic and scholarly-material references. Mandarin is a language; these are creative studies, not a reconstruction of one historical style.',
    variants: [
      ['S01', 'Bamboo Manuscript', 'Bamboo green, warm paper and cinnabar seals.', 'Cormorant Garamond', 'Noto Sans', '#f1efde #fbfaed #2d392c #496142 #a44532 #b39757 #436a46 #a2382e'],
      ['S02', 'Cinnabar Seal', 'Cream writing paper with ink black and seal red.', 'Noto Serif SC', 'Source Sans 3', '#f8f0df #fff9eb #342e29 #a33224 #476453 #bd9953 #496c4e #a33224'],
      ['S03', 'Celadon Vessel', 'Quiet celadon, dark jade and weathered bronze.', 'Marcellus', 'Lato', '#eaf0e5 #f8fbf1 #243c34 #2e6557 #7c5d35 #a1b9a0 #356f4d #a34435'],
      ['S04', 'Tea Horse Road', 'Worn parchment, saddle brown and muted turquoise.', 'Forum', 'Work Sans', '#f2e4cd #fff3df #493728 #805035 #3a6970 #bf9047 #526d48 #a64233'],
      ['S05', 'Scholars Ink', 'Bookish serif on rice-colored paper, charcoal and plum.', 'EB Garamond', 'Noto Sans', '#f3f1e8 #fffef5 #2e3034 #5a4357 #486264 #bb9d62 #4b6a4e #a43c43'],
      ['S06', 'Lacquer Cabinet', 'A dark alternative: black lacquer, cinnabar and old gold.', 'Cormorant SC', 'Source Sans 3', '#221b19 #332521 #fff3dc #efbc73 #ef9c88 #bcbf93 #bbd39a #ffb3a2'],
      ['S07', 'Bronze Inscription', 'Oxidized bronze, mineral green and pale stone.', 'Cinzel', 'IBM Plex Sans', '#ece9d8 #faf7e9 #343c31 #526749 #8e5a34 #b38e4d #4d7048 #9e3c31'],
      ['S08', 'Blue Kiln', 'Blue-and-white ceramic contrast with a copper accent.', 'Bodoni Moda', 'Nunito Sans', '#f0f3ee #fffffb #263b56 #285b91 #a45a3b #acbdc3 #3f735e #ad3d42'],
      ['S09', 'Chengdu Teahouse', 'Timber, tea green and a warm porcelain ground.', 'Noto Serif TC', 'Public Sans', '#eee7d5 #fbf6e9 #3c3b2b #58653b #8b4b34 #c7a96a #4e6c42 #a03c32'],
      ['S10', 'Peony Album', 'Botanical-paper colors: peony, sage and softly aged gold.', 'GFS Didot', 'Figtree', '#f9efeb #fffbf6 #44343a #964c61 #526e54 #c9a66b #4c7351 #aa3c47']
    ]
  },
  {
    id: 'souk', name: 'Souk', description: 'North African and Middle Eastern material influences',
    note: 'Distinct references to tile, textiles, stone, brass and regional craft. No single palette stands for these diverse cultures.',
    variants: [
      ['K01', 'Zellige Courtyard', 'Moroccan tile blues and greens against plaster white.', 'Prata', 'Noto Sans', '#f5f0e3 #fffaf0 #254447 #176b75 #537348 #be9145 #3b7152 #a13e34'],
      ['K02', 'Brass & Indigo', 'Brass shopfronts, indigo textiles and warm limestone.', 'El Messiri', 'Source Sans 3', '#f2e8d4 #fff6e5 #32394a #364d8a #8a6131 #c69c47 #3d705a #a33d3e'],
      ['K03', 'Atlas Rose', 'Rose-colored earth, woven cream and mountain green.', 'Lora', 'Karla', '#f7eae2 #fff7ef #4b3430 #a14e3e #48665b #cda068 #48714e #a63a38'],
      ['K04', 'Damascus Inlay', 'Walnut, ivory and teal with flowing Naskh-family type.', 'Noto Naskh Arabic', 'Noto Sans', '#eee6d8 #fff7e8 #3c302b #73533c #226b68 #b99a60 #426b4e #a43c3a'],
      ['K05', 'Salt & Azure', 'Chalk-white walls, azure doors and a sun-warmed ochre.', 'Bellefair', 'Manrope', '#f1f6f3 #ffffff #243d51 #256895 #8d5c25 #d1b166 #35735c #ae3c45'],
      ['K06', 'Levant Garden', 'Olive leaves, fig purple and pale courtyard stone.', 'Amiri', 'Lato', '#f0efdf #fbfbed #3b3e31 #5a6a3b #734468 #c6a16c #4a6d43 #a53c3b'],
      ['K07', 'Caravan Textile', 'Terracotta, pomegranate and indigo on woven cream.', 'DM Serif Display', 'Work Sans', '#f6e8d3 #fff5e7 #49352c #9d4632 #514d82 #ca983e #557249 #a6363b'],
      ['K08', 'Night Bazaar', 'A dark study in midnight indigo, lantern brass and turquoise.', 'Yeseva One', 'DM Sans', '#20293a #2e394a #fff2da #e4bd75 #91d5cb #c3b1e4 #b3dca5 #ffb1a9'],
      ['K09', 'Copper Workshop', 'Hammered copper, deep teal and sand-colored plaster.', 'Aref Ruqaa', 'Public Sans', '#f3e6d8 #fff5ea #40342e #915539 #316764 #c99d64 #4e7052 #a33c35'],
      ['K10', 'Palm Shade', 'Pale sand, date-palm green and a quiet violet.', 'Spectral', 'Figtree', '#f4efdf #fffbee #303c32 #3f6652 #7c536f #bba05e #416c4b #a5433c']
    ]
  },
  {
    id: 'hacienda', name: 'Hacienda', description: 'South American landscape and craft influences',
    note: 'Andean textiles, Colombian courtyards, Brazilian modernism and Southern Cone landscapes. Each study identifies its own reference rather than treating the continent as one style.',
    variants: [
      ['H01', 'Andean Weave', 'Andean-inspired woven reds, maize and highland blue.', 'Alegreya', 'Source Sans 3', '#f3e7d4 #fff6e8 #44352e #a0403b #386c80 #d5a544 #526b43 #aa373b'],
      ['H02', 'Coffee Courtyard', 'Colombian coffee-country greens, terracotta and cream.', 'Rokkitt', 'Lato', '#f0eadb #fff8e9 #343b2d #4c6740 #a34d35 #c5a269 #456c43 #a73c34'],
      ['H03', 'Patio Moderno', 'Brazilian modernist geometry in coral, teal and butter yellow.', 'Josefin Slab', 'Josefin Sans', '#fff0db #fffaf0 #364346 #a94a3d #24767b #deb85b #387254 #ad3a40'],
      ['H04', 'Valparaíso Color', 'Port-city paint: blue, ochre and berry over pale plaster.', 'Bree Serif', 'Barlow', '#f7efdf #fffaf3 #2e3e53 #246695 #9d4268 #d5a33a #397455 #af3947'],
      ['H05', 'Pampas Linen', 'Southern grasslands: flax, sage and leather brown.', 'Vollkorn', 'Nunito Sans', '#eee9dc #fbf8ed #3e4132 #5d6843 #88543e #b7a171 #4d7047 #9e4437'],
      ['H06', 'Cusco Clay', 'Highland clay, burgundy textiles and mineral turquoise.', 'Alegreya SC', 'Noto Sans', '#f5e4d5 #fff3e7 #4a302f #91403f #2e6e73 #c8a04e #536d43 #a73238'],
      ['H07', 'River House', 'River green, warm timber and a restrained orchid accent.', 'DM Serif Text', 'Karla', '#edf1df #faffee #25433d #286858 #87566b #c8a95b #397649 #a94245'],
      ['H08', 'Atacama Dusk', 'A dark desert study with copper light and dusty lavender.', 'Zilla Slab', 'IBM Plex Sans', '#352a32 #473641 #fff0df #f3bf86 #b8b4ec #dc9e9b #b9d8a2 #ffb4ad'],
      ['H09', 'Montevideo Print', 'Bookshop typography, paper cream and bottle green.', 'Literata', 'Libre Franklin', '#f1eddf #fffaf0 #293d3a #245e56 #965444 #b6a160 #3b7155 #a83b3e'],
      ['H10', 'Bahia Tiles', 'Bahian-inspired tile blues with mango and warm coral.', 'Bricolage Grotesque', 'DM Sans', '#eef7f3 #fffdf3 #23434d #266b89 #a74730 #e0b143 #32765d #af3c43']
    ]
  },
  {
    id: 'golden-child', name: 'Golden Child', description: 'Gold, brass and unconventional lettering',
    note: 'Static metallic edges and highlights; reading surfaces stay flat. Metallic treatments are simulations, not reflective material.',
    variants: [
      ['G01', 'Brass Cabinet', 'Warm brass on ivory with theatrical display lettering.', 'Rye', 'Work Sans', '#f7efdc #fffaec #41351e #806024 #466059 #bba169 #556b3e #a54235'],
      ['G02', 'Black Gold', 'Polished gold over near-black, with sharply cut letterforms.', 'Cinzel Decorative', 'Manrope', '#1b1b18 #292820 #fff4d8 #e6bf68 #c9ad7e #a4c4bd #c1d595 #ffb4a4'],
      ['G03', 'Champagne Machine', 'Champagne metal, porcelain and a technical monospace headline.', 'Major Mono Display', 'Public Sans', '#f5f0e8 #fffcf4 #3f3931 #826737 #676b78 #c6b891 #547052 #aa453b'],
      ['G04', 'Gilded Play', 'Soft gold and plum with sculptural, curved lettering.', 'Dela Gothic One', 'Figtree', '#f8efd9 #fff9ea #463539 #885f29 #86537c #d3b464 #556c44 #a83b40'],
      ['G05', 'Machine Age', 'Brushed brass, graphite and angular art-deco lettering.', 'Limelight', 'Barlow', '#eae6dc #faf6ea #373a34 #79612c #3d6366 #b6a77a #526b44 #9f4439'],
      ['G06', 'Liquid Type', 'Honey gold, dark chocolate and fluid display forms.', 'Oi', 'DM Sans', '#30251d #443224 #fff4d8 #f0c567 #e1b28c #bdd2b6 #c4df9b #ffb7a0'],
      ['G07', 'Brass Circuit', 'Pale metal, verdigris and a futuristic squared heading.', 'Orbitron', 'IBM Plex Sans', '#eceee4 #fbfcee #2d3d36 #6d642e #316c64 #b6ab6c #45714b #a44439'],
      ['G08', 'Royal Oddity', 'Gold leaf, violet velvet and eccentric decorative lettering.', 'Almendra Display', 'Lato', '#f7efdf #fff9ec #45324a #836126 #704689 #cab76f #4d704a #a53e47'],
      ['G09', 'Gold Record', 'Cream vinyl sleeves, brass and bold rhythmic geometry.', 'Monoton', 'Source Sans 3', '#f6eddb #fff8e8 #39352a #816329 #506276 #c5a753 #4c714d #a63e35'],
      ['G10', 'Astral Foundry', 'Night plum, rose brass and dramatically curved letterforms.', 'Fascinate', 'Nunito Sans', '#2d2537 #3d3049 #fff1dc #e6be7f #e1aac8 #b7c4df #c1db9e #ffb1af']
    ]
  }
];

window.STUDY_ROLES = ['page', 'surface', 'ink', 'action', 'accent', 'ornament', 'success', 'danger'];
window.SKIN_STUDIES.forEach(group => group.variants = group.variants.map(([id, name, description, heading, body, colors]) => ({
  id, name, description, heading, body,
  colors: Object.fromEntries(window.STUDY_ROLES.map((role, i) => [role, colors.split(' ')[i]]))
})));
