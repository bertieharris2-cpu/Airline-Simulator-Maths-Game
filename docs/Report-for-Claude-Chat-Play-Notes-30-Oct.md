# Play-test 30 Oct 19:15: report for Claude Chat

*Claude Code, 30 October 2026. A copy of the Claude Doc https://claude.ai/artifact/3K8uaznvzan3qfBjYpafXM. Bertie played the chapter-one game from the chapter page on Launch Day (Mon 2 Sep 2030) to Tuesday's Week 1 plan (Tue 3 Sep). The run took 10 min 14 s and has 10 marks. The recording and the log came as one zip and were transcribed with the medium speech model. The full transcript, with each line placed on its screen, is `docs/screenshots/playnotes-30oct/transcript.txt`. The screenshots are in the same folder.*

Bertie asked for his notes not to be summarised too much, so each section below starts with his own words as transcribed. Words in [square brackets] are my corrections where the transcriber misheard (it wrote "fair" for fare, for example) or where a word was missing. After his words, each section says what Claude Code changed and what needs discussing with you.

## In short

**Changed in the game now (chapter one only, behind `ch1()`):**
- the chapter page;
- no "Choose where to fly" page;
- the Add a flight tray looks different from the flights;
- dragging one flight onto another swaps them;
- four buttons are gone from the Studio;
- the fare briefing's slider moves;
- the Launch Day sheet's title.

**Needs discussion with Claude Chat:**
1. The Launch Day sheet's order: a demonstration of building the formula, then the pupil builds one, then the pupil works one on paper.
2. "One flight, two ways".
3. The 27 at £110 that didn't match the page before.
4. The end of Launch Day: after day one, run the whole week and move everything along a week.

Items 1 and 4 change what DESIGN.md (30 Oct) and the workbook say. Claude Code has not built them.

## The run

| Time | Screen (from the log) | Marks |
| --- | --- | --- |
| 0:00 | Chapter page, Mon 2 Sep | 0:06 |
| 0:28 | Launch Day intro | |
| 0:30 | Choose where to fly | |
| 0:32 | Studio (the full-width timetable) | 0:56, 1:03 |
| 2:23 | Briefing: What a fare does | |
| 3:15 | Sums: the Launch Day sheet | 3:18, 5:00, 5:13 |
| 5:28 | Studio (back to change the plan) | 5:36 |
| 6:36 | Sums: the Launch Day sheet again | 6:59 |
| 8:50 | Ready to fly, take-off, Operations Wall | 9:14 |
| 9:18 | Launch Day results (Home) | 9:19 |
| 9:30 | Sums: Week 1 plan, Tue 3 Sep | 9:35 |
| 10:14 | Stop | |

---

## 1. The chapter page (0:00)

> "I don't actually think we need this page. I don't think the pupils are going to read it. I think we could have chapter one come up and the date, but we don't need the starting out and what's arriving in this chapter, especially not in this form, because they're just not going to read it."

**Changed.** The page now shows only **Chapter 1**, the dates (Monday 2 September 2030 – Saturday 28 December 2030) and **Begin ▶**. The chapter's name (Starting out), its one-line idea and the "Arriving this chapter" list are gone. Screenshot: `02-chapter-after.png`.

**For you:** Bertie said "I don't actually think we need this page", then "we could have chapter one come up and the date". So it is kept, cut down. Should it be removed altogether?

## 2. Choose where to fly (0:30)

> "Choose where to fly. I actually don't think we need this because it might mislead the pupils [into] thinking they can only choose one. And then later on when you add more networks, it just takes you away from the other page. And I'm not sure it's necessary."

**Changed.**
- On Launch Day, Open Week 1 Planner now goes straight to the timetable.
- Both Launch Day routes, Dublin and Paris, are in the Add a flight tray from the start, and both stay there after one is added. Fares start at £80 (Dublin) and £90 (Paris), as before.
- **+ Add a route** still opens the route page, for the weeks when new routes open.

## 3. The Studio, first look (0:32–2:18)

