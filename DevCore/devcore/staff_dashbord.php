<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Staff Dashboard - LankaCanteen Pro</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%); color: #fff; min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; position: relative; }
        .header { background: rgba(0,0,0,0.3); backdrop-filter: blur(10px); padding: 20px; border-radius: 15px; margin-bottom: 30px; text-align: center; position: relative; }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; background: linear-gradient(45deg, #ffffff, #e0f2fe); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .nav-tabs { display: flex; background: rgba(0,0,0,0.2); border-radius: 10px; padding: 5px; margin-bottom: 30px; }
        .nav-tab { flex: 1; padding: 15px 20px; background: transparent; border: none; color: #fff; cursor: pointer; border-radius: 8px; transition: all 0.3s ease; }
        .nav-tab.active { background: linear-gradient(45deg, #3b82f6, #60a5fa); }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .order-card { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 15px; padding: 20px; margin-bottom: 15px; transition: all 0.3s ease; }
        .order-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(59, 130, 246, 0.15); }
        .status-btn { background: #3b82f6; color: white; border: none; padding: 5px 15px; border-radius: 5px; cursor: pointer; margin: 5px; font-weight: 600; transition: all 0.3s ease; }
        .status-btn:hover { background: #2563eb; transform: scale(1.05); box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3); }

        .popup-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: none; justify-content: center; align-items: center; z-index: 1000; }
        .popup-card { background: #1e3a8a; padding: 30px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4); text-align: center; max-width: 400px; width: 90%; position: relative; }
        .popup-close-btn { position: absolute; top: 10px; right: 15px; background: transparent; border: none; color: white; font-size: 1.5rem; cursor: pointer; }
        .stock-controls { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 20px; }
        .stock-controls button { font-size: 2rem; width: 50px; height: 50px; border-radius: 50%; background: #60a5fa; border: none; color: #1e3a8a; cursor: pointer; transition: background 0.2s ease; }
        .stock-controls button:hover { background: #3b82f6; }
        .stock-value { font-size: 2rem; font-weight: bold; }
        .low-stock-status { color: #ff8a80; font-weight: bold; }

        /* Logout button styles */
        #logout-btn {
            position: absolute;
            top: 20px;
            right: 30px;
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            background: #ef4444;
            color: white;
            cursor: pointer;
            font-weight: bold;
            transition: 0.3s;
        }
        #logout-btn:hover { background: #dc2626; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Staff Dashboard</h1>
            <p>Manage LankaCanteen Pro orders and kitchen operations with authentic Sri Lankan recipes</p>
            <button id="logout-btn" onclick="logout()">Logout</button>
        </div>

        <div class="nav-tabs">
            <button class="nav-tab active" onclick="showTab('orders', event)">Order Management</button>
            <button class="nav-tab" onclick="showTab('menu', event)">Menu Management</button>
            <button class="nav-tab" onclick="showTab('sales', event)">Sales</button>
        </div>

        <!-- Orders Tab -->
        <div id="orders" class="tab-content active">
            <h3>Pending Orders</h3>
            <div class="order-card">
                <h4>Order #1 - Student</h4>
                <p>🍛 Rice & Curry Set x2, 🥘 Chicken Kottu Roti x1</p>
                <p>Total: Rs. 980</p>
                <button class="status-btn" onclick="updateStatus(1, 'preparing')">Start Preparing</button>
                <button class="status-btn" onclick="updateStatus(1, 'ready')">Mark Ready</button>
            </div>
            <div class="order-card">
                <h4>Order #2 - Lecturer (Priority)</h4>
                <p>🍖 Chicken Curry with Rice x3, 🥟 Fish Cutlets x2</p>
                <p>Total: Rs. 1,200</p>
                <button class="status-btn" onclick="updateStatus(2, 'preparing')">Start Preparing</button>
                <button class="status-btn" onclick="updateStatus(2, 'ready')">Mark Ready</button>
            </div>
        </div>

        <!-- Menu Tab -->
        <div id="menu" class="tab-content">
            <h3>Stock Management</h3>
            <div class="order-card">
                <h4 id="item-name-1">🍛 Rice & Curry Set</h4>
                <p>Stock: <span id="stock-1">25</span> servings<span id="low-status-1"></span></p>
                <button class="status-btn" onclick="showStockPopup('item-name-1', 'stock-1', 'low-status-1')">Update Stock</button>
            </div>
            <div class="order-card">
                <h4 id="item-name-2">🍖 Chicken Kottu Roti</h4>
                <p>Stock: <span id="stock-2">15</span> servings<span id="low-status-2"></span></p>
                <button class="status-btn" onclick="showStockPopup('item-name-2', 'stock-2', 'low-status-2')">Update Stock</button>
            </div>
            <div class="order-card">
                <h4 id="item-name-3">Chicken Curry with Rice</h4>
                <p>Stock: <span id="stock-3">8</span> servings<span id="low-status-3" class="low-stock-status"> (LOW)</span></p>
                <button class="status-btn" onclick="showStockPopup('item-name-3', 'stock-3', 'low-status-3')">Update Stock</button>
            </div>
        </div>

        <!-- Sales Tab -->
        <div id="sales" class="tab-content">
            <h3>Today's Sales Overview</h3>
            <div class="order-card">
                <h4>Total Revenue: Rs. 12,450</h4>
                <p>Orders Completed: 134</p>
                <p>Average Order Value: Rs. 93</p>
            </div>

            <h3>Low Stock Alerts</h3>
            <div id="low-stock-alerts" class="order-card"></div>
        </div>
    </div>

    <!-- Stock Popup -->
    <div id="stock-popup-overlay" class="popup-overlay">
        <div class="popup-card">
            <button class="popup-close-btn" onclick="hideStockPopup()">&times;</button>
            <h3 id="popup-item-name"></h3>
            <p>Current Stock: <span id="popup-stock-value"></span></p>
            <div class="stock-controls">
                <button onclick="decreaseStock()">-</button>
                <button onclick="increaseStock()">+</button>
            </div>
        </div>
    </div>

    <script>
        let currentStockElementId = '';
        let currentLowStatusId = '';
        const LOW_STOCK_THRESHOLD = 10;
        const menuItems = [
            { nameId: 'item-name-1', stockId: 'stock-1', lowStatusId: 'low-status-1' },
            { nameId: 'item-name-2', stockId: 'stock-2', lowStatusId: 'low-status-2' },
            { nameId: 'item-name-3', stockId: 'stock-3', lowStatusId: 'low-status-3' }
        ];

        function updateStockDisplay(stockElementId, lowStatusId) {
            const stockElement = document.getElementById(stockElementId);
            const lowStatusElement = document.getElementById(lowStatusId);
            const stockCount = parseInt(stockElement.textContent);
            if (lowStatusElement) {
                if (stockCount <= LOW_STOCK_THRESHOLD) {
                    lowStatusElement.textContent = ' (LOW)';
                    lowStatusElement.classList.add('low-stock-status');
                } else {
                    lowStatusElement.textContent = '';
                    lowStatusElement.classList.remove('low-stock-status');
                }
            }
        }

        function showTab(tabName, event) {
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
            document.getElementById(tabName).classList.add('active');
            event.currentTarget.classList.add('active');
        }

        function updateStatus(orderId, status) {
            alert(`Order #${orderId} status updated to: ${status}`);
        }

        function showStockPopup(itemNameId, stockId, lowStatusId) {
            currentStockElementId = stockId;
            currentLowStatusId = lowStatusId;
            document.getElementById('popup-item-name').textContent = document.getElementById(itemNameId).textContent;
            document.getElementById('popup-stock-value').textContent = document.getElementById(stockId).textContent;
            document.getElementById('stock-popup-overlay').style.display = 'flex';
        }

        function hideStockPopup() { document.getElementById('stock-popup-overlay').style.display = 'none'; }

        function increaseStock() {
            const stockElement = document.getElementById(currentStockElementId);
            let currentStock = parseInt(stockElement.textContent);
            currentStock += 1;
            stockElement.textContent = currentStock;
            document.getElementById('popup-stock-value').textContent = currentStock;
            updateStockDisplay(currentStockElementId, currentLowStatusId);
            updateLowStockAlerts();
            alert(`Stock increased! New stock for ${document.getElementById('popup-item-name').textContent}: ${currentStock}`);
        }

        function decreaseStock() {
            const stockElement = document.getElementById(currentStockElementId);
            let currentStock = parseInt(stockElement.textContent);
            if (currentStock > 0) {
                currentStock -= 1;
                stockElement.textContent = currentStock;
                document.getElementById('popup-stock-value').textContent = currentStock;
                updateStockDisplay(currentStockElementId, currentLowStatusId);
                updateLowStockAlerts();
                alert(`Stock decreased! New stock for ${document.getElementById('popup-item-name').textContent}: ${currentStock}`);
            } else { alert('Stock cannot be decreased below 0.'); }
        }

        function updateLowStockAlerts() {
            const lowStockAlertsSection = document.getElementById('low-stock-alerts');
            let alertsHTML = '';
            menuItems.forEach(item => {
                const stockCount = parseInt(document.getElementById(item.stockId).textContent);
                const itemName = document.getElementById(item.nameId).textContent;
                if (stockCount <= LOW_STOCK_THRESHOLD) {
                    alertsHTML += `<h4>⚠ ${itemName} - Only ${stockCount} servings left</h4><p>Please restock soon!</p>`;
                }
            });
            lowStockAlertsSection.innerHTML = alertsHTML === '' ? '<h4>All stock levels are healthy.</h4>' : alertsHTML;
        }

        function logout() {
            if (confirm('Are you sure you want to logout?')) {
                window.location.href = 'logout.php';
            }
        }

        window.onload = () => { menuItems.forEach(item => updateStockDisplay(item.stockId, item.lowStatusId)); updateLowStockAlerts(); };
    </script>
</body>
</html>
