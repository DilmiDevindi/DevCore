<?php
session_start();
session_unset();
session_destroy();
header("Location: loging.php"); // Redirect to login page
exit();
?>