> "Now this is looking much better. But where you add a flight, those buttons, they should be a different color to the flights on the schedule because it [makes it] not – makes it less obvious how to add them. I think also the duration of the flight should be underneath where it says Dublin, maybe just to make the button a little bit shorter width ways."

> "We've got view trade offs. I don't think is necessary at this point. We're still introducing them into the game. And the notification of the yellow two draws your eye there. And actually, it's not that relevant to them."

> "Compare aircraft is also not really needed here. And work it out draws your attention. But it I'm assuming does the same as work out my plan. So I'm not sure that's necessary. I'm only a bit concerned as to when we add more planes as to where the add flight buttons go. We'll cross that bridge then."

**Changed** (screenshots: `03-studio-before.png`, `04-studio-after-swap.png`):
- **Add a flight tray:** each tile is now outlined in dashed cyan on the lane's own background, not the flights' dark blue. The blue **+** square and the flag stay, as DESIGN.md says. The time ("3 h 45 there and back") now sits under the city name, so the tile is narrower.
- **View trade-offs** (and its gold "2") is hidden in week one.
- **ƒ work it out** next to Projected profit is hidden in week one. It opens the profit working, which Work out my plan also leads to.
- **Compare aircraft** is hidden until the shop opens on day 15, when there is a plane to compare.

**For you:**
- Should View trade-offs and ƒ work it out stay hidden for the whole of chapter one, or come back after week one?
- Bertie's concern about **where the Add a flight tray goes when there are more planes** is parked ("we'll cross that bridge then").
- The decision-support line under the plan still says "Every seat is sold — 46 people a day want seats you don't have. The way to carry them is capacity (another plane, or a bigger one) or a higher fare", with a Test fare button. Bertie didn't mention it, but on Launch Day a plane can't be bought yet.
- DESIGN.md describes the flight blocks but not the tray's own look. Claude Design may want to add the outlined tray.

## 4. What a fare does: the slider (2:18)

> "The slider on this still doesn't work. I've mentioned it before. So the slider where you fill the seats to more money for each ticket that does not go up and down."

**Found and changed.** On beat 4 ("Your challenge: fill the seats and make the most money"), the double-headed arrow between **Fill the seats** and **More money for each ticket** had a blue handle drawn on it, but it was only a picture and could not move. (The slider fixed on 22 Oct is the one on beat 2.) It is now a working slider: drag it, click along it, or use the arrow keys. It steps through the fares from the low fare to the high fare and shows the fare and the seats filled, for example "£70 a ticket · 38 of 38 seats filled ✓" or "£140 a ticket · 18 of 38 seats filled · 20 empty". It doesn't show the ticket money, so beat 5's "Which makes more ticket money?" is still his to answer. Screenshot: `08-fare-briefing-slider.png`.

**For you:** should the two planes in the panels above also fill and empty as the slider moves?

## 5. The Launch Day sheet: how the first sums are introduced (2:18–5:00)

> "I think I like the call out but the workings start really quickly before you've kind of come to – I'd also like before it comes up for the title for this to be calculate the ticket revenues for each flight at each [fare] or something shorter."

> "And then I'd like it to show the mouse clicking on B2 and it turning, the border being a different color like in Excel. And then the mouse clicking the multiplication symbol, which we need to put a button of that somewhere. And then the mouse clicking B3, which also has a different color border. And then clicking enter. And then the call out can come up then just to show how you build the formula."

> "And then maybe the next one is actually build the formula just to give them practice at that rather than working out on paper and encourage them to press enter to sort that out."

> "And then the third one, [Dublin at] 90 pounds, that can be the working out one and then he is."

> "The next one, I think this should have come up before the E column is filled in, it felt a bit strange."

**Changed:** the sheet's title. It was "Launch Day sheet" and is now **"Ticket revenue for each flight, at each fare"**. Screenshot: `07-launch-sheet-new-title.png`.

