import React from "react";
import ButtonFilled from "./ButtonFilled";
import { GiConfirmed } from "react-icons/gi";
import { RxCross2 } from "react-icons/rx";
import { toast } from "react-hot-toast";

function Modal(props) {
    const { setModalIsOpen, setCartValue, setUniqueCart } = props;

    const handleModal = () => {
        setModalIsOpen(false);
    };
    const handleRemoveAllItems = () => {
        try {
            setCartValue([]);
            setUniqueCart([]);
            setModalIsOpen(false);
            toast.success("All products are deleted");
        } catch (err) {
            toast.error("Something went wrong");
        }
    };
    return (
        <div className="animate-moveUp">
            <div className="w-full max-w-xs rounded-md border-2 border-primary/70 bg-primary/30 p-4 shadow-md">
                <div className="flex flex-col gap-8">
                    <div className="w-max flex ">
                        <button onClick={handleModal} className="">
                            <span>
                                <RxCross2 className="text-xl font-bold" />
                            </span>
                        </button>
                    </div>
                    <h2 className="text-center shrink-1">
                        Are you sure you want to delete all the products?
                    </h2>
                    <button
                        type="button"
                        onClick={handleRemoveAllItems}
                        className='px-8 py-2 flex items-center justify-center gap-2 capitalize font-semibold cursor-pointer w-full bg-nutral3 text-denger hover:bg-denger rounded-md hover:text-nutral3 transition-all ease-in-out duration-[300ms]'
                    >
                        
                        <GiConfirmed classNames="text-2xl font-bold text-denger mr-4" />
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Modal;
