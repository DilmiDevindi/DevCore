// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./App.css";

// Common Components
import Navbar from "./components/common/Navbar";
import ProtectedRoute from "./components/common/ProtectedRoute";

// Auth Components
import Login from "./components/Login";
import Signup from "./components/Signup";

// Admin Components
import AdminDashboard from "./components/admin/Dashboard";
import AdminOrders from "./components/admin/Orders";
import MenuManagement from "./components/admin/MenuManagement";
import InventoryManagement from "./components/admin/Inventory";
import UserManagement from "./components/admin/UserManagement";

// Customer Components
import CustomerMenu from "./components/customer/Menu";
import OrderPage from "./components/customer/OrderPage";
import MyOrders from "./components/customer/MyOrders";
import OrderConfirmation from "./components/customer/OrderConfirmation";
import TableBooking from "./components/customer/TableBooking";
import QRExpressPickup from "./components/customer/QRExpressPickup";

// Common Pages
import Profile from "./components/common/Profile";
import Unauthorized from "./components/common/Unauthorized";
import NotFound from "./components/common/NotFound";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Routes with Navbar */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Routes>
                    {/* Admin Routes */}
                    <Route
                      path="/admin/dashboard"
                      element={
                        <ProtectedRoute allowedRoles={['admin', 'staff']}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/orders"
                      element={
                        <ProtectedRoute allowedRoles={['admin', 'staff']}>
                          <AdminOrders />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/menu"
                      element={
                        <ProtectedRoute allowedRoles={['admin', 'staff']}>
                          <MenuManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/inventory"
                      element={
                        <ProtectedRoute allowedRoles={['admin', 'staff']}>
                          <InventoryManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/users"
                      element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <UserManagement />
                        </ProtectedRoute>
                      }
                    />

                    {/* Customer Routes */}
                    <Route
                      path="/customer/menu"
                      element={
                        <ProtectedRoute allowedRoles={['student', 'lecturer']}>
                          <CustomerMenu />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/customer/order"
                      element={
                        <ProtectedRoute allowedRoles={['student', 'lecturer']}>
                          <OrderPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/customer/orders"
                      element={
                        <ProtectedRoute allowedRoles={['student', 'lecturer']}>
                          <MyOrders />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/customer/order-confirmation/:orderId"
                      element={
                        <ProtectedRoute allowedRoles={['student', 'lecturer']}>
                          <OrderConfirmation />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/customer/table-booking"
                      element={
                        <ProtectedRoute allowedRoles={['student', 'lecturer']}>
                          <TableBooking />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/customer/qr-pickup"
                      element={
                        <ProtectedRoute allowedRoles={['student', 'lecturer']}>
                          <QRExpressPickup />
                        </ProtectedRoute>
                      }
                    />

                    {/* Common Routes */}
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />

                    {/* 404 Route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;