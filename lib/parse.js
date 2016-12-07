const fs = require('fs');
const TreeNode = require('./tree.js');

function parse(srcpath) {
    var file = load(srcpath);
    var root = buildTree(file.sections);

    return {
        root,
        skeleton: file.skeleton
    };
}

function buildTree(sections) {
    var root = new TreeNode('root');
    var parents = [root];

    sections.forEach(function(node) {
        console.log('Section Found:', node.toString());
        while (parents.length && top(parents).level >= node.level) {
            parents.pop();
        }
        top(parents).children.push(node);
        parents.push(node);
    });

    return root;
}

function top(stk) {
    return stk.length ? stk[stk.length - 1] : undefined;
}

function load(srcpath) {
    console.log('loading source HTML...');
    var content = fs.readFileSync(srcpath, 'utf8');
    var skeleton = '';

    var sections = [],
        match, begin = 0,
        id = 0,
        prev;
    var rHeader = /[ \t]*(?:<!--.*?-->)?<h([2-6])([^>]*)>([\s\S]*?)<\/h[2-6]>/ig;
    while (match = rHeader.exec(content)) {
        var section = new TreeNode();
        section.id = id++;
        section.index = match.index;
        section.outerHTML = match[0];
        section.level = match[1];
        section.attrStr = match[2];
        section.title = match[3];
        match = /id=(?:"[^"]+"|[^'"\s]+|'[^']+')]/.exec(section.attrStr);
        if (match) {
            section.slug = normalizaSlug(match[1] || match[2] || match[3]);
        } else {
            section.slug = normalizaSlug(section.title);
        }


        if (id === 1) {
            skeleton = content.slice(begin, section.index);
        } else {
            prev = top(sections);
            prev.contentHTML = content.slice(begin, section.index);
            skeleton += `<file src="${prev.id}">`;
        }

        sections.push(section);
        begin = section.index + section.outerHTML.length;
    }
    match = content.match(/[ \t]*<\/body>\s*<\/html>/);
    prev = top(sections);
    prev.contentHTML = content.slice(begin, match.index);
    skeleton += `<file src="${prev.id}">`;
    skeleton += content.slice(match.index);

    return { sections, skeleton };
}

function normalizaSlug(str) {
    return str
        .replace(/['"]/g, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/[^\w]/g, ' ')
        .trim()
        .replace(/ +/g, '-')
        .toLowerCase()
        .substr(0, 128);
}

module.exports = parse;
