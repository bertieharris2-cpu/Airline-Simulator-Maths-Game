# Round 2: what I changed after your 10:49 play notes (1 Nov 2026)

You recorded about ten minutes of notes on Launch Day and the Tuesday after Frankfurt opens. I've built every one of them into the chapter-one game (`airline-opening-prototype.html`). The full game file hasn't been touched. Your words and the screens you marked are in `docs/screenshots/playnotes-1049/transcript.txt`. The screenshots of the new version, numbered in the order a pupil sees them, are in the same folder.

Where a screen needed new words, I made them up and put them in the workbook marked PLACEHOLDER. Fable's list is in `docs/Placeholders-for-Fable.md`, round 2.


## The short version

Launch Day is quieter now. The callouts say one thing, the fare steppers have gone from the Studio, and the take-off can be skipped. After the flights there's one review screen (the Day page), with a four-step walk-through the first time.

The big change is on Tuesday. Before, the game showed the new plan's profit straight away and then jumped to the Before / after graph. Now the new plan's profit stays hidden until he works it out. He presses **Work out my plan**, does the Launch Day sums on a sheet for the whole new plan, and compares it with yesterday's whole plan. Only then does he see the graph and choose which plan flies.


## Each note, and what I did

| When | What you said | What I did |
| --- | --- | --- |
| 00:04 | The turnaround hatching should come after Paris, so it's clear why you can't drop a flight next to it | The hatching now sits after each flight's return, including the last flight of the day (it stops at 22:00). Screenshot 28 shows it after every flight. |
| 00:22, 00:58 | Get rid of the £80 and + steppers; just show the seats filled at each fare, a bit bigger | In chapter one the fare steppers are gone from the flight panel. The "38/38 at £100" chips are bigger and sit on the left (screenshot 01). |
| 01:31, 01:54 | Signals should just say "Build the formula, then press Enter" and "Work it out on paper, write SUM n beside it" | Every Build signal is now one line: **Build the formula, then press Enter.** Paper sums say **Work it out on paper. Write SUM 3 beside it**, then **Type the answer in B4, then press Enter** (screenshots 02–07). |
| 02:20, 03:13 | A button is cut off; another bit is cut off | I added a safety net: any callout that would hang off the bottom of its panel, or sit under the footer, now moves up so it's fully on screen. |
| 02:43–02:52 | The profit callout should just say "Profit = Total revenue − Total costs" | That's now the whole callout, plus the Watch ▶ button (screenshot 05). The first Launch Day callout is also down to "Work out the ticket revenue for each flight" and "Ticket revenue = passengers × fare". |
| 03:26 | Make callouts the bare minimum, consistently | Done across Launch Day and Tuesday. The Tuesday callouts are "Build a new plan for tomorrow / Compare it with yesterday's plan" and "Now work it out / Press Work out my plan". |
| 03:37 | Let the take-off be skipped; drop the Working space and Return to HQ buttons | There's a **Skip take-off ▶** button on the screen and on the Operations Wall. It goes straight to the end of the day. In chapter one, the wall's Working space and Return to HQ buttons are hidden. |
| 04:22, 04:36 | Make it one review screen, then a focal-point walk-through where the rest goes dim | The wall's "Day complete" screen is skipped. When the day ends, the wall closes and the Day page shows. The first time (Launch Day only) the page dims and lights up four parts in turn, each with a short callout: Profit today → Route by route → What next → Your choice (screenshots 10–13). |
| 04:49 | The callout should say "Build a new plan for tomorrow to compare with yesterday's plan" | Done (screenshot 15). |
| 05:11, 05:36 | It's already worked things out before we have. The green button should say "Work out my plan", and the new plan's Choose should be greyed out until it's worked out | The new plan's profit now reads "work it out first", and its Choose button is greyed out. The compare bar doesn't show the new plan's figure either. A green **Work out my plan ▶** button replaces it; it switches on once the new plan has flights and differs from yesterday's (screenshot 17). Yesterday's Choose stays live, so he can still keep yesterday's plan without sums. |
| 06:27–07:07 | Before / after shouldn't come yet; practise the Launch Day sums again, with fewer demonstrations | Work out my plan now opens a new sheet, **Work out your new plan** (screenshots 18–23). It's the Launch Day sheet for the whole new plan: one column per route (Frankfurt, Paris), then New plan, Yesterday's plan and Difference. He builds each route's ticket revenue, the total revenue and the profit himself, with no Finance demos. Finance fills in the costs and yesterday's column. |
| 07:50–08:35 | It compares two Frankfurts with two Dublins, and one Paris with two Paris. It should compare the plan overall | The new sheet compares the **whole** new plan with yesterday's **whole** plan. The last sum is the difference in profit (new − yesterday's), worked on paper and counted. |
| 08:51–09:09 | Do the difference-by-change sheet later in the week (Wednesday), not today | The whole-plan sheet is used for the first change of week 1, and whenever a change adds a new route. Any later change in week 1 (Wednesday onwards) uses the Changes sheet with the Difference column, as before. |
| (Before / after) | (follows from the above) | Before / after now comes **after** the sums, as a picture of what he's just worked out. Its last callout says "Your new plan should make £297 more a day, with one flight fewer" and has **Choose a plan ▶**, which goes back to the two plans with the new plan's profit and Choose now unlocked (screenshots 24–28). |
| (wording) | You said "yesterday's plan" throughout | "Today's plan" is back to **Yesterday's plan** on the two plans screen, Before / after and the Changes sheet. Claude Design's pictures said "Today's plan"; your word wins. It's also Fable's word from v6.6. |


## Things I had to decide, which you may want to change

**Which Choose gets greyed out.** You said "the choose it above" should be greyed out. I took that to mean the new plan's Choose, because yesterday's plan has already been worked out (it flew). If you meant both buttons, so he can't skip the sums at all, it's a one-line change.

**When the whole-plan sheet appears.** I used "the first change in week 1, or any change that adds a new route". That's a setting in the workbook (`newPlanSheet`), so you can switch it off to go back to the Changes sheet every time. One side effect: the Changes sheet's "new route first" step is now hardly ever used, because a new route always gets the whole-plan sheet instead.

**The walk-through only happens on Launch Day.** It's also a setting (`dayPageTour`). After that, the Day page just appears.

**Callouts that moved up.** The fix for cut-off buttons is a general one: it moves any callout up until it fits. It works, but sometimes the callout ends up a little further from the cell it points at. Claude Design may want to look at the positions properly.


## Worth sending to Claude Design

You said it's worth me building the new sheet so Claude Design can improve the look, and that's where it's at. Three screens are new and only have my layout: **the new-plan sheet** (screenshots 18–23), **the Day page walk-through** (10–13), and **the two plans screen locked** with the Work out my plan button (17). It's worth sending those three along with this report.


## Checks

The chapter-one test (`chapter1.test.js`) passes. I also played the new flow from Launch Day to Thursday: the take-off skip, the walk-through, Tuesday's two plans locked, the new-plan sheet, Before / after, then choosing the new plan. It flew Frankfurt, Paris, Frankfurt, with no errors. As agreed, I didn't check whether the figures make sense.

The living map, "The game: how the chapters go", is updated (Launch Day and week 1, plus a line in the change log).


*Round 2 of about 10.*
