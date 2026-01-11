import React from "react";
import Image from "next/image";
import FavoriteBtn from "@/app/product/components/FavoriteBtn";

const LazyComponent = ({ img }) => {
    return (
        <>
            <div className="grid max-w-xs overflow-hidden place-items-center">
                <Image
                    className="w-full aspect-square"
                    src={img}
                    alt=""
                    width={320}
                    height={120}
                />
            </div>
        </>
    );
};

export default LazyComponent;
