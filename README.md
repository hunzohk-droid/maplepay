# MaplePay

A free, browser-based British Columbia take-home-pay estimator. Maintained by the MaplePay project; the source and change history are public in this repository. Report problems using GitHub Issues, without posting private payroll information.

Live calculator: https://hunzohk-droid.github.io/maplepay/

## Calculation checks

Run with Node.js (no packages required):

```sh
node tests/consistency.mjs
```

The checks execute the calculation function extracted from `index.html`, rather than a separate implementation. They compare its results with all five salary examples actually displayed in the HTML and the displayed $25/hour example. They also verify zero-income behaviour, non-negative deductions and gross/net reconciliation across representative incomes.

These are consistency and regression checks, not an independent certification of tax accuracy. A shared error in the engine and displayed examples can pass these checks. Exact payroll withholding, personal claims and year-to-date adjustments are outside this annual-average calculator's scope. Official references, assumptions and exclusions are published on the live page.

Testing record: run on November 2, 2026. The command must pass before recording a successful check after future changes. The October 18, 2026 tax-rule review date on the page is unchanged; this testing record does not represent a new tax-law review.
