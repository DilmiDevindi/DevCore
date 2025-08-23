<?php
$host = "localhost";
$user = "root";
$pass = "1234";
$db   = "smartcanteen";

// Create connection
$conn = new mysqli($host, $user, $pass, $db);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} else {
    echo "Database connected successfully!";
}
?>
