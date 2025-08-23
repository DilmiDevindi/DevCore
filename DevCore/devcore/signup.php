<?php
include "db.php";  // Your database connection
$message = "";

// Handle form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $id        = trim($_POST['id']);          // TG Number or Lecturer Number
    $username  = trim($_POST['username']);
    $full_name = trim($_POST['full_name']);
    $email     = trim($_POST['email']);
    $role      = $_POST['role'];
    $password  = $_POST['password'];

    // Server-side validation
    if(empty($id) || empty($username) || empty($full_name) || empty($email) || empty($role) || empty($password)){
        $message = "All fields are required!";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $message = "Invalid email format!";
    } elseif (strlen($password) < 8) {
        $message = "Password must be at least 8 characters long!";
    } else {
        // Hash the password
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        // Check if username or ID already exists
        $check = $conn->prepare("SELECT * FROM users WHERE username=? OR id=?");
        $check->bind_param("ss", $username, $id);
        $check->execute();
        $result = $check->get_result();

        if($result->num_rows > 0){
            $message = "Username or ID already exists!";
        } else {
            // Insert new user
            $stmt = $conn->prepare("INSERT INTO users (id, username, password, role, full_name, email) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("ssssss", $id, $username, $hashed_password, $role, $full_name, $email);

            if($stmt->execute()){
                // Redirect to login page after signup
                header("Location: loging.php?signup=success");
                exit();
            } else {
                $message = "Error: " . $stmt->error;
            }
            $stmt->close();
        }
        $check->close();
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Signup - Smart Canteen</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            background: url("https://images.unsplash.com/photo-1551782450-17144efb9c50") no-repeat center center fixed;
            background-size: cover;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }

        .form-container {
            background: rgba(255,255,255,0.95);
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.3);
            width: 400px;
        }

        h2 { text-align: center; margin-bottom: 20px; color: #333; }

        input, select {
            width: 100%; padding: 12px; margin: 10px 0;
            border: 1px solid #ccc; border-radius: 8px;
        }

        button {
            width: 100%; padding: 12px; border: none; border-radius: 8px;
            background: #28a745; color: white; font-size: 16px; cursor: pointer;
            transition: background 0.3s;
        }

        button:hover { background: #218838; }

        .message { color: red; text-align: center; margin: 10px 0; }

        a { color: #007bff; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="form-container">
        <h2>Signup</h2>
        <form method="POST">
            <input type="text" name="id" placeholder="TG Number / Lec Number" required>
            <input type="text" name="username" placeholder="Username" required>
            <input type="text" name="full_name" placeholder="Full Name" required>
            <input type="email" name="email" placeholder="Email" required>
            <select name="role" required>
                <option value="" disabled selected>Select Role</option>
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
            </select>
            <input type="password" name="password" placeholder="Password" required pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}" title="At least 8 characters with uppercase, lowercase & number">
            <button type="submit">Signup</button>
        </form>
        <p class="message"><?php echo $message; ?></p>
        <p><a href="loging.php">Already have an account? Login</a></p>
    </div>
</body>
</html>
