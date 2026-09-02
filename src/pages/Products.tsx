import { useState, useEffect } from "react";
import { Link } from "react-router";
import axios from "axios";
import { Search } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  image?: string;
  category?: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // We would fetch actual products from API here
    // Initial product state
    setProducts([
      {
        _id: "1",
        name: "Premium Options Trading Signals",
        description: "Get real-time options trading signals directly in our exclusive Telegram channel.",
        price: 4999,
        discountPrice: 2499,
        category: "Trading"
      },
      {
        _id: "2",
        name: "Crypto Alpha Mastermind",
        description: "Join the elite group of crypto investors. Includes daily market analysis and private chat.",
        price: 9999,
        discountPrice: 4999,
        category: "Crypto"
      }
    ]);
    setLoading(false);
  }, []);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Our Products</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Unlock premium Telegram access</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(product => (
          <div key={product._id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all flex flex-col">
            <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 p-6 flex flex-col justify-end">
              <span className="inline-block px-3 py-1 bg-white/50 dark:bg-black/30 backdrop-blur-sm rounded-lg text-sm font-medium w-fit mb-2">
                {product.category}
              </span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2">{product.name}</h3>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-6 flex-1">
                {product.description}
              </p>
              <div className="flex items-center justify-between mt-auto">
                <div>
                  {product.discountPrice ? (
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{product.discountPrice}</span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{product.price}</span>
                  )}
                </div>
                <Link to={`/products/${product._id}`} className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors">
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
