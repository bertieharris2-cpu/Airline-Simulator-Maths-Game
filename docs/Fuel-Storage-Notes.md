# Fuel storage grows with the fleet (Workbook v5.8, D89)

*Claude Code, 16 October 2026. This answers Fable's note "Fuel storage that grows with the fleet" (15 Oct). The code is in `src/opening/parts/p4zu_fuelstore.js`; the checks are in `week.test.js` and `chapter2`–`chapter4.test.js`.*

## What this means (for Bertie)

The tank was sized for the opening week and the fleet outgrew it. Now it keeps up by itself.

- **Storage.** The tank holds 8,000 L in week 2. From week 3, at each Monday plan (each month's plan, once the airline flies by the month), it grows to three weeks of the plan's fuel, rounded up to ten blocks. It never shrinks, and there is no "storage upgrade" on 30 September any more.
- **The desk says so.** "Your position" reads "Storage 20,000 L — about three weeks of flying", and the news says when the tank grows.
- **Bigger blocks.** Fuel comes in 1,000 L blocks in chapter 1, 10,000 L blocks from 6 January 2031 and 100,000 L blocks from 1 September 2031. The Monday sum stays the same shape: blocks × the price of a block, e.g. 25 × £21,700. The order panel shows "£21,700 per 10,000 L".
- **Fill.** A Fill button buys as many blocks as the tank and the cash allow, so stocking up before a rise is one press.
- **The fuel farm (chapter 3).** From 1 September 2031 the Fuel desk offers a fuel farm: 1,500,000 L for £2,000,000, buy only. "Is it worth it?" is a Build the first time: 1,500,000 × 60p = £900,000 saved in one shock, so the farm pays for itself in about two shocks. From 6 September 2032 a second stage makes it 3,000,000 L for £3,000,000 more.

## Report back

| Fable asked us to confirm | Result |
| --- | --- |
| The capacity line on the desk each Monday | <!--R1--> |
| The block size changing on the two dates, the order sum reading blocks × price per block | <!--R2--> |
| The farm purchase in chapter 3 with its sum | <!--R3--> |

## How each rule is read (please check)

1. **When the tank grows.** At the start of each beat from week 3: each Monday while the airline plans by the week, the 1st of each month once it plans by the month. The litres are the standing plan's for the next seven days, day by day, so days off count. Week 2 keeps 8,000 L, as the note says.
2. **"Rounded up to ten blocks"** means up to a multiple of ten blocks: 10,000 L steps in chapter 1, 100,000 L in chapter 2 and 1,000,000 L from 1 September 2031. That makes the chapter 3 tank big. Our Value airline flies about 99,000 L a week, and three weeks (297,000 L) rounds up to 1,000,000 L, about ten weeks of flying. A Steady airline at 500,000 L a week would get 2,000,000 L, more than the farm. Did you mean ten blocks, or one block (100,000 L steps in chapter 3, which would give 300,000 L and 1,500,000 L)?
3. **A save from before v5.8** keeps what its tank held (20,000 L from day 29) and grows at its next plan.
4. **The farm's "shock".** The rise is the forecast's expected rise (the middle of next week's band minus today) when that is 20p or more. Otherwise it is a typical shock, 60p, your example; the October spikes in the Market sheet are 97p, 64p and 67p. A Settings row `fuelShockRise` would change the 60p.
5. **The second stage** is read as a farm of 3,000,000 L in all, so 1,500,000 L more. Its worth line uses the extra litres: 1,500,000 × 60p = £900,000 against £3,000,000, about three shocks. It is the model's line by then: the Build was the first time.
6. **Buying.** Buy is greyed until the worth sum is done, and while the cash (above the reserve) is short. Then it shows "£X short", with the model's time to afford: (price − cash) ÷ profit a week. The sum is not asked there; should it be? Both test airlines can afford the farm on 1 September 2031.
7. **The money.** The farm's price comes out of cash like a bought plane's. It is not in the day's costs or the year's accounts.

## Tests

<!--TESTS-->
