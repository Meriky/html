#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var termsFile = path.resolve(__dirname, '../terminology.json');
const terms = require('../terminology.json');
const rDfn = /<dfn(\s+[^>]*)?>[\s\S]*?<\/dfn>/ig;
const rDataX = /data-x=(?:'([^']+)'|"([^"]+)"|([^'"]+))/i;
const utils = require('../lib/utils.js');
const parse = require('../lib/parse.js');
const srcpath = path.resolve(__dirname, '../source');

var root = parse(srcpath).root;
while (root.children.length && !/Introduction/.test(root.children[0].title)) {
    root.children.shift();
}

root.preOrderTraversal(function(section, parents, idx) {
    section.idx = idx;
});

root.preOrderTraversal(updateSection);


var termsStr = JSON.stringify(terms, null, 4);
fs.writeFile(termsFile, termsStr, 'utf8', e => {
    if (e) throw e;
    console.log(`${termsStr.length} bytes written to ${termsFile}`);
    console.log(`${Object.keys(terms).length} terms in total`);
});


function updateSection(section, parents) {
    var matches = section.contentHTML.match(rDfn);
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
