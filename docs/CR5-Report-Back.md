# Change Request 5: airline identity, paint shop and showroom — report back

*Claude Code, 7 October 2026. For the game's state see `docs/State-of-the-Game.md`; for the import, `data/Import-Report.md`; for the photo credits, `data/Photo-Credits.md`. Screenshots are in `docs/screenshots/cr5/`.*

## What was built

**Stage A, launch day** (pass 1, commit `3b77762`). The identity steps sit at the start of the setup flow, one screen and one decision each, with the question as the heading and the step dots in the card header (*Launch day · Step 4 of 6*). Back works on every step and never loses a choice.

1. **Name your airline** (1–20 characters; letters, numbers, spaces, apostrophe, hyphen). The whiteboard's departure board shows the name as he types.
2. **Pick a flight code.** Two letters, suggested from the name (*Bertie Air → BE*: the initials *BA* are a real airline, so the suggestion moves on to the next pair that is allowed), with a live preview *BE101 · Dublin · 09:00*. The workbook's `blockedFlightCodes` are refused with "That code belongs to a real airline, try another" in the calm retry style.
3. **Make a logo.** A shape (square, circle, shield, tail fin) × a symbol (the tail-symbol set) × two colours from the palette. The logo replaces the generic fin mark in the top bar and on the whiteboard, goes on the certificate, and is the "Your logo" tail option in the paint shop.
4. **Paint your first plane.** The mock-up's paint shop: the hangar stage on the left, three tabs on the right (*Colours*: main, belly, engines; *Stripe & tail*: second colour, four stripes, seven tail symbols; *Name it*: G- plus four letters, a name with four tap-to-use suggestions). *Surprise me* keeps body and second colour different. The whiteboard shows the same stage full screen and every change lands on it within a moment, with the shine of light.
5. **Registration and plane name.** Four letters after G-, suggested from the airline name (*G-BERT*), unique across the fleet ("Another plane already has G-BERT"). The name is optional, up to 22 letters.
6. **Hangar reveal.** Doors close over the stage, open again, the plane rolls in, shines, and its name and registration appear. About 6 seconds (`revealSeconds`), Skip always available, a fade under reduced motion. Both screens run the same timeline from the same start time.
7. **Certificate.** An A4-landscape *Air Operator Certificate* on screen: airline name and logo, flight code, first aircraft (type, name, registration), home airport, game date and real date, a signature line. Print opens a print-ready page.
8. **First take-off.** At the first real departure on launch day (after *Ready*, before live operations): the painted plane taxis across, accelerates and climbs out on the whiteboard, with the engine spool-up and the airport chime when sound is on; then the route map takes over with the plane leaving home. The control window shows *Take-off*, then *Continue*. Skip always available.

**Stage B, week 2** (pass 2). The plane shop is an air show from the first time a second aircraft can be bought, and stays that way: one card per aircraft for sale, tap to flip for the facts, four bars (seats, speed, range, fuel thirst) on the same scale on every card, Buy / Rent / Finance on the back from the Finance sheet, *Not today* one click. A *Coming soon* row shows the aircraft not yet for sale as locked goals with their dates. After buying: the paint shop for that plane (three tabs, its own registration suggested and checked for uniqueness), then a short reveal. The Fleet screen shows every plane side by side in its own livery with a Repaint button; *Your airline* on the home menu edits the name, flight code and logo at any time.

**The artwork.** Six painted side views, port side, nose left, 1200 × 440: DHC-6 Twin Otter (from the mock-up), Saab 340, ATR 72, Embraer E175 and E190 (the E-jets enter the shop on day 15, inside chapter 1, so they needed drawing now), and a narrowbody stand-in used for the A220, A320 and 737 until each is drawn. Each is an SVG in `src/opening/assets/aircraft/` with separate paintable layers clipped to the fuselage and fin, a shading overlay over the colour, windows and windscreen in dark glass, door outlines, wheels, the airline name above the windows, the registration on the rear fuselage and the plane name on the nose; the wording's colour switches to stay readable on every body colour. Propellers spin, jet fans turn slowly, a shine sweeps across when paint goes on. Reduced motion (the computer's setting or the teacher's toggle) stops all of it.

**Data.** Nothing identity-related is hard-coded: the palette, stripe styles, tail symbols, logo shapes and plane-name suggestions come from a new Livery sheet; the drawing to use from the Aircraft sheet's `artworkId`; the blocked codes, the sound default and the reveal length from Settings. Everything he chooses lives in the save state (`S.airline.flightCode`, `S.airline.logo`; each fleet entry's `registration`, `name`, `livery`) and survives save, reload and the save code.

**Sound.** Off until the teacher turns it on (`soundDefault`), a mute control in the top bar, never used for right or wrong answers. The sound is synthesised (filtered noise for the engines, sine chimes), so nothing is downloaded and the game still runs with no internet.

