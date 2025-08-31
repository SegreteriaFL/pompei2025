<?php
// /api/og-image.php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$url = isset($_GET['url']) ? $_GET['url'] : '';
if (!$url || !filter_var($url, FILTER_VALIDATE_URL)) {
  http_response_code(400);
  echo json_encode(['error' => 'Missing or invalid url']);
  exit;
}

$options = [
  'http' => [
    'method' => "GET",
    'header' => "User-Agent: Mozilla/5.0 (compatible; OeL-OG-Fetch/1.0)\r\n"
  ]
];
$context = stream_context_create($options);
$html = @file_get_contents($url, false, $context);

if ($html === false) {
  echo json_encode(['image' => null, 'note' => 'Fetch failed']);
  exit;
}

libxml_use_internal_errors(true);
$dom = new DOMDocument();
$dom->loadHTML($html);
$xpath = new DOMXPath($dom);

// prova og:image
$nodes = $xpath->query('//meta[@property="og:image"]/@content | //meta[@name="og:image"]/@content');
if ($nodes && $nodes->length > 0) {
  echo json_encode(['image' => $nodes->item(0)->nodeValue]);
  exit;
}

// fallback: prima immagine nell'articolo
$img = $xpath->query('//article//img[@src]/@src | //img[@src]/@src');
if ($img && $img->length > 0) {
  echo json_encode(['image' => $img->item(0)->nodeValue, 'note' => 'fallback img']);
  exit;
}

echo json_encode(['image' => null]);
