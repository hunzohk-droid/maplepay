# MaplePay

A free, browser-based British Columbia take-home-pay estimator. Maintained by the MaplePay project; the source and change history are public in this repository. Report problems using GitHub Issues, without posting private payroll information.

Live calculator: https://hunzohk-droid.github.io/maplepay/

## Calculation checks

Run with Node.js (no packages required):

```sh
node tests/consistency.mjs
```

The checks execute the calculation function extracted from `index.html`, rather than a separate implementation. They compare its results with all five salary examples actually displayed in the HTML, all four pay-frequency examples and the displayed $25/hour example. They also verify zero-income behaviour, non-negative deductions and gross/net reconciliation across representative incomes.

These are consistency and regression checks, not an independent certification of tax accuracy. A shared error in the engine and displayed examples can pass these checks. Exact payroll withholding, personal claims and year-to-date adjustments are outside this annual-average calculator's scope. Official references, assumptions and exclusions are published on the live page.

Consistency checks run November 2, 2026. Re-run after changes. See the separate official-rule comparison below for the scope of the rule review.

## Official-rule comparison — November 2, 2026

Run `python tests/official-reference.py` (Python 3 and Node.js, no packages).
This independently implements Decimal arithmetic using CRA's published
rate-times-income-minus-constant tables. It does not reuse the calculator's
progressive-band tax routine or copy its outputs into expected values.

Sources reviewed:

- [CRA January 2026 T4127](https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127-payroll-deductions-formulas/t4127-jan/t4127-jan-payroll-deductions-formulas-computer-programs.html): federal brackets, basic-personal-amount phase-out, employment credit, CPP/CPP2, EI and enhanced CPP deduction.
- [CRA July 2026 T4127](https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127-payroll-deductions-formulas/t4127-jul/t4127-jul-payroll-deductions-formulas.html): Chapter 5 full-year BC rates/credits; Chapter 4 temporary withholding adjustments.
- [BC basic credits](https://www2.gov.bc.ca/gov/content/taxes/income-taxes/personal/credits/basic): personal amount and annual tax reduction.

Result: 23 annual gross-income cases from $0 to $300,000 passed. Coverage
includes low income, contribution caps, every federal/BC tax band and the
federal personal-amount phase-out. CPP and EI agreed to the cent in all cases.
Maximum tax difference was $0.47 per jurisdiction; maximum annual net
difference was $0.94. These differences follow from CRA's published rounded
whole-dollar K/KP constants versus the site's exact progressive-band sums.
Tests allow $0.51 per tax, $0.01 CPP, exact EI and $1.03 annual net, including
possible contribution rounding. This is not a general error allowance.

This is a developer comparison against official rules, not CRA approval,
professional certification, tax-return validation or a completed PDOC test.
It models one full-year BC employee aged 18–64 with basic claims only and
no other income/deductions. A July–December payslip uses temporary 6.14%
BC withholding and an $805 reduction base, while the annual model uses
5.60% and $690. Payroll timing, rounded constants, per-period rounding,
year-to-date caps and personal claims can therefore produce different deposits.

## Direct CRA PDOC comparison — November 2, 2026

Two fictional salary calculations were completed in the official PDOC
(version 2026-10-28). Names were blank. Both used British Columbia,
26 biweekly payments, $2,307.69 gross per payment ($59,999.94 annualized),
federal TD1 $16,452, provincial TD1 $13,216, 12 pensionable months,
zero year-to-date earnings/contributions, and no bonuses, benefits or other
deductions. Only the payment date changed. These are controlled hypothetical
cases, not two paydays from one real employee's payroll history.

| Per-payment amount | PDOC Jan 6, 2026 | PDOC Nov 6, 2026 | MaplePay annual average |
|---|---:|---:|---:|
| Federal income tax | $205.32 | $205.32 | $205.32 |
| BC income tax | $91.80 | $105.66 | $98.75 |
| CPP (CPP2 zero) | $129.30 | $129.30 | $129.30 |
| EI | $37.62 | $37.62 | $37.62 |
| Net pay | $1,843.65 | $1,829.79 | $1,836.71 |

Only BC withholding differed in these examples. This agrees with the
temporary rate adjustment explained by CRA. It is not evidence that
MaplePay predicts exact deposits; annual averaging and per-period rounding
remain different methods. Two examples do not validate all payroll cases.
No calculation change was indicated. The earlier 23-case comparison remains
a separate official-table check, not a direct PDOC calculation.

Source: [official CRA PDOC](https://www.canada.ca/en/revenue-agency/services/e-services/digital-services-businesses/payroll-deductions-online-calculator.html).
