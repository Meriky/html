const mkpath = require('mkpath');
const path = require('path');
const fs = require('fs');

function writeFile(filepath, data) {
    mkpath(path.dirname(filepath), function(err) {
        if (err) return console.error('mkdir error', err);
        fs.writeFile(filepath, data, 'utf8', function(err) {
            if (err) return console.error('write file error', err);
            console.log(`${data.length} bytes written to ${filepath}`);
        });
    });
}

function shift(level) {
    var spaces = '                   ';
    return spaces.substr(0, level * 2);
}

function stripHTML(html) {
    return html.replace(/<[^>]+>/g, '');
}

function mergeBlanks(str) {
    return str.replace(/\s+/g, ' ').trim();
}

function unescapeHTML(html){
    return html.replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

exports.shift = shift;
exports.writeFile = writeFile;
exports.stripHTML = stripHTML;
exports.mergeBlanks = mergeBlanks;
exports.unescapeHTML = unescapeHTML;
