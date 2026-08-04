import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import TicketCheckout from './pages/TicketCheckout';
import Profile from './pages/Profile';
import Scanner from './pages/Scanner';
import OrderConfirmation from './pages/OrderConfirmation';

function AppShell() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#FAF7F2' }}>
      <Navbar />
      <main className={`flex-grow ${isHome ? '' : 'pt-36 lg:pt-44'}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/events/:id/checkout/:tierId" element={<TicketCheckout />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/scanner" element={<Scanner />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#080808',
            color: '#FAF7F2',
            border: '1px solid #eb1e7a',
            borderRadius: '0',
            fontFamily: "'Jost', sans-serif",
            fontSize: '0.75rem',
            letterSpacing: '0.05em',
            padding: '12px 20px',
          },
          success: { iconTheme: { primary: '#eb1e7a', secondary: '#FAF7F2' } },
          error: { iconTheme: { primary: '#C9A84C', secondary: '#FAF7F2' } },
        }}
      />
    </Router>
  );
}

export default App;
