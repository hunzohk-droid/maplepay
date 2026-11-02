"""Independent Decimal comparison with published CRA 2026 affine tax tables.

Run: python tests/official-reference.py
Annual-average model only; NOT a PDOC/payday validation. See README.
Reference expectations use CRA's rounded K/KP constants (not production's
progressive-band summation). A maximum $0.51 difference per tax is expected
from published whole-dollar constants. No production values set expectations.
"""
from decimal import Decimal as D, ROUND_HALF_UP
from pathlib import Path
import json
import subprocess

ROOT = Path(__file__).resolve().parents[1]
FEDERAL = [(0, '.14', 0), (58523, '.205', 3804),
           (117045, '.26', 10241), (181440, '.29', 15685),
           (258482, '.33', 26024)]
# July T4127 Chapter 5, full-year BC rates; NOT July Option 1 withholding.
BC = [(0, '.056', 0), (50363, '.077', 1058),
      (100728, '.105', 3878), (115648, '.1229', 5948),
      (140430, '.147', 9332), (190405, '.168', 13331),
      (265545, '.205', 23156)]

def money(value):
    return value.quantize(D('.01'), rounding=ROUND_HALF_UP)

def tax(income, rows):
    lower, rate, constant = next(row for row in reversed(rows) if income >= row[0])
    return income * D(rate) - D(constant)

def reference(gross):
    g = D(str(gross))
    pensionable = max(D(0), min(g, D(74600)) - D(3500))
    base = money(pensionable * D('.0495'))
    extra = money(pensionable * D('.01'))
    cpp2 = money(max(D(0), min(g - D(74600), D(10400))) * D('.04'))
    cpp = money(pensionable * D('.0595')) + cpp2
    ei = money(min(g, D(68900)) * D('.0163'))
    taxable = g - extra - cpp2
    bpa = money(D(16452) - min(D(1623), max(D(0), taxable-D(181440))*D(1623)/D(77042)))
    federal = money(max(D(0), tax(taxable, FEDERAL) - D('.14')*(bpa+base+ei+min(g,D(1501)))))
    reduction = max(D(0), D(690)-D('.0356')*max(D(0),taxable-D(25570)))
    bc = money(max(D(0), tax(taxable, BC)-D('.056')*(D(13216)+base+ei)-reduction))
    return dict(federal=federal, bc=bc, cpp=cpp, ei=ei,
                net=money(g-federal-bc-cpp-ei))

# Exercise exemption, credit phase-out, contribution caps, both tax ladders,
# and federal BPA phase-out endpoints (gross includes enhanced CPP deduction).
cases = [0, 3500, 15000, 20000, 25800, 30000, 45500, 50000, 52000,
         60000, 68900, 74600, 80000, 85000, 100000, 120000, 142000,
         182567, 191600, 220000, 259609, 270000, 300000]
js = """
const fs=require('fs'),vm=require('vm');
const h=fs.readFileSync('index.html','utf8');
const c=vm.createContext({});
vm.runInContext(h.slice(h.indexOf('function estimateAnnualPay(gross)'),h.indexOf('const amountInput =')),c);
console.log(JSON.stringify(JSON.parse(process.argv[1]).map(g=>c.estimateAnnualPay(g))));
"""
actual = json.loads(subprocess.check_output(['node','-e',js,json.dumps(cases)],cwd=ROOT,text=True))
report = []
for gross, result in zip(cases, actual):
    expected = reference(gross)
    delta = {k: D(str(result[k]))-v for k,v in expected.items()}
    for key in ['federal','bc']:
        assert abs(delta[key]) <= D('.51'), (gross,key,delta[key])
    assert abs(delta['cpp']) <= D('.01'), (gross,'cpp',delta['cpp'])
    assert delta['ei'] == 0, (gross,'ei',delta['ei'])
    assert abs(delta['net']) <= D('1.03'), (gross,'net',delta['net'])
    report.append({'gross':gross,'maplepay':{k:result[k] for k in expected},
                   'official_table_annual_reference':{k:str(v) for k,v in expected.items()},
                   'delta':{k:str(v) for k,v in delta.items()}})
print(json.dumps({'method':'Annualized published CRA constants; not official calculator output',
                  'cases':len(report),'results':report},indent=2))