## What I could not do, and what I assumed

1. **Photos: done on 8 October.** `tools/fetch_photos.py` fetched all 15 from Wikimedia Commons (the hosts are allowed now; the API rate-limits a shared address hard, so the tool retries patiently). Prototypes and demonstrators in maker colours for 13 aircraft, an all-white 757, and a Republic Airways E175 because Commons has no E175 in maker colours. Each is cropped to the card's 3:2 (900×600, 37 to 118 KB) and credited on the card and in `data/Photo-Credits.md`. The same change carries `artworkId` from the Aircraft sheet onto the game's plane list: until then every plane fell back to the Twin Otter drawing (the paint shop painted a Saab as a Twin Otter).
2. **The workbook rows are a draft.** Fable owns the workbook, so the Livery sheet, the five Aircraft columns and the three Settings keys were written into the repo's copy as **v4.3 draft** (`tools/workbook_v43_draft.py`, idempotent) for Fable to adopt or change. The README sheet carries a v4.3 line.
3. **The coming-soon row reads non-live aircraft rows.** The loading rule is live rows only. The row needs the names and dates of the 787, A350, 747, A380, A340, 777 and 757, so the importer exports them as `aircraftPreview` with name, tier, `shopFromDay`, status and the photo fields only: never seats, prices or costs. Same precedent as the chapter 2–6 gates. Say if even that should wait.
4. **The bars scale against the live aircraft only.** "Scaled against the whole fleet table" would need the big aircraft's figures, which are not loaded (point 3). Today the full bar is the 737's 150 seats, 900 km/h, 6,300 km range (A220) and 90 L/100 km.
5. **The first take-off plays at the first real departure**, not straight after the certificate (your choice on 7 October): after the certificate the plane stands on its stand, the HQ boots, and launch day ends on the take-off.
6. **The game keeps its own chrome.** The mock-up's left rail (Home / Read / Menu), its header with Back and step dots, and its web font were not adopted: the game's top bar, HQ nav, design tokens and system fonts stay, as the change request's "stays the same" list asks. The step dots sit in the card header; Back is the game's usual button.
7. **Flight numbers.** The pupil's code goes in front of the existing numbering (*BE101*, *BE103* … for the first aircraft, *BE121* … for the second; return flights add one). The purchase-order number uses it too.
8. **Registration suggestions** come from the airline name (*Bertie Air → G-BERT*, *Dragon Air → G-DRAG*, then *G-DRAA*, *G-DRAB* …) and are always editable.
9. **Reveal and take-off lengths follow the teacher's "Live operations pace"** setting as well as `revealSeconds`, so the tests run them in a fraction of a second. At the standard pace they are 6 s and 7 s.
10. **Sound on the whiteboard window** needs one tap on that window first (a browser rule for audio); the "Tap once for full screen" prompt already provides it when presenting on two screens.
11. **The certificate's "home airport"** is Heathrow Terminal 5 (fixed by the workbook); "printed" is the real date.
12. **Old saves.** A save made on the old *Paint your planes* card carries on in the new paint shop (`fin` is an alias of `paint`); the first plane of an older save gets a registration and a default livery the first time it is drawn.

## Checks

| Check | Result |
| --- | --- |
| Launch day fits one lesson and ends on the first take-off | Eight identity screens before the HQ boots; the take-off is the last step before live operations |
| Every livery choice updates the laptop stage and the whiteboard within a moment, shading visible on every colour | Yes: changes publish ~90 ms after the last click; the wall patches colours in place and plays the shine |
| Airline name and registration readable on every body colour | The wording's colour is chosen by contrast (second colour if it contrasts with the body, else dark on light / light on dark) |
| Registration unique; blocked codes refused calmly | Yes, both in the paint shop and in *Your airline* |
| Every photo has its licence and credit recorded and shown; no internet needed | Yes: 15 photos embedded by the build with author and licence on the card and in `data/Photo-Credits.md`; the game runs from `file://` with no network |
| Reveal and take-off can be skipped; reduced motion removes all movement; sound off until the teacher turns it on | Yes |
| All identity choices survive save, reload and the save code | Yes (they live in `S`) |
| Tests | Full chapter 1 at 1366 × 768: 317 checks, no failures, no errors (the overflow list at rounds 23 onwards is the same on the committed build before this change); to day 9 at 1915 × 891 clean; live operations to week 1, answers, run-through and engine tests pass |

## Screenshots

`docs/screenshots/cr5/`: `flight-code`, `logo`, `paint-shop`, `paint-shop-name`, `hangar-reveal`, `certificate`, `wall-paint-shop`, `wall-first-take-off`, `showroom`, `showroom-card-back`, `paint-shop-saab`, `fleet`, `your-airline`.
