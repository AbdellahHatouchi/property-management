import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

export function usePagination(apiPath: string) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize pagination from URL params or fallback to default values
  const [pagination, setPagination] = useState({
    pageSize: Number(searchParams.get("pageSize")) || 5,
    pageIndex: Number(searchParams.get("pageIndex")) || 0,
  });

  const { pageSize, pageIndex } = pagination;

  // State to hold fetched data and loading/error states
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch data based on pagination state and API path
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(apiPath, {
        params: {
          pageSize,
          pageIndex,
        },
      });

      setData(response.data.data);   // Assuming the API returns data in `data` field
      setTotal(response.data.total); // Assuming the API returns total count in `total` field
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [apiPath, pageIndex, pageSize, router]);

  // Update search params in the URL whenever pagination state changes
  useEffect(() => {
    const newSearchParams = new URLSearchParams(window.location.search);

    newSearchParams.set("pageSize", String(pageSize));
    newSearchParams.set("pageIndex", String(pageIndex));

    const searchParamsString = newSearchParams.toString();
    router.push(`?${searchParamsString}`, { scroll: false });

    // Fetch the data when pagination changes
    fetchData();
  }, [pageSize, pageIndex, router, apiPath, fetchData]);

  return {
    limit: pageSize,
    onPaginationChange: setPagination,
    pagination,
    skip: pageSize * pageIndex,
    data,      // The fetched data
    total,     // Total number of items (useful for total pages calculation)
    loading,   // Loading state for UI handling
    error,     // Error state if something goes wrong during fetching
  };
}
