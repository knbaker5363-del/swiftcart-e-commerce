import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

const MyOrdersButton = () => {
  return (
    <div className="container py-2">
      <Link to="/my-orders" className="block">
        <div className="w-full p-3 rounded-xl bg-black hover:bg-black/90 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer">
          <div className="flex items-center justify-center gap-2">
            <Package className="h-5 w-5 text-white" />
            <span className="text-base font-bold text-white">طلباتي</span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MyOrdersButton;
