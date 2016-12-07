#!/usr/bin/env node

var buf = '';
process.stdin
    .on('data', d => buf += d)
    .on('end', function() {
        var js = JSON.parse(buf);
        var str = JSON.stringify(js, null, 2);
        process.stdout.write(str);
    }).setEncoding('utf8');
