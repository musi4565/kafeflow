import { Routes, Route } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import Landing from "./pages/Landing";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";
import OrderStatus from "./pages/OrderStatus";
import Kitchen from "./pages/Kitchen";
import Login from "./pages/Login";
import Waiter from "./pages/Waiter";
import Owner from "./pages/Owner";
import { OfflineBanner } from "./components/OfflineBanner";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Splash } from "./components/Splash";

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <>
      <Splash />
      <OfflineBanner />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageTransition>
                <Landing />
              </PageTransition>
            }
          />
          <Route
            path="/menyu"
            element={
              <PageTransition>
                <Menu />
              </PageTransition>
            }
          />
          <Route
            path="/savat"
            element={
              <PageTransition>
                <Cart />
              </PageTransition>
            }
          />
          <Route
            path="/buyurtmalarim"
            element={
              <PageTransition>
                <MyOrders />
              </PageTransition>
            }
          />
          <Route
            path="/buyurtma/:id"
            element={
              <PageTransition>
                <OrderStatus />
              </PageTransition>
            }
          />
          <Route
            path="/oshxona"
            element={
              <PageTransition>
                <Kitchen />
              </PageTransition>
            }
          />
          <Route
            path="/kirish"
            element={
              <PageTransition>
                <Login />
              </PageTransition>
            }
          />
          <Route
            path="/ofitsiant"
            element={
              <PageTransition>
                <ProtectedRoute role={["WAITER", "OWNER"]}>
                  <Waiter />
                </ProtectedRoute>
              </PageTransition>
            }
          />
          <Route
            path="/egasi"
            element={
              <PageTransition>
                <ProtectedRoute role="OWNER">
                  <Owner />
                </ProtectedRoute>
              </PageTransition>
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  );
}
