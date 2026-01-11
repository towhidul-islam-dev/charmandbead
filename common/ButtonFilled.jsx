import React from "react";
import PropTypes from "prop-types";
const ButtonFilled = (props) => {
    const {btnLebel,classNames,onClick,children,btnType} = props;
  return (
    <>
      <button
        type={btnType}
        className={classNames}
        onClick={onClick}
      >
        {children}
        {btnLebel}
      </button>
    </>
  );
};
ButtonFilled.propTypes = {
    btnLebel : PropTypes.string,
    classNames : PropTypes.string,
    onClick : PropTypes.func,
    btnType : PropTypes.string
}

export default ButtonFilled;