**Not changed: for discussion.** What Bertie describes replaces the order in DESIGN.md (30 Oct, "Launch Day fares") and hand-off 2. That order is: Finance works the first fare while he watches (long multiplication, "£80 is 8 × 10"), he works the second on paper (Sum 1), Finance works the third, and then One flight, two ways (Sum 2). Bertie's order, as I understand it:

1. The title says the job before anything starts, and the workings don't start straight away.
2. **First fare: a demonstration of building the formula, like Excel.** A pointer clicks B2, and B2 gets a coloured border. It clicks a **×** button, which the sheet doesn't have yet. It clicks B3, which gets a different coloured border. It presses Enter. Then the callout explains how the formula was built.
3. **Second fare: he builds the formula himself** (practice; Enter to finish), not on paper.
4. **Third fare (Dublin at £90): worked on paper.**
5. "The next one … should have come up before the E column is filled in." In his run, column E (Paris) was already filled in (ƒ) when the next sum came up, and that felt strange.

**Questions for you:**
- Does a built formula count as a question? Today a Build "doesn't count" (Question Signal, cyan) and paper counts (gold), with at most two counted questions at a pause. Launch Day would then have one counted paper sum plus the compare.
- Where does the **×** button go: in the formula bar beside fx, or a small row of + − × ÷ buttons?
- Which "next one" did Bertie mean? I read it as Paris (column E) or One flight, two ways: the next question should come before Finance fills in column E.
- Is the long-multiplication watch panel ("£80 is 8 × 10…") dropped from the first fare, or does it move to the paper sum as a hint?

## 6. Back to the Studio (5:00–5:28)

> "Also, also this part the briefing hasn't come up. Oh, yeah, it has."

> "But this feels going back to this page."

The sentence trails off, so I've left it as he said it. The log shows him going back from the sheet to the Studio at 5:28.

## 7. The Studio, changing the plan (5:28–6:36)

> "I would like to be able to drag say Dublin over the top of Paris and swap places without me having to delete the flight and put it back there."

> "I'm also not sure on this page if we need that service costs button because I pressed it and that is an overwhelming page."

**Changed.**
- **Swap by dragging:** drag a flight onto another flight on the same plane. While it is held over the other flight, that flight gets a cyan edge and the line under the lane says "Swap with Dublin: let go to swap them over". When he lets go, each flight takes the other's start time, and the turnarounds are worked out again. If the swapped pair can't both fit in the day, it says so and nothing changes. Screenshot: `04-studio-after-swap.png` (Paris dragged onto Dublin).
- **Service costs** is hidden from the flight's inspector in chapter one.

## 8. The Launch Day sheet: the numbers (6:36–8:46)

> "So I also think it might be worth showing… I don't know that 27 at 110 pounds. But where's that number actually come from? Because on the previous page, that wasn't the number."

> "And then back to this, I feel like: One flight, two ways, these numbers should be relevant to the numbers I've already selected. I don't know, this calculation felt a little bit random. Now, it's difficult for me to know because I've obviously done this game quite a few times, so I know the optimum, but I think this needs to be more in tune with what the pupil is actually selecting. So if there's clearly a mistake – or maybe in week one, we don't. But somehow this needs to only appear when to help the pupil improve, or just show them, I think it… I know it's in the briefing, but this is more to show them how quickly that money builds up, even though it looks like a hundred thirty, that's way too expensive because we're not filling the seats. Actually, that 40 pound difference is massive over time, quite a short period. So I think that's the most of [it]."

**Where the 27 comes from** (worked out from his own save at 6:36). His plan was Dublin ×2 and Paris ×2. On the sheet, Dublin at £110 shows **27 passengers**. Three different numbers appear on the screens he had seen:
- the route card says **30 people a day** want to fly to Dublin at £110;
- 27 of those 30 would catch one of his two Dublin flights (06:00 and 14:15), so the sheet shows 27;
- the other 3 want to fly at times neither flight goes.

The Studio's inspector shows seats filled for one flight, out of 19. So the numbers agree, but nothing on the sheet says it means "on your two Dublin flights".

