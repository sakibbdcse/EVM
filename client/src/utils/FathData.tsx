import axios, { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { BASE_URL } from "../config/BaseUrl";
type dataFetcherProps = {
  endpoint: string;
};
function useDataFetcher({ endpoint }: dataFetcherProps) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(`${BASE_URL}${endpoint}`);
        setData(response?.data?.result || response?.data);
      } catch (err) {
        const axiosError = err as AxiosError;
        setError(axiosError.message);
        console.error("Error fetching data:", axiosError);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [endpoint]);
  return { data, loading, error };
}
export default useDataFetcher;
