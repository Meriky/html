#!/usr/bin/env node

const terms = require('../terminology.json');

console.log('术语 | 英文原文 | 建议翻译 | 出处');
console.log('--- | --- | --- | ---');

Object.keys(terms)
    .sort()
    .filter(key => !isCode(key))
    .map(id => terms[id])
    .filter(term => !containCode(term.html))
    .forEach(term => {
        console.log(`${term.id} | ${term.name} | ${term.name} | ${term.ref}`);
    });

var count = 5;

// "'<%
function isCode(str) {
    if (/^'.*'$/.test(str)) return true;
    if (/^".*"$/.test(str)) return true;
    if (/^<.*>$/.test(str)) return true;
    if (/^%.*%$/.test(str)) return true;
    if (/^@@.*/.test(str)) return true;
    if (/^[A-Z]\w*$/.test(str)) return true;
    if (/^windows-/.test(str)) return true;
    if (/^attr-/.test(str)) return true;
    return false;
}

function containCode(html) {
    return /<\/code>/.test(html);
}

