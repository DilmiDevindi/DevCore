<?php
session_start();
include 'db.php';

if (!isset($_SESSION['role']) || $_SESSION['role'] != 'admin') {
    header("Location: loging.php");
    exit();
}

// Generate unique ID (TG/LC/etc.) – you can adjust the prefix logic
function generateUserId($role) {
    $prefix = "";
    if ($role == "student") $prefix = "TG";
    elseif ($role == "lecturer") $prefix = "LC";
    elseif ($role == "staff") $prefix = "ST";
    elseif ($role == "admin") $prefix = "AD";

    return $prefix . rand(1000,9999);
}

// Add User
if(isset($_POST['add_user'])){
    $name = $_POST['user_name'];
    $email = $_POST['user_email'];
    $role = strtolower($_POST['user_role']); // lowercase to match ENUM
    $username = explode("@",$email)[0];
    $password = password_hash("1234", PASSWORD_DEFAULT);

    $id = generateUserId($role);

    $stmt = $conn->prepare("INSERT INTO users (id, username, full_name, email, role, password) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $id, $username, $name, $email, $role, $password);
    $stmt->execute(); 
    $stmt->close();
}

// Update User
if(isset($_POST['update_user'])){
    $id = $_POST['user_id'];
    $name = $_POST['user_name'];
    $email = $_POST['user_email'];
    $role = strtolower($_POST['user_role']); // lowercase for consistency

    $stmt = $conn->prepare("UPDATE users SET full_name=?, email=?, role=? WHERE id=?");
    $stmt->bind_param("ssss", $name, $email, $role, $id);
    $stmt->execute(); 
    $stmt->close();
}

// Delete User
if(isset($_POST['delete_user'])){
    $id = $_POST['user_id'];
    $stmt = $conn->prepare("DELETE FROM users WHERE id=?");
    $stmt->bind_param("s", $id);
    $stmt->execute(); 
    $stmt->close();
}

// Fetch Users
$users = $conn->query("SELECT * FROM users");
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>User Management</title>
<style>
body{font-family:sans-serif;background:#1e3a8a;color:#fff;padding:20px;}
.container{max-width:900px;margin:auto;}
.user-item{background:rgba(255,255,255,0.1);padding:10px;margin-bottom:10px;border-radius:8px;}
.user-item form{display:flex;flex-wrap:wrap;gap:10px;align-items:center;}
input,select{padding:5px;border-radius:5px;border:none;}
.btn{padding:6px 12px;border:none;border-radius:6px;cursor:pointer;}
.btn-update{background:#3b82f6;color:#fff;}
.btn-del{background:#f87171;color:#fff;}
</style>
</head>
<body>
<div class="container">
    <h1>User Management</h1>
    <p>Welcome <?=$_SESSION['full_name']?> | 
       <a href="logout.php" style="color:#ffcc00;">Logout</a> | 
       <a href="dashboard.php" style="color:#ffcc00;">Back to Dashboard</a>
    </p>

    <h3>Add User</h3>
    <form method="POST">
        <input type="text" name="user_name" placeholder="Full Name" required>
        <input type="email" name="user_email" placeholder="Email" required>
        <select name="user_role" required>
            <option value="student">Student</option>
            <option value="lecturer">Lecturer</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
        </select>
        <button type="submit" name="add_user" class="btn btn-update">Add</button>
    </form>

    <h3>Existing Users</h3>
    <?php while($u=$users->fetch_assoc()){ ?>
    <div class="user-item">
        <form method="POST">
            <input type="hidden" name="user_id" value="<?=$u['id']?>">
            <input type="text" name="user_name" value="<?=$u['full_name']?>" required>
            <input type="email" name="user_email" value="<?=$u['email']?>" required>
            <select name="user_role">
                <option value="student" <?=$u['role']=='student'?'selected':''?>>Student</option>
                <option value="lecturer" <?=$u['role']=='lecturer'?'selected':''?>>Lecturer</option>
                <option value="staff" <?=$u['role']=='staff'?'selected':''?>>Staff</option>
                <option value="admin" <?=$u['role']=='admin'?'selected':''?>>Admin</option>
            </select>
            <button type="submit" name="update_user" class="btn btn-update">Update</button>
            <button type="submit" name="delete_user" class="btn btn-del">Delete</button>
        </form>
    </div>
    <?php } ?>
</div>
</body>
</html>
