# FluffyPens design

This is the visual system for the public reading page and Studio. It comes from reading-app references, not from copying Pinterest’s board.

## References

- [Booki](https://www.behance.net/gallery/242274183/Booki-Mobile-Reading-App-UIUX-Case-Study) (Behance, 2026). The interface stays quiet so the writing is the thing on screen.
- [Matter](https://thesunrisedigest.com/daily/best-reading-apps-2026/), cited as the strongest reading surface in a 2026 reading-app comparison. One column, type first, mobile first.
- [BooksListen](https://sleek.design/templates/book-summaries). Warm canvas, white page cards, one serif for titles, one sans for controls, one color for actions.
- [Book-reader pin](https://www.pinterest.com/pin/501518108527342240/) and the related reading-app pins. The useful note there is the type pairing: a serif for the words, a plain sans for the chrome. Playfair Display is too thin-and-thick for Roman Hindi on a phone, so the serif here is Source Serif 4, which is drawn for screens.

## Layout

The public page is one reading column, `min(640px, 100%)`. Each posted piece is a page: title, then the full poem, then the date and Share. It is not a masonry grid.

Studio is the same page color and the same cards. On a phone the library is one column. From 800px it is two. Status stays visible as a row of filters: Draft, In Progress, Ready, Recorded, Posted.

Light is the default. Dark is a warm night page, not black and not a gray pin board. The moon button keeps the choice.

## Type

- Verse and titles: Source Serif 4. Feed title 26px, lines 18px, line-height 1.7. Reader lines 20px.
- Chrome: IBM Plex Sans. 14px for controls, 13px for dates and labels.
- One size step only. No 8–11px labels, no mixed pasted fonts. The editor forces Source Serif 4 at 18px.

## Color

Light: canvas `#f3eee6`, page `#fffdf8`, ink `#1c1612`, muted `#6f675e`, action `#1c1612`.

Dark: canvas `#1c1917`, page `#262220`, ink `#f6f1e8`, muted `#c4b8aa`, action `#f6f1e8`.

Share photos use the same page, the same serif, and the same ink as the screen.

## Mark and install icons

The mark is a closed book on warm paper. It is the home icon, the Studio mark, and the PWA icon.

- `icon.svg` is the source.
- `icon-192.png` and `icon-512.png` are the Android any-purpose icons.
- `icon-maskable.png` keeps the book inside the center safe zone so Android’s circle and squircle crops do not cut it.
- `apple-touch-icon.png` is 180×180 for iPhone and iPad home screens.
- The header and the bottom bar pad for the notch and the home indicator (`viewport-fit=cover` and `safe-area-inset`).
- Installed display is `standalone`. Theme color follows light or dark.
