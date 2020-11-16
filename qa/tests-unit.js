const fortune = require('../lib/fortune.js');
const expect = require('chai').expect;

suite('Тесты печений-предсказаний', function(){
    test('getFortune() должна возвращать предсказание', function(){        expect(typeof fortune.getFortune() === 'string');
    });
});