import React from "react";

const ButtonOutlined = ({btnLabel, btnType}) => {
  return (
    <>
      <button
        type={btnType}
        className="capitalize w-full font-bold text-sm text-nutral2 border-2 border-nutral2 bg-transparent cursor-pointer py-2 px-4 rounded-full hover:drop-shadow-md transition-all duration-200 ease-in-out hover:text-nutral3 hover:border-transparent hover:bg-primary"
      >
        {btnLabel}
      </button>
    </>
  );
};
export default ButtonOutlined;


