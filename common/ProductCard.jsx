import React from "react";
import Script from "next/script";
import Link from "next/link";

import ButtonFilled from "./ButtonFilled";
import dynamic from "next/dynamic";
import { HiStar } from "react-icons/hi2";
import { HiShoppingCart } from "react-icons/hi";
const LazyComponent = dynamic(() => import("../common/LazyComponent"));

const ProductCard = (props) => {
  const {
    id,
    img,
    title,
    price,
    rating,
    category,
    addProduct = () => {},
  } = props;
  return (
    <>
      <div
        key={id}
        className="z-10 grid w-full max-w-md gap-2 p-4 text-left transition-transform duration-200 ease-in-out border-2 border-blue-400 rounded-md h-max animate-moveUp bg-natural3 hover:scale-105"
      >
        <Link href={`/product/${id}`}  className="">
          <div>
            <LazyComponent img={img} />
            <div className="z-20 pt-3 text-natural2">
              <h2 className="mt-2 text-sm font-semibold uppercase">
                {category}
              </h2>
              <div>
                <h2 className="text-sm font-medium line-clamp-1 sm:text-base">
                  {title}
                </h2>
              </div>
              <div className="flex items-center justify-between gap-4 py-2">
                <h2>
                  <span className="text-xl font-bold text-primary">
                    $ {price}
                  </span>
                </h2>
                <p className="flex gap-2 text-base">
                  <HiStar className="text-xl font-bold text-yellow-500" />
                  <span className="text-base font-bold text-nutral2">
                    {rating?.rate}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </Link>
        <div className="flex items-center justify-between w-full gap-2">
          <ButtonFilled
            btnType="button"
            btnLebel="add to cart"
            // onClick={addProduct}
            classNames="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-primary bg-transparent py-2 text-sm font-bold capitalize text-primary drop-shadow-lg transition-all duration-200 ease-in-out hover:border-transparent hover:bg-nutral3 hover:text-primary hover:drop-shadow-md"
          >
            <span>
              <HiShoppingCart className="text-2xl text-primary" />
            </span>
          </ButtonFilled>
        </div>
      </div>
    </>
  );
};

export default ProductCard;
