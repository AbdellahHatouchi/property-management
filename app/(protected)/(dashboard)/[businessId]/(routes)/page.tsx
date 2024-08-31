"use client";
import { Button } from "@/components/ui/button"
import axios from "axios"
import { useState } from "react";


const DashboardPage = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchExpiredRentals = async () => {
      setLoading(true);
      setMessage(null);
      try {
          const response = await fetch('/api/update-rental-status');
          const data = await response.json();

          if (response.ok) {
              setMessage(data.message);
          } else {
              setMessage(`Error: ${data.message}`);
          }
      } catch (error) {
          setMessage(`Error: ${error.message}`);
      } finally {
          setLoading(false);
      }
  };

  return (
      <div className="p-4 max-w-md mx-auto">
          <h1 className="text-xl font-bold mb-4">Test Expired Rentals API</h1>
          <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={fetchExpiredRentals}
              disabled={loading}
          >
              {loading ? 'Loading...' : 'Fetch Expired Rentals'}
          </button>
          {message && (
              <div className="mt-4 p-2 border rounded bg-gray-100">
                  {message}
              </div>
          )}
      </div>
  );
};

export default DashboardPage