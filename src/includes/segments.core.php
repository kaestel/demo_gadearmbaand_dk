<?php

// segment translations
// fallback settings for sites without specific segments configuration
// override this config by placing your own statements in config/segments.php
// you can override setting individually or for a whole type group - it is just an Array :-)

$segments_config = array(
	"www" => array(
	
		// fallback to something similar to detector-v2
		"desktop_edge"  => "desktop",
		"desktop"       => "desktop",

		"desktop_ie11"  => "desktop_ie",
		"desktop_ie10"  => "desktop_ie",
		"desktop_ie9"   => "desktop_ie",

		"smartphone"    => "smartphone",

		"desktop_light" => "unsupported",
		"tv"            => "unsupported",

		"tablet"        => "tablet",
		"tablet_light"  => "tablet",

		"mobile"        => "unsupported",
		"mobile_light"  => "unsupported",

		"seo"           => "seo"
	)

);

?>
