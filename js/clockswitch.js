define(['jquery'], function ($) {
    $.get('http://scripts.cmbuckley.co.uk/clockswitch/api.php', function (data) {
        $.each(['change', 'revert', 'before', 'after', 'facts'], function (_, type) {
            $.each(data[type], function (key, value) {
                $('.' + type + '-' + key).text(value);
            });
        });
    });
});
