<?php

$from = (isset($_GET['from']) ? (int) $_GET['from'] : time());
$to   = (isset($_GET['to']) ? (int) $_GET['to'] : $from + 86400 * 365);
$timezone = (isset($_GET['timezone']) ? $_GET['timezone'] : 'Europe/London');

$identifiers = DateTimeZone::listIdentifiers();

if (!in_array($timezone, $identifiers)) {
    $distances = array_combine($identifiers, array_map(function ($identifier) use ($timezone) {
        return similar_text($timezone, $identifier);
    }, $identifiers));

    arsort($distances);
    $timezone = key($distances);
}

$timezone = new DateTimeZone($timezone);

header('Content-Type: application/vnd.clockswitch.transitions+json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
echo json_encode($timezone->getTransitions($from, $to));
