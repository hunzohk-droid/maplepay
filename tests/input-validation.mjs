import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// Run the actual UI script, including event handlers and result visibility.
const html = readFileSync(new URL('../index.html',import.meta.url),'utf8');
const elements = new Map();
const defaults = {'pay-amount':'60000','pay-basis':'annual','hours-per-week':'40','frequency':'26'};
const document = {getElementById(id) {
  if (!elements.has(id)) elements.set(id, {
    value:defaults[id] ?? '', hidden:false, textContent:'', attributes:{}, handlers:{},
    setAttribute(name,value) {this.attributes[name]=value;},
    addEventListener(name,handler) {this.handlers[name]=handler;}
  });
  return elements.get(id);
}};
const start = html.indexOf('function estimateAnnualPay(gross)');
const context = vm.createContext({document,Intl});
vm.runInContext(html.slice(start,html.indexOf('</script>',start)),context);
const el = id => document.getElementById(id);
const change = (id,value,event='input') => {el(id).value=value;el(id).handlers[event]();};
const expectError = text => {
  assert.equal(el('pay-results').hidden,true);
  assert.equal(el('annual-equivalent').hidden,true);
  assert.equal(el('input-error').hidden,false);
  assert.match(el('input-error').textContent,text);
};
assert.equal(el('net-period').textContent,'$1,836.71');
change('pay-amount','-500');expectError(/pay amount/);
assert.equal(el('pay-amount').attributes['aria-invalid'],'true');
change('pay-amount','');expectError(/pay amount/);
change('pay-amount','1e308');expectError(/too large/);
change('pay-basis','hourly','change');
change('pay-amount','25');
change('hours-per-week','-1');expectError(/weekly hours/);
change('hours-per-week','');expectError(/weekly hours/);
change('hours-per-week','1e308');expectError(/too large/);
change('hours-per-week','40');
assert.equal(el('input-error').hidden,true);
assert.equal(el('pay-results').hidden,false);
assert.equal(el('hours-per-week').attributes['aria-invalid'],'false');
assert.equal(el('net-period').textContent,'$1,616.76');
change('frequency','12','change');
assert.equal(el('net-period').textContent,'$3,502.98');
change('pay-amount','0');
assert.equal(el('pay-results').hidden,false);
assert.equal(el('net-period').textContent,'$0.00');
// Invalid hourly data must not block annual mode, and recovery must clear errors.
change('hours-per-week','-1');expectError(/weekly hours/);
change('pay-basis','annual','change');
change('pay-amount','60000');
assert.equal(el('input-error').hidden,true);
assert.equal(el('pay-results').hidden,false);
assert.equal(el('annual-equivalent').hidden,false);
assert.equal(el('pay-amount').attributes['aria-invalid'],'false');
assert.equal(el('net-period').textContent,'$3,979.55');
console.log('PASS: invalid pay/hours, overflow, error recovery, zero and valid pay-frequency results.');
