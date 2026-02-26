import { useState, useEffect } from "react";
import "./App.css";

interface CartItem {
  sku: string;
  name: string;
  price: number;
  qty: number;
}

function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcode, setBarcode] = useState("");
  const [lastInvoice, setLastInvoice] = useState<string | null>(null);
  
  // NEW: State for our Add Product Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ sku: "", name: "", price: "", stock: "" });

  // The "Scanner" Logic
  const handleScan = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && barcode.trim() !== "") {
      try {
        const response = await fetch(`http://localhost:8080/api/search?sku=${barcode}`);
        if (response.ok) {
          const product = await response.json();
          setCart((prev) => {
            const existing = prev.find((item) => item.sku === product.sku);
            if (existing) {
              return prev.map((item) => 
                item.sku === product.sku ? { ...item, qty: item.qty + 1 } : item
              );
            }
            return [...prev, { ...product, qty: 1 }];
          });
          setLastInvoice(null); 
        } else {
          alert("Item not found. Press F2 to add it!");
        }
      } catch (error) {
        console.error("Engine disconnected");
      }
      setBarcode(""); 
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const gst = subtotal * 0.18;
  const grandTotal = subtotal + gst;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const response = await fetch("http://localhost:8080/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, total: grandTotal }),
      });
      if (response.ok) {
        const data = await response.json();
        setLastInvoice(data.invoice_id);
        setCart([]);
        setBarcode("");
      }
    } catch (error) {
      console.error("Failed to connect");
    }
  };

  // NEW: Save Product to Database
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/api/add-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: newProduct.sku,
          name: newProduct.name,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock)
        })
      });

      if (response.ok) {
        setShowAddModal(false);
        setNewProduct({ sku: "", name: "", price: "", stock: "" });
        alert(`✅ ${newProduct.name} saved successfully!`);
      }
    } catch (error) {
      alert("Database error!");
    }
  };

  // Global Keyboard Shortcuts (F5 & F2)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F5") {
        e.preventDefault();
        handleCheckout();
      }
      if (e.key === "F2") {
        e.preventDefault();
        setShowAddModal((prev) => !prev); // Toggle Modal
      }
      if (e.key === "Escape") {
        setShowAddModal(false); // Close Modal on Esc
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, grandTotal]);

  return (
    <div className="h-screen w-screen bg-surface flex flex-col font-sans text-white relative">
      <nav className="h-14 border-b border-white/10 flex items-center px-6 justify-between bg-panel">
        <h1 className="text-brand font-bold text-xl tracking-tight">HYTECH ERP v2.0</h1>
        <div className="flex gap-4 text-sm text-gray-400">
          <button onClick={() => setShowAddModal(true)} className="hover:text-white transition-colors">F2: Add Product</button>
          <span>F5: Complete Sale</span>
        </div>
      </nav>

      <main className="flex-1 flex p-4 gap-4 bg-surface">
        <div className="flex-1 bg-panel/50 rounded-xl border border-white/5 p-6 flex flex-col relative">
          <input 
            type="text" 
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleScan}
            placeholder="Scan Barcode (Enter)..." 
            className="w-full bg-surface border border-white/10 rounded-lg p-4 text-lg focus:border-brand outline-none transition-all text-white mb-6"
            autoFocus
          />
          
          <div className="flex-1 overflow-auto border-t border-white/10 pt-4">
            {cart.length === 0 ? (
              <div className="text-gray-500 text-center py-20 flex flex-col items-center justify-center">
                {lastInvoice ? (
                  <div className="bg-green-500/20 border border-green-500 text-green-400 px-8 py-6 rounded-xl text-xl animate-pulse font-bold shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                    ✅ Sale Complete! <br/> Invoice No: {lastInvoice}
                  </div>
                ) : "No items in cart. Start scanning..."}
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 text-sm border-b border-white/10">
                    <th className="pb-2">Item</th>
                    <th className="pb-2">Qty</th>
                    <th className="pb-2 text-right">Price</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, idx) => (
                    <tr key={idx} className="border-b border-white/5">
                      <td className="py-4">{item.name} <br/><span className="text-xs text-gray-500">{item.sku}</span></td>
                      <td className="py-4">{item.qty}</td>
                      <td className="py-4 text-right">₹{item.price.toFixed(2)}</td>
                      <td className="py-4 text-right font-bold">₹{(item.price * item.qty).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="w-80 bg-panel rounded-xl border border-white/5 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-gray-400 uppercase text-xs font-semibold tracking-widest">Bill Summary</h2>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>GST (18%)</span><span>₹{gst.toFixed(2)}</span></div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-4">
            <div className="flex justify-between items-end">
              <span className="text-gray-400">Total</span>
              <span className="text-4xl font-bold text-brand">₹{grandTotal.toFixed(2)}</span>
            </div>
            <button 
              onClick={handleCheckout}
              className={`w-full font-bold py-4 rounded-lg mt-6 transition-all ${
                cart.length > 0 ? "bg-brand text-black hover:brightness-110 active:scale-95" : "bg-gray-800 text-gray-500 cursor-not-allowed"
              }`}
            >
              COMPLETE SALE (F5)
            </button>
          </div>
        </div>
      </main>

      {/* NEW: The Glassmorphism Add Product Modal */}
      {showAddModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-panel border border-white/10 rounded-2xl p-8 w-[400px] shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-brand">Add New Product</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
              <input 
                required placeholder="Barcode / SKU" value={newProduct.sku}
                onChange={e => setNewProduct({...newProduct, sku: e.target.value})}
                className="bg-surface border border-white/10 rounded-lg p-3 text-white outline-none focus:border-brand"
              />
              <input 
                required placeholder="Product Name" value={newProduct.name}
                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                className="bg-surface border border-white/10 rounded-lg p-3 text-white outline-none focus:border-brand"
              />
              <div className="flex gap-4">
                <input 
                  required type="number" step="0.01" placeholder="Price (₹)" value={newProduct.price}
                  onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                  className="bg-surface border border-white/10 rounded-lg p-3 text-white outline-none focus:border-brand w-full"
                />
                <input 
                  required type="number" placeholder="Stock" value={newProduct.stock}
                  onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                  className="bg-surface border border-white/10 rounded-lg p-3 text-white outline-none focus:border-brand w-full"
                />
              </div>
              <button type="submit" className="w-full bg-brand text-black font-bold py-3 rounded-lg mt-4 hover:brightness-110">
                SAVE TO DATABASE
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;