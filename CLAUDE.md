# Airline Simulator — notes for Claude

Follow DESIGN.md for every colour, type size, layout, component and illustration. It is Bertie's design system; don't edit it yourself, and flag anything in a request that conflicts with it.

Chapter one only (Bertie, 30 Oct 2026): work goes into chapter one, from Launch Day (Mon 2 Sep 2030, day 1) to the chapter-one review (Sat 28 Dec 2030, day 118), to work out the kinks and the figures there first. `airline-opening-prototype.html` is the chapter-one game (`python3 src/opening/build.py`, which leaves out the parts in its CH1_SKIP list). Chapters 2 to 4 are parked in `airline-opening-full.html`, the whole game frozen on 30 Oct: don't rebuild it (`build.py --full`), change it or test it until Bertie says so. Check each change with `src/opening/tests/chapter1.test.js` (and `numbers.test.js` for figures); don't run the chapter 2, 3 or 4 tests. Keep chapter-one changes behind the chapter-one check (`ch1()`) so that, when Bertie un-parks the later chapters, they keep today's game until he says otherwise. Batch 1 (17–18 Oct) is already everywhere and stays.

Before this (18 Oct to 30 Oct) the rule was "year one first": changes in chapters 1 and 2, with the chapter 3 and 4 tests run to show nothing changed. That rule is paused while chapter one is the only file in play.
