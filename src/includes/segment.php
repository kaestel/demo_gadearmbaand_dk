<?php

	session_start();
	unset($_SESSION["segment"]);
	// segment parameter sent
	if(isset($_GET["segment"])) {

		$segment = $_GET["segment"];

	}
	// no session value, look up segment
	else if(!isset($_SESSION["segment"])) {

		$segment = file_get_contents("http://detector-v3.dearapi.com/text?ua=".urlencode($_SERVER["HTTP_USER_AGENT"])."&site=".urlencode($_SERVER["HTTP_HOST"])."&file=".urlencode($_SERVER["SCRIPT_NAME"]));

		if(!$segment) {
			$segment = "desktop";
		}
	}

	// update segment session value
	if(isset($segment) && $segment) {

		// DOES PROJECT HAVE FRAMEWORK SEGMENTS
		if(file_exists($_SERVER["LOCAL_PATH"]."/includes/segments.core.php")) {
			@include_once($_SERVER["LOCAL_PATH"]."/includes/segments.core.php");
		}

		if(isset($segments_config) && isset($segments_config["www"][$segment])) {
			$_SESSION["segment"] = $segments_config["www"][$segment];
		}
		else {
			$_SESSION["segment"] = $segment;
		}
		
	}

//	print $_SESSION["segment"];
	// debug helper
	if(isset($_GET["dev"])) {
		$_SESSION["dev"] = $_GET["dev"];
	}
	if(!isset($_SESSION["dev"])) {
		$_SESSION["dev"] = false;
	}

?>
