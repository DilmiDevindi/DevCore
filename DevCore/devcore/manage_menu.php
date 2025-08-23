<?php
session_start();
include 'db.php';

// Only allow admin access
if (!isset($_SESSION['role']) || $_SESSION['role'] != 'admin') {
    header("Location: login.php");
    exit();
}

$message = "";

// --- Add Menu Item ---
if (isset($_POST['add_menu'])) {
    $item_name = $_POST['item_name'];
    $category  = $_POST['category'];
    $price     = $_POST['price'];
    $availability = isset($_POST['availability']) ? 1 : 0;

    $stmt = $conn->prepare("INSERT INTO menu (item_name, category, price, availability) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssdi", $item_name, $category, $price, $availability);

    if ($stmt->execute()) $message = "Menu item added successfully!";
    else $message = "Error: ".$stmt->error;

    $stmt->close();
}

// --- Edit Menu Item ---
if (isset($_POST['edit_menu'])) {
    $item_id   = $_POST['item_id'];
    $item_name = $_POST['item_name'];
    $category  = $_POST['category'];
    $price     = $_POST['price'];
    $availability = isset($_POST['availability']) ? 1 : 0;

    $stmt = $conn->prepare("UPDATE menu SET item_name=?, category=?, price=?, availability=? WHERE item_id=?");
    $stmt->bind_param("ssdii", $item_name, $category, $price, $availability, $item_id);

    if ($stmt->execute()) $message = "Menu item updated successfully!";
    else $message = "Error: ".$stmt->error;

    $stmt->close();
}

// --- Delete Menu Item ---
if (isset($_POST['delete_menu'])) {
    $item_id = $_POST['item_id'];
    $stmt = $conn->prepare("DELETE FROM menu WHERE item_id=?");
    $stmt->bind_param("i", $item_id);

    if ($stmt->execute()) $message = "Menu item deleted successfully!";
    else $message = "Error: ".$stmt->error;

    $stmt->close();
}

// Fetch all menu items for table
$all_menu = $conn->query("SELECT * FROM menu");
?>

<!DOCTYPE html>
<html>
<head>
    <title>Manage Menu - Smart Canteen</title>
    <style>
        body { font-family: Arial; background:#f4f4f4; padding:50px; }
        .container { max-width: 700px; margin:auto; background:#fff; padding:20px; border-radius:10px; }
        input, select, button { width:100%; padding:10px; margin:5px 0; }
        button { cursor:pointer; }
        .add { background:#28a745; color:white; border:none; }
        .edit { background:#007bff; color:white; border:none; }
        .delete { background:#dc3545; color:white; border:none; }
        button:hover { opacity:0.8; }
        .message { color:green; text-align:center; }
        table { width:100%; border-collapse: collapse; margin-top:20px; }
        table, th, td { border:1px solid gray; }
        th, td { padding:10px; text-align:left; }
    </style>
</head>
<body>
<div class="container">
    <h2>Manage Menu</h2>
    <p class="message"><?php echo $message; ?></p>

    <!-- Add Menu Form -->
    <form method="POST">
        <h3>Add Menu Item</h3>
        <input type="text" name="item_name" placeholder="Item Name" required>
        <input type="text" name="category" placeholder="Category" required>
        <input type="number" step="0.01" name="price" placeholder="Price" required>
        <label>
            <input type="checkbox" name="availability" checked> Available
        </label>
        <button type="submit" name="add_menu" class="add">Add Menu</button>
    </form>

    <!-- Edit Menu Form -->
    <form method="POST">
        <h3>Edit Menu Item</h3>
        <input type="number" name="item_id" placeholder="Item ID to Edit" required>
        <input type="text" name="item_name" placeholder="New Item Name" required>
        <input type="text" name="category" placeholder="New Category" required>
        <input type="number" step="0.01" name="price" placeholder="New Price" required>
        <label>
            <input type="checkbox" name="availability"> Available
        </label>
        <button type="submit" name="edit_menu" class="edit">Update Menu</button>
    </form>

    <!-- Delete Menu Form -->
    <form method="POST">
        <h3>Delete Menu Item</h3>
        <input type="number" name="item_id" placeholder="Item ID to Delete" required>
        <button type="submit" name="delete_menu" class="delete">Delete Menu</button>
    </form>

    <h3>All Menu Items</h3>
    <table>
        <tr>
            <th>ID</th><th>Name</th><th>Category</th><th>Price</th><th>Available</th>
        </tr>
        <?php while($item = $all_menu->fetch_assoc()){ ?>
        <tr>
            <td><?php echo $item['item_id']; ?></td>
            <td><?php echo $item['item_name']; ?></td>
            <td><?php echo $item['category']; ?></td>
            <td><?php echo $item['price']; ?></td>
            <td><?php echo $item['availability'] ? 'Yes' : 'No'; ?></td>
        </tr>
        <?php } ?>
    </table>

    <p><a href="admin_dashboard.php">Back to Dashboard</a></p>
</div>
</body>
</html>
