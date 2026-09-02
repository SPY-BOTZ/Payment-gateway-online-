import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { ShieldCheck, CheckCircle2, Lock } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch product details
    setProduct({
        _id: id,
        name: "Premium Options Trading Signals",
        description: "Get real-time options trading signals directly in our exclusive Telegram channel. High accuracy, detailed analysis, and dedicated support.",
        price: 4999,
        discountPrice: 2499,
        category: "Trading",
        features: [
            "Daily Nifty & BankNifty Signals",
            "Real-time Entry & Exit alerts",
            "Risk Management Guide",
            "Private Telegram Group Access"
        ]
    });
  }, [id]);

  const handleBuy = async () => {
    if (!user) {
        navigate("/login");
        return;
    }

    setLoading(true);
    try {
        // Step 1: Create Order
        // const res = await axios.post("/api/payment/create-order", { productId: id });
        // const { razorpayOrderId, amount, keyId } = res.data;
        
        // Process successful payment flow
        alert("In a real environment, Razorpay checkout would open here. Assuming payment successful for demonstration.");
        
        // Normally:
        /*
        const options = {
            key: keyId,
            amount: amount,
            currency: "INR",
            name: "SPY Botz",
            description: product.name,
            order_id: razorpayOrderId,
            handler: function (response: any) {
                // Handle success, backend webhook will verify
                navigate("/dashboard/orders");
            },
            prefill: {
                name: user.username,
            }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        */
        navigate("/dashboard/orders");
    } catch (err) {
        console.error(err);
        alert("Failed to initiate payment.");
    } finally {
        setLoading(false);
    }
  };

  if (!product) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 w-full flex flex-col md:flex-row gap-12">
        <div className="flex-1 space-y-8">
            <div>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold tracking-wider text-sm uppercase">{product.category}</span>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mt-2 mb-4 leading-tight">{product.name}</h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">{product.description}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">What's included</h3>
                <ul className="space-y-4">
                    {product.features?.map((f: string, i: number) => (
                        <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                            <span>{f}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        <div className="w-full md:w-[400px] shrink-0">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl sticky top-24">
                <div className="mb-6">
                    {product.discountPrice ? (
                        <div className="flex flex-col">
                            <span className="text-gray-400 line-through text-lg font-medium">₹{product.price}</span>
                            <span className="text-5xl font-extrabold text-gray-900 dark:text-white">₹{product.discountPrice}</span>
                        </div>
                    ) : (
                        <span className="text-5xl font-extrabold text-gray-900 dark:text-white">₹{product.price}</span>
                    )}
                    <p className="text-gray-500 mt-2">Lifetime access (or valid duration)</p>
                </div>

                <button 
                    onClick={handleBuy} 
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-indigo-500/30 flex items-center justify-center gap-2 mb-4 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? "Processing..." : "Buy Now"}
                </button>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium bg-gray-50 dark:bg-gray-900/50 py-3 rounded-lg border border-gray-100 dark:border-gray-800">
                    <Lock className="w-4 h-4" />
                    Secure Razorpay Payment
                </div>
            </div>
        </div>
    </div>
  );
}
