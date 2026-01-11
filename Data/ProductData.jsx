import React from 'react'
import { useQuery } from '@tanstack/react-query'

export const useProductData = () => {
    const fetchData = async () => {
        const res = await fetch("https://fakestoreapi.com/products");
        const data = await res.json();
        if (!res.ok) throw new Error("Url might be not found.");
    
        return data;
      };
    
      const productData = useQuery({
        queryKey: ["productData"],
        queryFn: fetchData,
      });
  return productData
}