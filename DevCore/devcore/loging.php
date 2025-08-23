<?php
session_start();
include "db.php"; //  database connection

$message = "";

// Redirect already logged-in users
if(isset($_SESSION['role'])){
    switch($_SESSION['role']){
        case 'admin': header("Location: admin_dashboard.php"); break;
        case 'staff': header("Location: staff_dashbord.php"); break;
        case 'student': header("Location: student_dashboard.php"); break;
        case 'lecturer': header("Location: lecturer_dashboard.php"); break;
    }
    exit();
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);

    // Prepare statement to prevent SQL injection
    $sql = "SELECT * FROM users WHERE username=?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();

        // Verify password
        if (password_verify($password, $user['password'])) {
            session_regenerate_id(true); // security
            $_SESSION['id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['full_name'] = $user['full_name'];

            // Redirect based on role
            switch ($user['role']) {
                case 'admin': header("Location: admin_dashboard.php"); break;
                case 'staff': header("Location: staff_dashbord.php"); break;
                case 'student': header("Location: student_dashboard.php"); break;
                case 'lecturer': header("Location: lecturer_dashboard.php"); break;
                default: $message = "Invalid role!";
            }
            exit();
        } else {
            $message = "Invalid password!";
        }
    } else {
        $message = "User not found!";
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Login - Smart Canteen</title>
    <style>
        body {
            font-family: Arial; 
            background: #f4f4f4; 
            display: flex; justify-content: center; align-items: center; height: 100vh;
        }
        .login-container {
            width: 400px; padding: 30px;
            background: white; border-radius: 8px; box-shadow: 0 0 15px rgba(0,0,0,0.2);
        }
        h2 { text-align: center; margin-bottom: 20px; color: #333; }
        input { width: 100%; padding: 12px; margin: 8px 0; border-radius: 5px; border: 1px solid #ccc; }
        button {
            width: 100%; padding: 12px; background: #007bff;
            color: white; border: none; border-radius: 5px; cursor: pointer;
            transition: background 0.3s;
        }
        button:hover { background: #0056b3; }
        .message { text-align: center; color: red; margin: 10px 0; }
        a { display: block; text-align: center; color: #007bff; margin-top: 10px; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="login-container">
        <h2>Login</h2>
        <form method="POST" action="">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
        <p class="message"><?php echo $message; ?></p>
        <a href="signup.php">Don't have an account? Signup</a>
    </div>
</body>
</html>
