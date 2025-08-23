<?php
session_start();
include 'db.php';

if (!isset($_SESSION['role']) || $_SESSION['role'] != 'admin') {
    header("Location: login.php");
    exit();
}

$message = "";
if (isset($_POST['add_user'])) {
    $id        = $_POST['id'];
    $username  = $_POST['username'];
    $full_name = $_POST['full_name'];
    $email     = $_POST['email'];
    $role      = $_POST['role'];
    $password  = password_hash($_POST['password'], PASSWORD_DEFAULT);

    $check = $conn->prepare("SELECT * FROM users WHERE username=? OR id=?");
    $check->bind_param("ss", $username, $id);
    $check->execute();
    $result = $check->get_result();

    if ($result->num_rows > 0) {
        $message = "Username or ID already exists!";
    } else {
        $stmt = $conn->prepare("INSERT INTO users (id, username, password, role, full_name, email) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssss", $id, $username, $password, $role, $full_name, $email);
        if ($stmt->execute()) $message = "User added successfully!";
        else $message = "Error: ".$stmt->error;
        $stmt->close();
    }
    $check->close();
}

// Fetch all users for the table
$all_users = $conn->query("SELECT * FROM users");
?>

<!DOCTYPE html>
<html>
<head>
    <title>Add User</title>
    <style>
        body { font-family: Arial; background:#f4f4f4; padding:50px; }
        .container { max-width: 600px; margin:auto; background:#fff; padding:20px; border-radius:10px; }
        input, select, button { width:100%; padding:10px; margin:5px 0; }
        button { background:#007bff; color:white; border:none; cursor:pointer; }
        button:hover { background:#0056b3; }
        .message { color:green; text-align:center; }
        table { width:100%; border-collapse: collapse; margin-top:20px; }
        table, th, td { border:1px solid gray; }
        th, td { padding:10px; text-align:left; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Add User</h2>
        <p class="message"><?php echo $message; ?></p>
        <form method="POST">
            <input type="text" name="id" placeholder="TG/Lec Number" required>
            <input type="text" name="username" placeholder="Username" required>
            <input type="text" name="full_name" placeholder="Full Name" required>
            <input type="email" name="email" placeholder="Email" required>
            <select name="role" required>
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
            </select>
            <input type="text" name="password" placeholder="Password" required>
            <button type="submit" name="add_user">Add User</button>
        </form>
        <p><a href="manage_users.php">Back to Manage Users</a></p>

        <h3>All Users</h3>
        <table>
            <tr>
                <th>ID</th><th>Username</th><th>Role</th><th>Full Name</th><th>Email</th>
            </tr>
            <?php while($user = $all_users->fetch_assoc()){ ?>
            <tr>
                <td><?php echo $user['id']; ?></td>
                <td><?php echo $user['username']; ?></td>
                <td><?php echo $user['role']; ?></td>
                <td><?php echo $user['full_name']; ?></td>
                <td><?php echo $user['email']; ?></td>
            </tr>
            <?php } ?>
        </table>
    </div>
</body>
</html>
