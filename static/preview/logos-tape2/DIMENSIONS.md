# VHS base dimensions

All dimensions below are **mm**. Origin is the rear-left corner of the label face; +y runs toward the front flap. Measured **TDK-style VHS shell**, not certified CAD.

| Feature | Geometry used | Basis |
|---|---|---|
| Cassette / SVG canvas | 187 × 103; thickness 25 | VHS nominal dimensions [W]; requested canvas |
| Reel axes | (47.5,47.5), (139.5,47.5); spacing 92 | TDK cap arcs [T], open-shell check [O]; shared D-9 interface cross-check [S] |
| Axis offsets | 47.5 from nearest side/rear; 55.5 from front | Derived from axes/canvas |
| Winding hub / lower flange | Ø26 / Ø90 | [S] fig.10; VHS photo cross-check; **not independently verified from IEC fig.5** |
| Top-face label recess | x53.4, y23.4, w80.2, h48.0; r2.2 | Measured [T]; JVC comparison [J] |
| Left/right windows, bounding boxes | (5.6,23.7,42.2,47), (139.2,23.7,42.2,47) | Measured [T]; curved outer edges, r2.3 inner corners; exact paths in JSON |
| Front cover projection / lip | y92.5–102.7; lip y101.7 | Measured [T]; side hinge axis approximately y89 |
| Rear/front grip bands | y2.5–21.5 / y73–90.3 | Measured [T]; ribs at 1.15 pitch are a simplified waffle grip |
| Rear/front corners / bevel | r5 / r2; inset 1.6 | Photo estimates [T], approximately ±1 |
| Rental sticker | (23.5,5.5,140,14), −3° about (93.5,12.5) | Design choice over rear grip; **not a molded recess** |

**Measurement:** [T] original 4400×2700 px; cassette crop (410,370)–(3988,2328), rotated 180°. Scale is 187/3578 = **0.052264 mm/px**, uniform in both axes. Projected depth is 102.33 mm; the 0.67 mm canvas difference is not stretched away. Estimates approximately ±1 mm; overlay checked within 1–2 mm. Landmarks/comparison: `references/measurements.json` and `overlay-comparison.png`.

**Standards distinction:** [S] ST 317 is **D-9**, not consumer VHS: fig.1 gives 188±0.3 × 104±0.5 × 25±0.2. Figs.2/3 specify permissible window/label areas, not TDK tooling. [I] IEC 60774-1 §2.1 points to cassette figs.1–4 and reel fig.5; the accessible preview excludes those figures. 

**Orientation / simplifications:** Face recess is central; rear spine label is vertical. Orange rental sticker covers the upper rear grip. `#label-slot` uses the true recess; `#rental-label-slot` uses the sticker coordinates. Record-protect tab is on the vertical rear wall and invisible here (`#tab` is intentionally empty). Five underside screws and underside drive sockets are omitted. Upper hubs are capped with collar ribs. Small face attachment dimple, maker marks, waffle microgeometry/mechanisms are simplified. Smoke translucency is a flat illustration.

Sources: [W: Wikipedia VHS](https://en.wikipedia.org/wiki/VHS#Cassette_and_tape_design) (text CC BY-SA); [S: SMPTE ST 317 PDF](https://pub.smpte.org/pub/st317/st0317-1999_stable2010.pdf) (© SMPTE); [I: IEC adoption preview](https://cdn.standards.iteh.ai/samples/4733/14deed314a24483e839e57eb8e9b47b7/SIST-EN-60774-1-1999.pdf) (© IEC/SIST); [T: TDK, Evan-Amos](https://commons.wikimedia.org/wiki/File:VHS-Video-Tape-Top-Flat.jpg) (public domain); [J: JVC, Dillan Payne](https://commons.wikimedia.org/wiki/File:JVC_SX_Gold_T-120_VHS_Tape_(Front).jpg) (CC BY-SA 4.0); [O: open VHS, Alexander Jones](https://commons.wikimedia.org/wiki/File:VHSTapeOpen.jpg) (public domain). Additional photo credits: `references/REFERENCES.md`.
