document.addEventListener('DOMContentLoaded', function () {
    let search = new URL(location.href).searchParams;
    moment.locale('en-gb');

    function update() {
        let timezoneName = document.querySelector('.locations').value,
            timezone = moment.tz.zone(timezoneName);

        moment.tz.setDefault(timezoneName);

        // some useful transition facts
        let date = search.has('date') ? search.get('date') : Date.now(),
            transitionMillis = timezone.untils.find(u => u > date),
            transition = moment(transitionMillis),
            nextMillis = timezone.untils[timezone.untils.indexOf(transitionMillis) + 1];

        if (!transition.isValid()) {
            return console.log('Invalid transition:', transitionMillis, timezone.untils);
        }

        // use UTC offsets to get change duration
        let diff = moment.duration(timezone.utcOffset(transitionMillis) - timezone.utcOffset(transitionMillis - 1), 'minutes');

        // create transition time manually, since when entering DST the local time doesn't exist
        let problem = transition.clone().tz('UTC').subtract(Math.max(timezone.utcOffset(transitionMillis), timezone.utcOffset(transitionMillis - 1)), 'minutes');

        let data = {
            change: {
                amount: diff.humanize(),
                date:   transition.format('LL'),
                time:   problem.format('HH:mm'),
            },
            revert: {
                date:  moment(nextMillis).format('LL'),
                stamp: +moment(nextMillis - 1),
            },
            before: {
                time: moment(transitionMillis - 1).format('HH:mm'),
                zone: timezone.abbr(transitionMillis - 1),
                utc:  moment(transitionMillis - 1).format('Z').replace('-', '−'),
            },
            after: {
                time: transition.format('HH:mm'),
                zone: timezone.abbr(transitionMillis),
                utc:  transition.format('Z').replace('-', '−'),
            },
            facts: {
                todst: {
                    direction: 'forward',
                    morning:   'darker',
                    evening:   'lighter',
                    bed:       'lose',
                    forget:    'late',
                    revert:    'back',
                    tasks:     'not run',
                },
                fromdst: {
                    direction: 'backward',
                    morning:   'lighter',
                    evening:   'darker',
                    bed:       'gain',
                    forget:    'early',
                    revert:    'forward',
                    tasks:     'run twice',
                },
            }[transition.isDST() ? 'todst' : 'fromdst'],
        };

        Object.keys(data).forEach(function (type) {
            Object.keys(data[type]).forEach(function (key) {
                document.querySelectorAll('.' + type + '-' + key).forEach(function (e) {
                    if (e.href) {
                        e.href = '?date=' + data[type][key] + '&tz=' + timezoneName;
                    }
                    else {
                        e.innerHTML = data[type][key];
                    }
                });
            });
        });
    }

    document.querySelector('.locations').addEventListener('change', update);

    if (search.has('tz')) {
        let option = document.querySelector('.locations [value="' + search.get('tz'));
        if (option) { option.selected = true; }
    }

    update();
}, true);
