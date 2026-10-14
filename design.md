# FluffyPens design

The public feed and Studio are a tight pin board. Reading-app references set the type. The board sets the layout.

## References

- Pinterest’s board: gray canvas, white cards, masonry, almost no page margin. Used as a layout reference, not as a copied product.
- [Book-reader pin](https://www.pinterest.com/pin/501518108527342240/). Serif for the poem, sans for the controls. Source Serif 4 instead of Playfair, because Playfair is too thin-and-thick for Roman Hindi on a phone.
- [Booki](https://www.behance.net/gallery/242274183/Booki-Mobile-Reading-App-UIUX-Case-Study) and [Matter](https://thesunrisedigest.com/daily/best-reading-apps-2026/). The opened poem is one column. The board is for scanning.

## Layout

Public feed is CSS columns: 2 on a phone, 3 from 760px, 4 from 1100px. Column gap is 8–10px. Cards are only as tall as the text. Six lines show on the board. The rest opens on the poem page.

Studio uses the same columns and the same card padding. Status filters stay in one scrolling row: Draft, In Progress, Ready, Recorded, Posted. The editor grows with the poem. It does not reserve a tall empty page.

Light is the default. Dark is `#191919` with `#2b2b2b` cards, not pure black.

## Type

- Poem lines: Source Serif 4. Board 14px / 1.35. Opened poem 18px / 1.5.
- Titles, search, filters, buttons: IBM Plex Sans. Board titles 15px.
- One verse face in the editor. No pasted Google Docs fonts.

## Color

Light canvas `#efefef`, card `#ffffff`, ink `#111111`, action `#e60023`.

Dark canvas `#191919`, card `#2b2b2b`, ink `#ffffff`, action `#e60023`.

Share photos use the same card color, the same serif, and a thin red edge so the image matches the app.

## Mark and install icons

The mark is an open book on warm paper. It is the header mark, the Studio footer mark, and the home-screen icon.

- `icon.svg` is the source.
- `icon-192.png` and `icon-512.png` are the Android icons.
- `icon-maskable.png` keeps the book inside Android’s circle and squircle crop.
- `apple-touch-icon.png` is 180×180 for iPhone and iPad.
- Header and footer pad for the notch and the home indicator.
- Installed display is `standalone`. Theme color is `#efefef` in light and `#191919` in dark.