*Proposal:* the column head says "Dublin at £110 · your 2 flights", and a Sheet Callout the first time says "27 of the 30 who want to fly at £110 catch your 06:00 or 14:15". Is this for you or for Claude Design?

**One flight, two ways (Sum 2)** compares fixed numbers from the workbook: 14 at £130 against 19 at £90. Bertie wants:
- the numbers to come from the pupil's own choices;
- it to appear only when it helps (a clear mistake), maybe not in week one at all;
- its point to be "how quickly that money builds up". The £130 fare looks too expensive because it doesn't fill the seats, but "that £40 difference is massive over … quite a short period."

**Questions for you:**
- What triggers it: a fare that leaves seats empty, or a fare much lower than the best one?
- Which fares does it compare: his fare against the next fare up or down?
- Should it show the difference over a week or a month, to show how quickly it builds up?
- Does it stay a paper question (counted)?

## 9. The end of Launch Day and week one (8:50–10:14)

> "My concern is the end of it just didn't feel like it flowed."

> "Now, going back to the HQ, I don't feel like it makes sense to come back to here after day one. And I think maybe this is what I've been confused with, actually. So, Launch Day. We close [the] day. And then we go into Week 1 plan. Launch Day should then go into the whole week, and then in week two, we bring in the fuel, so maybe just bump everything along by a week. So their plan is repeated unless there are mistakes. So this is up for discussion, but what I don't want is to have to rework out stuff here when it's not necessary."

**What happens now:**
1. After the Launch Day flights he is taken to Home with the Launch Day results (`09-launch-day-results.png`) and presses Close the day.
2. Tuesday opens a **Week 1 plan** sheet. Dublin's ticket revenue is filled in by Finance, and he is asked Paris's ticket revenue on paper (Sum 4), then the day's profit (`10-tuesday-week1-plan.png`). The plan hadn't changed.
3. Week one runs day by day. The week-1 accounts come on Sunday, and the Fuel desk opens in week 2.

**What Bertie proposes** (up for discussion):
- After Launch Day, don't go back to Home: Launch Day goes straight into **the rest of the week**.
- His plan repeats unless there are mistakes, so there is nothing to work out again.
- Everything that starts later moves along by a week ("in week two, we bring in the fuel… bump everything along by a week").

**Questions for you:**
- Does week one become Launch Day plus a week run on his plan (Tue to Sun on the board), with the first Sunday review on Sun 8 Sep?
- If everything moves a week, what happens to the current week-2 items (the Fuel desk, the what-if fare sheet, Cash, tank, profit) and to week 3's (the shop on day 15, four new routes)?
- Today's Tuesday sums (Paris tickets and the day's profit) are two of week one's four one-off calculations. Do they go, or move to the first Sunday?
- "Unless there are mistakes": what counts as a mistake on Launch Day, and what is he shown (the Studio again, or a check before the week runs)?
- After the Launch Day flights, does he see the results and then go straight to the week (no Close the day on Home)?

## Changed in the game (chapter one only)

| Change | Where |
| --- | --- |
| Chapter page: Chapter 1, the dates, Begin | `p6e_notes1915.js` |
| No Choose where to fly on Launch Day; the Studio opens on the timetable with every route he can fly in the tray | `p6e_notes1915.js`, `p6c_desks.js` |
| Add a flight tray: outlined, not dark blue; the time under the name | `p6c_desks.js`, `p1_head_ch1.css` |
| Drag a flight onto another on the same plane to swap them | `p6c_desks.js` |
| Week one: no View trade-offs and no ƒ work it out; Compare aircraft only once the shop opens; no Service costs in chapter one | `p6e_notes1915.js`, `p1_head_ch1.css` |
| What a fare does, beat 4: the arrow is a working slider (fare and seats filled) | `briefings/briefing-fare.html` |
| Launch Day sheet title: "Ticket revenue for each flight, at each fare" | `p6e_notes1915.js` |

**Checks:** `chapter1.test.js` passes 23 of 23, with the same counted questions at every pause as before; each change was also run on Launch Day (the screenshots).
