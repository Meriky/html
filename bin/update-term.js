#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
const rDfn = /<dfn(\s+[^>]*)?>[\s\S]*?<\/dfn>/ig;
const rDataX = /data-x=(?:'([^']+)'|"([^"]+)"|([^'"]+))/i;
const utils = require('../lib/utils.js');
const parse = require('../lib/parse.js');

var filePath = path.resolve(__dirname, '../terminology.md');
var terms = parseMDTable(filePath);
var file = fs.createWriteStream(filePath);

// parse document tree
var srcpath = path.resolve(__dirname, '../source');
var root = parse(srcpath).root;

while (root.children.length && !/Introduction/.test(root.children[0].title)) {
    root.children.shift();
}

// udpate terms accordingly
root.preOrderTraversal(function(section, parents, idx) {
    section.idx = idx;
});

root.preOrderTraversal(updateSection);

// write term file
file.write('术语 | 英文原文 | 建议翻译 | 出处\n');
file.write('--- | --- | --- | ---\n');

Object.keys(terms)
    .sort()
    .map(id => terms[id])
    .filter(term => !isCode(term))
    .forEach(term => {
        file.write(`${term.id} | ${term.name} | ${term.name} | ${term.ref}\n`);
    });

file.end();


function updateSection(section, parents) {
    var src = section.outerHTML + section.contentHTML;
    var matches = src.match(rDfn);
    if (!matches) return;
    matches.forEach(function(dfnStr) {
        var term = parseTerm(dfnStr);

        var id = term.id;
        var zh = terms[id] && terms[id].zh;

        term.zh = zh || term.name;
        term.ref = parents.concat(section).map(s => s.idx + 1).join('.');

        terms[id] = term;
    });
}

function parseTerm(html) {
    var match, id, name, dataX;

    if (match = rDataX.exec(html)) {
        dataX = match[1] || match[2] || match[3] || '';
        dataX = utils.mergeBlanks(dataX);
        dataX = utils.unescapeHTML(dataX);
    }
    name = utils.stripHTML(html);
    name = utils.mergeBlanks(name);
    name = utils.unescapeHTML(name);

    id = dataX || name;

    return { id, name, html };
}

function parseMDTable(file) {
    console.log(file);
    var content = fs.readFileSync(file, 'utf8');
    var termMap = {};
    var terms = content
        .split('\n').slice(2).filter(x => x)
        .map(line => line.split('|').map(word => word.trim()))
        .map(words => ({
            id: words[0],
            name: words[1],
            zh: words[2],
            ref: words[3]
        }));
    terms.forEach(term => termMap[term.id] = term);
    return termMap;
}

function isCode(term) {
    var str = term.id;
    if (/^'.*'$/.test(str)) return true;
    if (/^".*"$/.test(str)) return true;
    if (/^<.*>$/.test(str)) return true;
    if (/^%.*%$/.test(str)) return true;
    if (/^@@.*/.test(str)) return true;
    if (/^[A-Z]\w*$/.test(str)) return true;
    if (/^windows-/.test(str)) return true;
    if (/^attr-/.test(str)) return true;

    var html = term.html;
    if (/<\/code>/.test(html)) {
        return true;
    }
    return false;
}
