document.addEventListener('DOMContentLoaded', function() {
    var is = document.querySelectorAll('i');
    is.forEach(function(i) {
        if (i.innerHTML === 'This section is non-normative.') {
            i.innerHTML = '本节是非规范的。';
        }
    });

    var update = document.querySelector('#living-standard');
    var titleEl = update.childNodes[0];
    titleEl.textContent = 'Living Standard - 更新于';
    var dateEl = update.querySelector('.pubdate');
    var date_zh = {
        'January': 1,
        'February': 2,
        'March': 3,
        'April': 4,
        'May': 5,
        'June': 6,
        'July': 7,
        'August': 8,
        'September': 9,
        'October': 10,
        'November': 11,
        'December': 12
    };
    var date = dateEl.innerHTML.trim().split(/\s+/).reverse();
    dateEl.innerHTML = date[0] + '年' + date_zh[date[1]] + '月' + date[2] + '日';

    var as = document.querySelectorAll('nav a');
    as.forEach(function(a){
        if(a.innerHTML.trim() === 'Table of Contents'){
            a.innerHTML = '目录';
        }
    });
});
