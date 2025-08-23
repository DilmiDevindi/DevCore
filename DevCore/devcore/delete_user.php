<?php
session_start();
include 'db.php';

// Only allow admin access
if (!isset($_SESSION['role']) || $_SESSION['role'] != 'admin') {
    header("Location: login.php");
    exit();
}

$message = "";

// Handle delete user form submission
if (isset($_POST['delete_user'])) {
    $id = $_POST['id'];
    $stmt = $conn->prepare("DELETE FROM users WHERE id=?");
    $stmt->bind_param("s", $id);

    if ($stmt->execute()) $message = "User deleted successfully!";
    else $message = "Error: " . $stmt->error;

    $stmt->close();
}

// Fetch all users for table
$all_users = $conn->query("SELECT * FROM users");
?>

<!DOCTYPE html>
<html>
<head>
    <title>Delete User</title>
    <style>
        body { font-family: Arial; background:#f4f4f4; padding:50px; }
        .container { max-width: 600px; margin:auto; background:#fff; padding:20px; border-radius:10px; }
        input, button { width:100%; padding:10px; margin:5px 0; }
        button { background:#dc3545; color:white; border:none; cursor:pointer; }
        button:hover { background:#c82333; }
        .message { color:green; text-align:center; }
        table { width:100%; border-collapse: collapse; margin-top:20px; }
        table, th, td { border:1px solid gray; }
        th, td { padding:10px; text-align:left; }
    </style>
</head>
<body>
<div class="container">
    <h2>Delete User</h2>
    <p class="message"><?php echo $message; ?></p>
    <form method="POST">
        <input type="text" name="id" placeholder="User ID to Delete" required>
        <button type="submit" name="delete_user">Delete User</button>
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
