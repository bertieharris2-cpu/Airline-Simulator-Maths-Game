# Round 3: Claude Design's "fewer words" hand-off, built (1 Nov 2026)

Claude Design turned your 11:52 and 12:05 play notes into pictures of seven screens, plus your ten callout rules. You checked the pictures and asked for one change: in each sum's box, the method goes on top in its colour ("Build the formula" in blue, "Work it out on paper" in gold), with the task underneath.

All of it is now in the chapter-one game (`airline-opening-prototype.html`). The hand-off itself is in `data/incoming/handoff-round3-1-nov/`, and its DESIGN.md is installed at the top of the repo. Screenshots of the new version are in `docs/screenshots/round-3/`: 01–27 are Launch Day to Tuesday, and the ones starting with x are the week 1 Sunday (x01–x17) and Monday 9 Sep (x18–x36).


## The short version

Every callout in chapter one is now just a title, and every sum has the same two-line box sitting right under its cell. A right answer turns green, and a green button moves him on. Finance only demonstrates a method the first time, and the made-up example column is only there while Finance is demonstrating.

The seven screens look like Claude Design's pictures: Launch Day's profit, the Day page walk-through, the two plans, the new-plan sheet, Before / after, week 1 Sunday, and Monday 9 Sep's what-if sheet.


## Screen by screen

| Screen | What's different now | Screenshots |
| --- | --- | --- |
| **Every sum in chapter one** | The old box with its "BUILD IT ON THE SHEET" header and three lines has gone. It's two lines: **Build the formula** (blue) or **Work it out on paper** (gold), then the task, e.g. "Calculate the ticket revenue, then press Enter." It sits right under the answer cell, with its pointer touching it. When it would run off the panel it slides sideways. Only if there's no room below does it sit above the cell. | most of them |
| **Every callout in chapter one** | Just the title (and its button on the right). A second line only stays if it's a rule with an "=" in it. | most of them |
| **Launch Day's profit** | One callout under his profit cell: "Profit = Total revenue − Total costs" and Watch ▶. The example column G only appears while Finance demonstrates, then disappears. On his turn: "Build the formula / Calculate the profit, then press Enter." and "Your turn." | 05–07 |
| **The Day page walk-through** | First he sees the whole page, undimmed, with a small "Review the day · Start ▸". Then the four steps, with a lighter shade and quiet callouts (titles only): "Your profit today", "Who wanted to fly, and who flew", "What next: Frankfurt opens tomorrow", "Your choice: plan tomorrow". | 10–14 |
| **Two plans** | One callout only: "Build a new plan for tomorrow. Compare it with yesterday's plan." It sits to the right of the Add a flight tray. "Now work it out" has gone. The top lane says "Flew on Launch Day". While locked, the compare bar shows "New plan ? a day" and the footer says "Work out your new plan before you choose." Once it's worked out, **both Choose buttons are the same green**. | 16–18, 27 |
| **Work out your new plan** | Heads as drawn ("your 2 flights · Frankfurt £140", "Frankfurt + Paris · New plan", "Dublin ×2 + Paris ×2 · Yesterday's plan", "new − yesterday · Difference"). Frankfurt's ticket revenue is built and **Paris's is on paper** (counted). Then total revenue and profit are built, and the difference is on paper (counted). The Before / after tab stays dimmed until he's done. At the end the difference turns green, with "✓ Your new plan should make £297 more a day than yesterday's." | 19–23 |
| **Before / after** | Two callouts: "Yesterday's plan: 4 flights" (new bar faded), then "Your new plan: £297 more a day" by the green bracket (old bar faded). The footer has a green **Choose a plan ▶**. The "What changes, a day" table isn't shown after the sums, as in the pictures. | 24–26 |
| **Week 1 Sunday** | The callouts are titles only. Finance's pointer now shows in both demos and goes to the + key, which lights. The example's answer turns green, then comes **My turn ▶**. His week: "Calculate the total profit for the week". When he gets it right: "✓ Right: £…" and **An easier method ▶**. Then the Σ SUM callout ("Here's a simpler way to do it in a spreadsheet"), Finance's Σ SUM with the pointer, and his own Σ SUM. Then "✓ Same answer" and **Now calculate the average ▶**. Finance shows the average on the left, and the box at his average cell says "Now it's your turn: calculate the average a day". The "How good was the plan" box is hidden for all of chapter one. | sun-01 to sun-17 |
| **Monday 9 Sep, what if** | Callout: "What if Dublin were £3 more?" with Got it. There's no Finance demo for ticket revenue: he builds his fare's (B4), then works the £3-more one on paper (C4). Then **Finance shows the × 7** (Watch ▶ in the line under the sheet). He works the week's difference on paper, Finance shows the × 4, and the month callout reads "£3 more a ticket = £3,192 more a month". | wi-18 to wi-36 |

The new words are all placeholders in the workbook, listed for Fable in `docs/Placeholders-for-Fable.md` (round 3).


## Things I had to decide, which you may want to change

**Callouts everywhere lose their body lines.** I did this in one place for the whole of chapter one, as rule 1 says. So callouts in weeks 3 and later (the Fuel desk tour, the plan opener, and so on) are now titles only too. Some of those might have relied on their second line. Keep an eye out when you play past week 2.

**The task line is written from each sum's name.** On the screens Claude Design drew, I used the exact words from the pictures. Elsewhere the game builds the task from the sum's own name, e.g. "Dublin at £90: the ticket revenue" becomes "Calculate the ticket revenue". A few later sums may read a bit oddly; just tell me which.

**When an answer stops being green.** The last right answer stays green until he moves on to a sum in a different row. That matches the pictures (B4 green while he works C4), but you may want it to fade sooner.

**Where Watch ▶ goes for the × 7 and × 4.** The pictures show Finance demonstrating but not where he presses Watch. I put "Finance shows you a week." and a Watch ▶ button in the line under the sheet, so nothing moves until he presses it.

**More than two routes on the new-plan sheet.** Only the second route's ticket revenue goes on paper; any third route is built. That keeps Tuesday at two counted sums.


## Checks

`chapter1.test.js` passes (39 checks, none failed). I also played through three runs with screenshots:
- Launch Day to Thursday: Launch Day sums, take-off skip, the walk-through, two plans, the new-plan sheet, Before / after, choose, fly;
- the week 1 Sunday from start to finish;
- Monday 9 Sep's what-if sheet to Set my fares.

All three ran with no errors. As agreed, I didn't check whether the figures make sense.


*Round 3 of about 10.*
