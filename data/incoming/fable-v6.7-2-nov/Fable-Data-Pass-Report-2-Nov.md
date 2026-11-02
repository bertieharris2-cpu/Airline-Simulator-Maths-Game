# Fable's data pass on chapter one — report (2 Nov 2026)
*Goes with Airline-World-Workbook-v6.7.xlsx, built from the game's copy in the pack. Nothing was renamed: sheet names, column headings, Settings keys and ScreenText ids are as they were.*

## What this means (for Bertie)
Every made-up figure and word is now checked. Most were sensible and stand; a few changed (two route colours that read as warning and money, the graph question's threshold, two timing rules the importer flagged, a handful of words). Six things are rules rather than figures, so they wait for you; each has my recommendation below.

## 1. Settings (14 placeholders)
| Key | Was | Now | Why |
| --- | --- | --- | --- |
| newPlanSheet, dayPageTour | — | kept | Flow settings; Bertie's to change |
| tuesdayCountedSums | 2 | 2 | Bertie: both count. Tuesday's two plus one more over Wed–Sat makes the week's three; with Launch Day's one, week one stays within four |
| rivalIgnoreWeeks | 3 | 3 | Bertie's "say, three weeks" |
| rivalTakesShare | 0.33 | 0.33 | Bertie's "about a third". 0.25 is the gentler setting if it proves harsh |
| starsTurnedAwayNeedsSpare | yes | yes | Right: stars move because of choices, not plane size |
| boardGapShare, boardGapWeeks | 0.1, 3 | kept | Fair line for "large", three weeks running |
| graphsFromWeek | 2 | 2 | |
| **graphQuestionGapShare** | 0.10 | **0.15** | So the question fires on a real gap; the test keeper's gaps were 20–38%, so it still comes for coasting |
| graph1MinWeeks, graph1StepPounds | 6, 5000 | kept | Weekly profits run £5,000–28,000 |
| routeColourDefault | #4a6f99 | kept | |

New: **legRounding** (legs round up to the quarter hour; clears the importer's Paris and Frankfurt flags without changing distances) and **homeTurnaroundMin 35 → 30** (so two Frankfurt flights plus one Paris take exactly 12 h 00 and fit the duty day; Dublin ×2 + Paris ×2 take 11 h 30). **rivalTakeover** noted as the mechanic Bertie asked for on 2 Nov, separate from the parked undercut.

## 2. Route colours (18)
Checked against BertieV4's role colours (red = problem, amber = warning, gold = money, green = good, cyan = current, magenta = the unknown). Two changed: **Amsterdam #c0703a → #a8714f** (was close to amber) and **Barcelona #a8874f → #9c8a62** (was close to gold). The other sixteen kept; the graphs also label routes by name, so colour is never the only signal.

## 3. ScreenText (84 placeholders)
All checked for plain words at Years 5–6 and for the `{city}`-style placeholders. Changes: `rival.week` and `board.note` retired (replaced by the Monday cards; kept for reference); "shareholders" → "the airline's owners" on the Board's card; "fly {city}" → "fly to {city}"; the graph question's answer line now says what it is ("The answer: £10,288. (Best plan − yours.)"); "Here's a simpler way" → "A quicker way". **`launch.compare` is flagged, not changed**: the Launch Day comparison was taken off Launch Day on 30 Oct (D109). If that row still shows on Launch Day it contradicts the decision; if it is used later, rename it.

## 4. Other data fixes
- Market week 7: "£3.00 a litre" → "£2.94" (the price is £2.94).
- Calendar day 2's headline now describes the Day pages, not "the week runs on your plan".
- **Three wordings the review found are in code, not the workbook:** the Launch Day intro mentioning snacks; December's "from now on you decide when to buy fuel"; the end card's "reputation revealed". Claude Code: please move them to ScreenText rows so I can set them. Suggested words: no snacks line; "You have bought fuel ahead since week 3; in December you buy a month at a time."; "Your stars, public since week 4".

## 5. The two rules that live in code
- **Graph 2's measure** (profit for each hour of plane time, one plane flying the route all day): sound, and the right reading of Claude Design's words. Make it a Settings row (`graph2Measure`) so it can be changed without code.
- **One Red Kite card a Monday**: fine as code.

## 6. The six test pupils, read against the data
- **Fares (decision 4).** Dublin's demand halves between £90 (62 want) and £110 (30); Paris the same. That is why top fares halve profit. It is deliberate: the fare lesson is that fewer people pay more. A gentler table (say Dublin 110:40, 120:28) would make £110 the best fare and move the lesson to £120. My advice is to keep the tables; the what-if sheet now lets a pupil see the drop before committing. The £70 pupil's week-7 loss (£1,028) comes from the fuel spike, not the fare table.
- **Week 7 jolt.** The £2.94 spike is the planned fuel shock (D92); the event card that explained it is parked, so only the Market headline explains it. Keep the price; consider bringing that one card back.
- **Red Kite takes routes from everyone.** With two small planes nobody can fly every route; the planner lost six. That makes the takeover a signal, not a lesson. Decision 2.
- **The graph question** came six to twelve times for the coasters. With the threshold at 15% it still will for them; a cap is decision 3.
- **Stars hardly move** in chapter one (everyone 3½–4½). That follows from the careful turned-away rule; fine for chapter one.
- **The gap opens in week 4**, when the second plane and the routes arrive: the second plane lifts weekly profit from about £17,000 to £28,000. That is the shape we wanted.

## 7. Decisions for Bertie (rules, with recommendations)
1. **Two Boards.** The old monthly board review blocks the plan until he changes something; the new gentle Board has a word. Recommended: in chapter one keep only the gentle Board; park the monthly review (it was my design for the floor, and this chapter's rhythm has replaced it).
2. **Red Kite only takes a route he had time to fly** (as the stars rule does). Recommended: yes. Then the planner loses nothing and the keeper loses what he ignored.
3. **Cap the graph question.** Recommended: at most every other week, and never at two pauses running; the gap still shows on the graph every week.
4. **Fares.** Recommended: keep the tables (above).
5. **Years 5–6.** That is WPS 3, so it matches the project. Numbers in chapter one are four digits at most for his sums; the words have been checked for it.
6. **Week 1's five Day pages.** Recommended: keep them; the £200 rule already skips a day with nothing to find. If they still feel repetitive after real pupils play, add "Keep this plan to Sunday".

## 8. For Claude Code
Merge v6.7 (it is your copy plus the changes above), re-import, rebuild, run `chapter1.test.js`. Then: move the three code-side wordings into ScreenText (section 4); add `graph2Measure` as a setting (section 5); tell me if `launch.compare` is still shown on Launch Day (section 3). The chapter-two to four rows and DESIGN.md are untouched.
