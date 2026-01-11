import React from "react";

const TextInputField = (props) => {
  const {
    type = "",
    label = "",
    name = "",
    placeholder = "",
    onChange = () => {},
    onBlur = () => {},
    errors,
    touched,
    values
  } = props;
  return (
    <>
      <div className="text-nutral2">
        <label className="font-bold capitalize lableWidth " htmlFor="password">
          {label}
        </label>
        <div className="relative">
          <input
            type={type}
            name={name}
            onBlur={onBlur}
            onChange={onChange}
            value={values}
            className={
              errors && touched
                ? "border-2 w-full bg-transparent border-denger text-gray-800 py-3 pl-4 placeholder:text-sm text-sm placeholder:capitalize md:py-2"
                : "w-full  py-3 pl-4 placeholder:text-sm text-sm placeholder:capitalize md:py-2"
            }
            placeholder={placeholder}
          />
          {errors && touched && (
            <p className="absolute left-0 text-[10px] capitalize top-full text-denger">
              {errors}
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default TextInputField;
