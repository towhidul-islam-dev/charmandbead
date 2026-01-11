import React from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";

const options = [
  { value: "category", label: "category" },
  { value: "price", label: "price" },
  { value: "rating", label: "rating" },
];

const SortData = ({ value }) => {
  const router = useRouter();
  const handleSelectChange = (selectedOption) => {
    router.push(`/product?Sort=${selectedOption.value}`)
  };
  return (
    <Select
      options={options}
      onChange={handleSelectChange}
      value={value}
      isSearchable
      placeholder="Sort"
      className="z-10 w-full capitalize border-2 border-white rounded-md focus:outline-none focus:border-blue-500"
    />
  );
};

export default SortData;
