define(['ajax'], function (ajax) {
    function _facts(isdst) {
        return {
            'true': {
                direction: 'backward',
                morning: 'lighter',
                evening: 'darker',
                bed: 'gain',
                revert: 'forward'
            },
            'false': {
                direction: 'forward',
                morning: 'darker',
                evening: 'lighter',
                bed: 'lose',
                revert: 'back'
            }
        }[!!isdst + ''];
    }

    function _diff(seconds) {
        var hours = Math.round(seconds / 3600),
            mins  = Math.round((seconds - hours * 3600) / 60);

        return [
            (hours ? (hours == 1 ? '1 hour' : hours + ' hours') : false),
            (mins ?  (mins  == 1 ? '1 min'  : mins  + ' mins')  : false),
        ].filter(Boolean).join(' ');
    }

    function _date(date) {
        var output = [
                ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
                date.getDate(),
                ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                'August', 'September', 'October', 'November', 'December'][date.getMonth()]
            ];

        if (date.getFullYear() != new Date().getFullYear()) {
            output.push(date.getFullYear());
        }

        return output.join(' ');
    }

    function _time(date) {
        return ('0' + date.getHours()).slice(-2) + ':' +
               ('0' + date.getMinutes()).slice(-2);
    }

    function _utc(offset) {
        return (offset >= 0 ? '+' : '−') + _time(new Date(offset * 1000));
    }

    function _getData(transitions) {
        var current = transitions[0],
            changeTime = new Date(transitions[1].time),
            beforeTime = new Date(transitions[1].time),
            changeBackTime = new Date(transitions[2].time);

        beforeTime.setSeconds(beforeTime.getSeconds() + current.offset - 1);

        return {
            change: {
                amount: _diff(transitions[1].offset),
                date:   _date(changeTime),
            },
            revert: {
                date: _date(changeBackTime),
            },
            before: {
                time: _time(beforeTime),
                zone: current.abbr,
                utc:  _utc(current.offset)
            },
            after: {
                time: _time(changeTime),
                zone: transitions[1].abbr,
                utc:  _utc(transitions[1].offset)
            },
            facts: _facts(current.isdst)
        };
    }

    ajax.get('http://scripts.cmbuckley.co.uk/clockswitch/transitions.php', function (err, transitions) {
        data = _getData(transitions);

        ['change', 'revert', 'before', 'after', 'facts'].forEach(function (type) {
            Object.keys(data[type]).forEach(function (key) {
                document.querySelector('.' + type + '-' + key).innerHTML = data[type][key];
            });
        });
    });
});
