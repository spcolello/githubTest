import assert from 'node:assert/strict';
import { OPERATIONS, calculate, generateQuestion, generateChoices, accuracy } from '../math.js';

let count=0;
function test(name,fn){try{fn();console.log(`✓ ${name}`);count++;}catch(e){console.error(`✗ ${name}`);throw e;}}

test('calculate supports all four operations',()=>{
  assert.equal(calculate('addition',2,3),5);
  assert.equal(calculate('subtraction',9,4),5);
  assert.equal(calculate('multiplication',6,7),42);
  assert.equal(calculate('division',36,6),6);
});

test('generated questions have the mathematically correct answer',()=>{
  for(const op of OPERATIONS){
    for(const difficulty of ['easy','medium','hard']){
      for(let i=0;i<200;i++){
        const q=generateQuestion(op,difficulty);
        assert.equal(calculate(op,q.a,q.b),q.answer);
      }
    }
  }
});

test('division questions always have integer answers and nonzero divisors',()=>{
  for(const difficulty of ['easy','medium','hard']){
    for(let i=0;i<300;i++){
      const q=generateQuestion('division',difficulty);
      assert.notEqual(q.b,0);
      assert.ok(Number.isInteger(q.answer));
    }
  }
});

test('subtraction questions stay non-negative',()=>{
  for(const difficulty of ['easy','medium','hard']) for(let i=0;i<300;i++) assert.ok(generateQuestion('subtraction',difficulty).answer>=0);
});

test('every question has four unique choices including the correct answer',()=>{
  for(const op of OPERATIONS) for(let i=0;i<300;i++){
    const q=generateQuestion(op,'medium');
    assert.equal(q.choices.length,4);
    assert.equal(new Set(q.choices).size,4);
    assert.ok(q.choices.includes(q.answer));
  }
});

test('choice generation works for zero and small answers',()=>{
  for(const answer of [0,1,2,3]){
    const choices=generateChoices(answer,'subtraction');
    assert.equal(new Set(choices).size,4);
    assert.ok(choices.includes(answer));
    assert.ok(choices.every(x=>x>=0));
  }
});

test('accuracy handles zero attempts and normal percentages',()=>{
  assert.equal(accuracy(0,0),0);
  assert.equal(accuracy(8,10),80);
  assert.equal(accuracy(2,3),67);
});

console.log(`\n${count} test groups passed.`);
