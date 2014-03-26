<?php

$time = time();
$timezone = new DateTimeZone('Europe/London');
$transitions = $timezone->getTransitions($time, $time + 86400 * 365);

function getTimeDiff($offset) {
    $hours = round($offset / 3600);
    $minutes = $offset - $hours * 3600;
    $diff = '';

    if ($hours > 0) {
        $diff .= ($hours == 1 ? '1 hour' : sprintf('%d hours', $hours));
    }

    if ($minutes > 0) {
        $diff .= ' ' . ($minutes == 1 ? '1 min' : sprintf('%d mins', $minutes));
    }

    return trim($diff);
}

function getUtcOffset($seconds) {
    return ($seconds >= 0 ? '+' : '−') . date('H:i', abs($seconds));
}

function formatDate(DateTime $date) {
    $format = 'D j F';

    if ($date->format('Y') != date('Y')) {
        $format .= ' Y';
    }

    return $date->format($format);
}

$current = $transitions[0];
$facts = array(
    'todst' => array(
        'direction' => 'forward',
        'morning' => 'darker',
        'evening' => 'lighter',
        'bed' => 'lose',
        'revert' => 'back',
    ),
    'fromdst' => array(
        'direction' => 'backward',
        'morning' => 'lighter',
        'evening' => 'darker',
        'bed' => 'gain',
        'revert' => 'forward',
    ),
);

$changeTime = new DateTime($transitions[1]['time']);
$changeTime->setTimezone($timezone);

$beforeTime = new DateTime($transitions[1]['time']);
$beforeTime->modify('-1 second');
$beforeTime->setTimezone($timezone);

$changeBackTime = new DateTime($transitions[2]['time']);
$changeBackTime->setTimezone($timezone);

header('Content-Type: application/json');
echo json_encode(array(
    'change' => array(
        'amount' => getTimeDiff($transitions[1]['offset']),
        'date' => formatDate($changeTime),
    ),
    'revert' => array(
        'date' => formatDate($changeBackTime),
    ),
    'before' => array(
        'time' => $beforeTime->format('H:i'),
        'zone' => $current['abbr'],
        'utc' => getUtcOffset($current['offset']),
    ),
    'after' => array(
        'time' => $changeTime->format('H:i'),
        'zone' => $transitions[1]['abbr'],
        'utc' => getUtcOffset($transitions[1]['offset']),
    ),
    'facts' => $facts[$current['isdst'] ? 'fromdst' : 'todst'],
));
