"use client";
import { useContext, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "./ProductCard";
import Link from "next/link";
import ButtonFilled from "./ButtonFilled";
import { HiShoppingCart } from "react-icons/hi";
import FeatureProductCard from "./FeatureProductCard";

const FeatureProduct = () => {
  const params = useSearchParams();
  const sortValue = params.get("sort");

  // !! Fetching Data from API.
  const fetchData = async () => {
    const res = await fetch("https://api.escuelajs.co/api/v1/products");
    const data = await res.json();
    if (!res.ok) throw Error("Url might be not found.");

    return data;
  };

  // ?? Setting up the Data using TanStack Query.
  const { data, isLoading, error } = useQuery({
    queryKey: ["productData"],
    queryFn: fetchData,
  });

  console.log(data);
  return (
    <>
      {data?.map((product) => {
        return (
          <div key={product.id}>
            <img src={`/${product?.images[0]}`} alt={product.titile} />
          <h2>{product.title}</h2>

            {/* <ProductCard
              key={product?.id}
              id={product?.id}
              title={product?.title}
              category={product?.category}
              price={product?.price}
            /> */}
          </div>
        );
      })}
    </>
  );
};

export default FeatureProduct;
