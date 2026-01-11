import React, { useContext, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AiOutlineSearch } from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";
import CartContextProvider from "../Context/CartContext";

const SearchButton = () => {
  const { searchProduct } = useContext(CartContextProvider);
  const [searchProducts, setSearchProducts] = searchProduct;
  const [product, setsProduct] = useState([]);
  const focusSearch = useRef(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const fetchData = async () => {
    const res = await fetch("https://fakestoreapi.com/products");
    const data = await res.json();
    if (!res.ok) throw Error("Url might be not found.");

    setsProduct([...data]);
  };

  const handleChange = (e) => {
    const { value } = e.target;
    setSearchInput(value);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchInput) {
      setSearchValue(searchInput);
      setSearchInput("");
    } else {
      console.log("Please provide your query.");
    }
  };
  const checkProductIsAvailable = () => {
    const findSomeProductStatus = product.filter((item) =>
      item.title.toLowerCase().includes(`${searchInput}`)
    );
    setSearchProducts(findSomeProductStatus);
    return findSomeProductStatus;
  };

  useEffect(() => {
    checkProductIsAvailable();
  }, [searchInput]);


  useEffect(() => {
    focusSearch.current.focus();
  }, [searchInput]);
  useEffect(() => {
    fetchData();
  },[])

  const deleteSearchText = () => {
    setSearchInput("");
  };

  return (
    <div className="flex items-center justify-between overflow-hidden border rounded-full border-accent">
      <form
        className="flex items-center justify-center"
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          id="searchInput"
          ref={focusSearch}
          name="search"
          value={searchInput}
          onChange={handleChange}
          placeholder="search"
          className="w-full pl-4 font-bold bg-transparent border-none outline-none placeholder:capitalize placeholder:text-nutral2 lg:w-full"
        ></input>
        <div
          className={`flex items-center justify-center px-2 transition-all duration-150 ease-in-out ${
            searchInput.search ? "visible" : "collapse"
          }`}
        >
          <button type="submit" onClick={deleteSearchText}>
            <span className="text-xl font-bold">
              <RxCross1 />
            </span>
          </button>
        </div>
      </form>
      <div className="h-full px-2 py-2 font-extrabold transition-all duration-200 ease-in-out bg-transparent border-l cursor-pointer group border-accent hover:bg-accent hover:text-baseClr1 lg:px-5">
        <span className="text-xl font-bold">
          <AiOutlineSearch className="group-hover:animate-spin" />
        </span>
      </div>
    </div>
  );
};

export default SearchButton;
