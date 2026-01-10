import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">BookMyShow</h3>
            <p className="text-gray-400">
              Your one-stop destination for booking movie tickets online.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Movies</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/movies" className="hover:text-white">Browse Movies</Link></li>
              <li><Link to="/movies" className="hover:text-white">Upcoming Releases</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/bookings" className="hover:text-white">My Bookings</Link></li>
              <li><a href="#" className="hover:text-white">Help Center</a></li>
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} BookMyShow Clone. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
