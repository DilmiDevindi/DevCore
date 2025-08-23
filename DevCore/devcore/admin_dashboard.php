<?php
session_start();
include 'db.php';

// Only allow admin access
if (!isset($_SESSION['role']) || $_SESSION['role'] != 'admin') {
    header("Location: loging.php");
    exit();
}

// --- Handle Menu Add ---
if(isset($_POST['add_menu'])){
    $name = $_POST['item_name'];
    $desc = $_POST['item_desc'];
    $price = $_POST['item_price'];
    $category = $_POST['item_category'];
    $image_path = "";

    if(isset($_FILES['item_image']) && $_FILES['item_image']['name'] != ""){
        $image_name = time()."_".$_FILES['item_image']['name'];
        $target = "menu_images/".$image_name;
        move_uploaded_file($_FILES['item_image']['tmp_name'], $target);
        $image_path = $target;
    }

    $stmt = $conn->prepare("INSERT INTO menu (item_name, description, price, category, image) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("ssdss", $name, $desc, $price, $category, $image_path);
    $stmt->execute();
    $stmt->close();
}

// --- Fetch Menu Items ---
$menu_items = $conn->query("SELECT * FROM menu");

// --- Dashboard Stats ---
// Total Orders Today
$result = $conn->query("SELECT COUNT(*) as total_orders FROM orders WHERE DATE(order_time) = CURDATE()");
$total_orders = $result->fetch_assoc()['total_orders'];

// Revenue Today
$result = $conn->query("SELECT SUM(quantity * price) as revenue_today FROM orders 
                        JOIN menu ON orders.item_id = menu.item_id
                        WHERE DATE(order_time) = CURDATE()");
$revenue_today = $result->fetch_assoc()['revenue_today'];
if(!$revenue_today) $revenue_today = 0;

// Pending Orders
$result = $conn->query("SELECT COUNT(*) as pending_orders FROM orders WHERE status='pending'");
$pending_orders = $result->fetch_assoc()['pending_orders'];

// Total Users
$result = $conn->query("SELECT COUNT(*) as total_users FROM users");
$total_users = $result->fetch_assoc()['total_users'];
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin Dashboard - LankaCanteen Pro</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background:#1e3a8a; color:#fff; padding:20px; }
.container { max-width:1200px; margin:0 auto; }
.header { text-align:center; margin-bottom:30px; }
.header h1 { font-size:2.5rem; color:#fff; }
.header p a { color: #ffcc00; text-decoration: none; font-weight: bold; margin-left:10px; }
.nav-tabs { display:flex; margin-bottom:30px; }
.nav-tab { flex:1; padding:15px; cursor:pointer; text-align:center; background:#2563eb; border:none; margin-right:5px; border-radius:8px; }
.nav-tab.active { background:#60a5fa; }
.tab-content { display:none; }
.tab-content.active { display:block; }
.stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:20px; margin-bottom:30px; }
.stat-card { background:rgba(255,255,255,0.1); padding:20px; border-radius:15px; text-align:center; }
.stat-number { font-size:2rem; font-weight:bold; color:#e0f2fe; }
.form-group { margin-bottom:15px; }
.form-group input, .form-group select { width:100%; padding:10px; border-radius:5px; border:none; }
.btn { background:#3b82f6; color:#fff; padding:10px 20px; border:none; border-radius:8px; cursor:pointer; }
.menu-item { background:rgba(255,255,255,0.1); padding:15px; border-radius:10px; margin-bottom:10px; display:flex; align-items:center; gap:15px; }
img { width:80px; height:60px; object-fit:cover; border-radius:8px; }
a.nav-link { text-decoration:none; color:#fff; display:flex; align-items:center; justify-content:center; flex:1; padding:15px; background:#2563eb; border-radius:8px; margin-right:5px; }
a.nav-link:hover { background:#60a5fa; }
</style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>Admin Dashboard</h1>
        <p>Welcome <?php echo $_SESSION['full_name']; ?> | <a href="logout.php">Logout</a></p>
    </div>

    <div class="nav-tabs">
        <button class="nav-tab active" onclick="showTab('dashboard')">Dashboard</button>
        <button class="nav-tab" onclick="showTab('menu')">Menu Management</button>
        <a href="admin_users.php" class="nav-link">User Management</a>
        <button class="nav-tab" onclick="showTab('reports')">Reports</button>
    </div>

    <!-- Dashboard -->
    <div id="dashboard" class="tab-content active">
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-number"><?php echo $total_orders; ?></div><p>Total Orders Today</p></div>
            <div class="stat-card"><div class="stat-number">Rs. <?php echo number_format($revenue_today, 2); ?></div><p>Revenue Today</p></div>
            <div class="stat-card"><div class="stat-number"><?php echo $total_users; ?></div><p>Total Users</p></div>
            <div class="stat-card"><div class="stat-number"><?php echo $pending_orders; ?></div><p>Pending Orders</p></div>
        </div>
    </div>

    <!-- Menu Management -->
    <div id="menu" class="tab-content">
        <h3>Add New Menu Item</h3>
        <form method="POST" enctype="multipart/form-data">
            <div class="form-group"><input type="text" name="item_name" placeholder="Item Name" required></div>
            <div class="form-group"><input type="text" name="item_desc" placeholder="Description"></div>
            <div class="form-group"><input type="number" step="0.01" name="item_price" placeholder="Price" required></div>
            <div class="form-group">
                <select name="item_category">
                    <option>Main Course</option>
                    <option>Appetizer</option>
                    <option>Dessert</option>
                    <option>Beverage</option>
                </select>
            </div>
            <div class="form-group"><input type="file" name="item_image" accept="image/*"></div>
            <button class="btn" type="submit" name="add_menu">Add Item</button>
        </form>

        <h3 style="margin-top:30px;">Current Menu Items</h3>
        <div id="menuItems">
            <?php while($row = $menu_items->fetch_assoc()){ ?>
            <div class="menu-item">
                <?php if($row['image']){?><img src="<?php echo $row['image'];?>" alt="Menu Image"><?php } ?>
                <div>
                    <h4><?php echo $row['item_name'];?> - Rs. <?php echo $row['price'];?></h4>
                    <p><?php echo $row['category'];?></p>
                </div>
            </div>
            <?php } ?>
        </div>
    </div>

    <!-- Reports -->
    <div id="reports" class="tab-content">
        <h3>Sales Report</h3>
        <div style="background:rgba(255,255,255,0.1); padding:20px; border-radius:15px; margin-bottom:20px;">
            <h4>Today's Sales: ₹<?php echo number_format($revenue_today,2); ?></h4>
            <p>Orders: <?php echo $total_orders; ?> | Average Order: ₹<?php echo $total_orders > 0 ? number_format($revenue_today/$total_orders,2) : 0; ?></p>
        </div>
        <h3>Popular Items</h3>
        <div style="background:rgba(255,255,255,0.1); padding:20px; border-radius:15px;">
            <p>1. Chicken Biryani - 45 orders</p>
            <p>2. Veg Thali - 38 orders</p>
            <p>3. Chicken Curry - 32 orders</p>
        </div>
    </div>
</div>

<script>
function showTab(tabName){
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}
</script>
</body>
</html>
