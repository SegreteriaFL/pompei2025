<?php
// api/og-image.php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$url = isset($_GET['url']) ? trim($_GET['url']) : '';
if (!$url || !filter_var($url, FILTER_VALIDATE_URL)) {
  http_response_code(400);
  echo json_encode(['image' => null, 'error' => 'Missing or invalid url']);
  exit;
}

function fetch_html($u) {
  if (function_exists('curl_init')) {
    $ch = curl_init($u);
    curl_setopt_array($ch, [
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_MAXREDIRS      => 5,
      CURLOPT_TIMEOUT        => 10,
      CURLOPT_USERAGENT      => 'OeL-OG-Fetch/1.2 (+fedeeluce.it/pompei2025)',
      CURLOPT_SSL_VERIFYPEER => true,
    ]);
    $html = curl_exec($ch);
    curl_close($ch);
    if ($html !== false && $html !== '') return $html;
  }
  // fallback se cURL non disponibile
  $ctx = stream_context_create([
    'http' => [
      'method' => 'GET',
      'header' => "User-Agent: OeL-OG-Fetch/1.2 (+fedeeluce.it/pompei2025)\r\n"
    ]
  ]);
  $html = @file_get_contents($u, false, $ctx);
  return $html !== false ? $html : null;
}

function absolutize($maybe, $base) {
  if (!$maybe) return null;
  // già assoluto?
  if (preg_match('~^https?://~i', $maybe)) return $maybe;

  $p = parse_url($base);
  if (!$p || empty($p['scheme']) || empty($p['host'])) return $maybe;

  $scheme = $p['scheme'];
  $host   = $p['host'];
  $port   = isset($p['port']) ? ':'.$p['port'] : '';
  $root   = $scheme.'://'.$host.$port;

  if (strpos($maybe, '//') === 0) return $scheme . ':' . $maybe; // protocol-relative
  if (strpos($maybe, '/')  === 0) return $root . $maybe;         // path assoluto

  // path relativo
  $path = isset($p['path']) ? $p['path'] : '/';
  $dir  = rtrim(dirname($path), '/') . '/';
  return $root . $dir . $maybe;
}

$html = fetch_html($url);
if (!$html) {
  echo json_encode(['image' => null, 'note' => 'fetch failed']);
  exit;
}

libxml_use_internal_errors(true);
$dom = new DOMDocument();
$dom->loadHTML($html);
$xpath = new DOMXPath($dom);

// 1) og:image
$nodes = $xpath->query('//meta[@property="og:image"]/@content | //meta[@name="og:image"]/@content');
if ($nodes && $nodes->length > 0) {
  $img = absolutize(trim($nodes->item(0)->nodeValue), $url);
  echo json_encode(['image' => $img]);
  exit;
}

// 2) prima immagine significativa nella pagina
$img = $xpath->query('//article//img[@src]/@src | //main//img[@src]/@src | //img[@src]/@src');
if ($img && $img->length > 0) {
  $src = absolutize(trim($img->item(0)->nodeValue), $url);
  echo json_encode(['image' => $src, 'note' => 'fallback img']);
  exit;
}

echo json_encode(['image' => null]);
