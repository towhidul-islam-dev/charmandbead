"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  MapPin,
  Home,
  Phone,
  User,
  Save,
  Trash2,
  Truck,
  Building2,
  Plus,
  Edit3,
  Star,
  X,
  ShieldCheck,
  ChevronDown,
  Check,
  Search,
  ArrowLeft,
  ShoppingBag,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import {
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/actions/userActions";
import AddressDeleteModal from "@/components/AddressDeleteModal";

// 🟢 INSIDE DHAKA CITY CORE + SAVAR THANAS (৳80 RATE)
const INSIDE_DHAKA_THANAS = [
  "Adabor",
  "Azimpur",
  "Badda",
  "Banani",
  "Banglamotor",
  "Baridhara",
  "Bashundhara",
  "Cantonment",
  "Dhanmondi",
  "Farmgate",
  "Gulshan",
  "Hazaribagh",
  "Jatrabari",
  "Kafrul",
  "Kalabagan",
  "Khilgaon",
  "Khilkhet",
  "Kotwali",
  "Lalbagh",
  "Mirpur",
  "Mohakhali",
  "Mohammadpur",
  "Motijheel",
  "New Market",
  "Pallabi",
  "Paltan",
  "Ramna",
  "Rampura",
  "Sabujbagh",
  "Savar",
  "Tejgaon",
  "Uttara",
  "Uttarkhan",
  "Dakshinkhan",
];

// 🟡 REMAINING SUB-URBAN / OUTER THANAS (৳130 RATE)
const DHAKA_SUBURBAN_THANAS = ["Dhamrai", "Keraniganj", "Nawabganj", "Dohar"];

// 🟢 OTHER MAJOR DISTRICTS (৳130 RATE)
const OTHER_DISTRICTS = [
  "Gazipur",
  "Narayanganj",
  "Munshiganj",
  "Manikganj",
  "Narsingdi",
  "Chittagong",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barisal",
  "Rangpur",
  "Mymensingh",
  "Comilla",
  "Cox's Bazar",
  "Other Outside Dhaka",
];

// 🎨 SEARCHABLE CUSTOM BRAND DROPDOWN DRAWER COMPONENT
function BrandSelectDrawer({
  label,
  icon: Icon,
  value,
  options,
  onChange,
  placeholder = "Select option",
  searchable = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Filter options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options;

    const query = searchQuery.toLowerCase().trim();
    const result = [];
    let currentHeader = null;

    options.forEach((opt) => {
      if (typeof opt === "object" && opt.isHeader) {
        currentHeader = opt;
      } else {
        const itemText = typeof opt === "object" ? opt.label : opt;
        if (itemText.toLowerCase().includes(query)) {
          if (currentHeader && !result.includes(currentHeader)) {
            result.push(currentHeader);
          }
          result.push(opt);
        }
      }
    });

    return result;
  }, [options, searchQuery, searchable]);

  return (
    <div className="flex flex-col gap-1.5 relative" ref={dropdownRef}>
      <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
        {label}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (isOpen) setSearchQuery("");
        }}
        className={`w-full h-12 pl-11 pr-4 bg-gray-50/80 rounded-2xl border text-left font-bold text-xs flex items-center justify-between transition-all duration-200 cursor-pointer relative ${
          isOpen
            ? "border-[#EA638C] ring-4 ring-[#FBB6E6]/30 bg-white"
            : "border-gray-100 hover:border-[#EA638C]/40 hover:bg-white"
        }`}
      >
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none flex items-center justify-center">
          <Icon size={16} />
        </span>
        <span className="text-[#3E442B] truncate leading-none">
          {value || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-[#EA638C] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Floating Option Drawer */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-[100%] mt-1.5 max-h-64 overflow-hidden bg-white/95 backdrop-blur-md rounded-2xl border border-[#FBB6E6]/60 shadow-xl shadow-[#3E442B]/10 p-2 flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Search Box inside Dropdown */}
          {searchable && (
            <div className="relative mb-1">
              <Search
                size={14}
                className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search area or district..."
                className="w-full h-9 pl-9 pr-3 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:border-[#EA638C] text-xs font-semibold text-[#3E442B]"
              />
            </div>
          )}

          {/* List Options */}
          <div className="overflow-y-auto max-h-48 space-y-1 pr-0.5">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-xs font-semibold text-center text-gray-400">
                No matching area found
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isGroup = typeof opt === "object" && opt.isHeader;
                if (isGroup) {
                  return (
                    <div
                      key={`header-${idx}`}
                      className="px-3 py-1.5 text-[10px] font-black uppercase text-[#EA638C] bg-[#FBB6E6]/10 rounded-xl tracking-wider sticky top-0 backdrop-blur-md"
                    >
                      {opt.label}
                    </div>
                  );
                }

                const itemValue = typeof opt === "object" ? opt.value : opt;
                const itemText = typeof opt === "object" ? opt.label : opt;
                const isSelected = value === itemValue;

                return (
                  <button
                    key={itemValue}
                    type="button"
                    onClick={() => {
                      onChange(itemValue);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-[#3E442B] text-white shadow-md shadow-[#3E442B]/20"
                        : "text-[#3E442B] hover:bg-[#FBB6E6]/20 hover:text-[#EA638C]"
                    }`}
                  >
                    <span>{itemText}</span>
                    {isSelected && (
                      <Check size={14} className="text-[#EA638C]" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddressPageClient({ initialData }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 🟢 Parse checkout query parameters
  const callbackUrl = searchParams.get("callbackUrl");
  const autoAdd = searchParams.get("autoAdd");

  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);

  const addresses = initialData?.addresses || [];
  const [isEditing, setIsEditing] = useState(false);
  const [activeAddressId, setActiveAddressId] = useState(null);

  // Form Fields State
  const [label, setLabel] = useState("Home");
  const [selectedDistrict, setSelectedDistrict] = useState("Dhaka");
  const [selectedThana, setSelectedThana] = useState("Dhanmondi");
  const [street, setStreet] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phone, setPhone] = useState(initialData?.address?.phone || "");
  const [name, setName] = useState(initialData?.name || "");

  // 🟢 Automatically open form if redirected from checkout with autoAdd=true
  useEffect(() => {
    if (autoAdd === "true") {
      handleAddNewClick();
    }
  }, [autoAdd]);

  // 🚚 Delivery Fee Calculation (Savar included in Inside Dhaka)
  const deliveryCharge = useMemo(() => {
    if (selectedDistrict !== "Dhaka") return 130;
    const isSuburban = DHAKA_SUBURBAN_THANAS.some(
      (t) => t.toLowerCase() === selectedThana.toLowerCase(),
    );
    return isSuburban ? 130 : 80;
  }, [selectedDistrict, selectedThana]);

  function handleAddNewClick() {
    setActiveAddressId(null);
    setLabel("Home");
    setSelectedDistrict("Dhaka");
    setSelectedThana("Dhanmondi");
    setStreet("");
    setZipCode("");
    setIsEditing(true);
  }

  function handleEditClick(addr) {
    setActiveAddressId(addr._id);
    setLabel(addr.label || "Home");
    setStreet(addr.street || "");
    setZipCode(addr.zipCode || "");
    setName(addr.fullName || initialData.name);
    setPhone(addr.phone || "");

    const cityText = addr.city || "";
    const isOut = OTHER_DISTRICTS.some((d) =>
      cityText.toLowerCase().includes(d.toLowerCase()),
    );

    if (isOut) {
      const foundDist =
        OTHER_DISTRICTS.find((d) =>
          cityText.toLowerCase().includes(d.toLowerCase()),
        ) || "Gazipur";
      setSelectedDistrict(foundDist);
      setSelectedThana(addr.thana || `${foundDist} Sadar`);
    } else {
      setSelectedDistrict("Dhaka");
      const foundThana =
        [...INSIDE_DHAKA_THANAS, ...DHAKA_SUBURBAN_THANAS].find((t) =>
          cityText.toLowerCase().includes(t.toLowerCase()),
        ) || "Dhanmondi";
      setSelectedThana(foundThana);
    }

    setIsEditing(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);

      if (activeAddressId) formData.set("addressId", activeAddressId);
      formData.set("label", label);
      formData.set("name", name);
      formData.set("fullName", name);
      formData.set("phone", phone);
      formData.set("street", street);
      formData.set("zipCode", zipCode);
      formData.set("district", selectedDistrict);
      formData.set("thana", selectedThana);

      const formattedCity =
        selectedDistrict === "Dhaka"
          ? `${selectedThana}, Dhaka`
          : `${selectedThana}, ${selectedDistrict}`;

      formData.set("city", formattedCity);
      formData.set("deliveryCharge", deliveryCharge);

      const result = await updateAddress(formData);

      if (result.success) {
        toast.success(
          activeAddressId ? "Address updated!" : "New address saved!",
        );
        setIsEditing(false);

        // 🟢 IF REDIRECTED FROM CHECKOUT, JUMP BACK TO CHECKOUT AUTOMATICALLY
        if (callbackUrl) {
          router.push(callbackUrl);
        } else {
          router.refresh();
        }
      } else {
        toast.error(result.error || "Failed to save address");
      }
    } catch (err) {
      console.error("Save Error:", err);
      toast.error("An error occurred while saving.");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmDelete() {
    try {
      setIsDeleting(true);
      const result = await deleteAddress(addressToDelete);
      if (result.success) {
        toast.success("Address removed");
        setIsModalOpen(false);
        setAddressToDelete(null);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete");
      }
    } catch (error) {
      toast.error("An error occurred during deletion");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSetDefault(id) {
    const result = await setDefaultAddress(id);
    if (result.success) {
      toast.success("Primary address set");
      router.refresh();
    } else {
      toast.error("Failed to update primary address");
    }
  }

  const labelOptions = ["Home", "Office", "Other"];
  const districtOptions = ["Dhaka", ...OTHER_DISTRICTS];

  const thanaOptions = useMemo(() => {
    if (selectedDistrict !== "Dhaka") return null;
    return [
      { isHeader: true, label: "Inside Dhaka City & Savar (৳80 Rate)" },
      ...INSIDE_DHAKA_THANAS,
      { isHeader: true, label: "Sub-urban / Outer Dhaka (৳130 Rate)" },
      ...DHAKA_SUBURBAN_THANAS,
    ];
  }, [selectedDistrict]);

  return (
    <div className="max-w-2xl px-4 py-8 mx-auto sm:py-12">
      <AddressDeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />

{/* 🟢 RETURN TO CHECKOUT BANNER (Always available for convenience) */}
      {callbackUrl && (
        <div className="mb-6 p-4 bg-gradient-to-r from-[#FBB6E6]/25 to-white rounded-2xl border border-[#EA638C]/30 flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-[#EA638C]" size={18} />
            <span className="text-xs font-bold text-[#3E442B]">
              Completing your order?
            </span>
          </div>
          <button
            type="button"
            onClick={() => router.push(callbackUrl)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3E442B] hover:bg-[#EA638C] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft size={14} /> Return to Checkout
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 mb-8 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#3E442B]">
            Saved Addresses
          </h1>
          <p className="text-xs font-semibold text-gray-400 mt-0.5">
            Manage your delivery destinations and shipping preferences
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={handleAddNewClick}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#EA638C] hover:bg-[#3E442B] text-white rounded-2xl text-xs font-bold tracking-wider transition-all duration-200 shadow-lg shadow-[#EA638C]/20 active:scale-95 cursor-pointer"
          >
            <Plus size={16} /> Add Address
          </button>
        )}
      </div>

      {/* Address List View */}
      {!isEditing ? (
        <div className="space-y-4">
          {addresses.length === 0 ? (
            <div className="p-8 text-center bg-white border border-gray-100 shadow-sm sm:p-12 rounded-3xl">
              <div className="w-14 h-14 mx-auto mb-4 bg-[#FBB6E6]/20 rounded-2xl flex items-center justify-center text-[#EA638C]">
                <MapPin size={26} />
              </div>
              <h3 className="text-base font-bold text-[#3E442B]">
                No saved addresses yet
              </h3>
              <p className="max-w-xs mx-auto mt-1 text-xs text-gray-400">
                Add a shipping address to enjoy faster checkout on your orders.
              </p>
              <button
                onClick={handleAddNewClick}
                className="mt-5 px-6 py-3 bg-[#3E442B] text-white rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-[#EA638C] transition-all shadow-md cursor-pointer"
              >
                Add New Location
              </button>
            </div>
          ) : (
            addresses.map((addr) => (
              <div
                key={addr._id}
                className={`group relative p-5 sm:p-6 rounded-3xl border transition-all duration-200 ${
                  addr.isDefault
                    ? "bg-gradient-to-br from-[#FBB6E6]/10 to-white border-[#EA638C]/30 shadow-md shadow-[#EA638C]/5"
                    : "bg-white border-gray-100 hover:border-gray-200 shadow-sm"
                }`}
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 bg-[#3E442B] text-white text-[10px] font-bold rounded-xl tracking-wider uppercase">
                        {addr.label || "Home"}
                      </span>
                      {addr.isDefault ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#EA638C] text-white text-[10px] font-bold rounded-xl tracking-wider uppercase">
                          <Star size={10} fill="currentColor" /> Primary
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetDefault(addr._id)}
                          className="text-[10px] font-bold text-gray-400 hover:text-[#EA638C] transition-colors cursor-pointer"
                        >
                          Set as primary
                        </button>
                      )}
                      <span className="ml-auto sm:ml-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#3E442B] bg-gray-50 px-2.5 py-1 rounded-xl">
                        <Truck size={12} className="text-[#EA638C]" /> ৳
                        {addr.deliveryCharge || 80} DC
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-[#3E442B]">
                        {addr.fullName || initialData.name}
                      </h4>
                      <p className="mt-1 text-xs font-medium leading-relaxed text-gray-500">
                        {addr.street}
                      </p>
                      <p className="text-xs font-semibold text-[#EA638C] mt-0.5">
                        {addr.city} {addr.zipCode && `• ${addr.zipCode}`}
                      </p>
                    </div>

                    <p className="flex items-center gap-1.5 text-xs text-gray-400 font-medium pt-1">
                      <Phone size={13} className="text-gray-300" /> {addr.phone}
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 sm:flex-col sm:pt-0 sm:border-t-0">
                    <button
                      onClick={() => handleEditClick(addr)}
                      className="flex-1 sm:flex-initial p-2.5 bg-gray-50 hover:bg-[#3E442B] hover:text-white text-gray-600 rounded-xl transition-all text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                      title="Edit Address"
                    >
                      <Edit3 size={15} />{" "}
                      <span className="sm:hidden">Edit</span>
                    </button>
                    <button
                      onClick={() => {
                        setAddressToDelete(addr._id);
                        setIsModalOpen(true);
                      }}
                      className="p-2.5 bg-gray-50 hover:bg-red-50 hover:text-red-500 text-gray-400 rounded-xl transition-all cursor-pointer"
                      title="Delete Address"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Form View with Searchable Brand Drawers */
        <form
          onSubmit={handleSave}
          className="p-6 space-y-6 bg-white border border-gray-100 shadow-xl sm:p-8 rounded-3xl"
        >
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-[#3E442B]">
              {activeAddressId ? "Edit Address" : "New Address Details"}
            </h2>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-2 text-gray-400 transition-all rounded-full cursor-pointer hover:text-black hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <BrandSelectDrawer
              label="Label"
              icon={Home}
              value={label}
              options={labelOptions}
              onChange={setLabel}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none flex items-center justify-center">
                  <User size={16} />
                </span>
                <input
                  name="fullName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  className="w-full h-12 pl-11 pr-4 bg-gray-50/80 rounded-2xl border border-gray-100 outline-none focus:ring-4 focus:ring-[#FBB6E6]/30 focus:border-[#EA638C] font-bold text-xs text-[#3E442B] transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none flex items-center justify-center">
                  <Phone size={16} />
                </span>
                <input
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="text"
                  placeholder="017XXXXXXXX"
                  className="w-full h-12 pl-11 pr-4 bg-gray-50/80 rounded-2xl border border-gray-100 outline-none focus:ring-4 focus:ring-[#FBB6E6]/30 focus:border-[#EA638C] font-bold text-xs text-[#3E442B] transition-all"
                  required
                />
              </div>
            </div>

            {/* Searchable District Drawer */}
            <BrandSelectDrawer
              label="District"
              icon={Building2}
              value={selectedDistrict}
              options={districtOptions}
              searchable={true}
              onChange={(val) => {
                setSelectedDistrict(val);
                if (val === "Dhaka") {
                  setSelectedThana("Dhanmondi");
                } else {
                  setSelectedThana(`${val} Sadar`);
                }
              }}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Searchable Thana Drawer */}
            {selectedDistrict === "Dhaka" ? (
              <BrandSelectDrawer
                label="Area / Thana"
                icon={MapPin}
                value={selectedThana}
                options={thanaOptions}
                searchable={true}
                onChange={setSelectedThana}
              />
            ) : (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                  Area / Thana
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none flex items-center justify-center">
                    <MapPin size={16} />
                  </span>
                  <input
                    type="text"
                    value={selectedThana}
                    onChange={(e) => setSelectedThana(e.target.value)}
                    placeholder="e.g. Sadar"
                    className="w-full h-12 pl-11 pr-4 bg-gray-50/80 rounded-2xl border border-gray-100 outline-none focus:ring-4 focus:ring-[#FBB6E6]/30 focus:border-[#EA638C] font-bold text-xs text-[#3E442B] transition-all"
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
                Zip Code
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none flex items-center justify-center">
                  <MapPin size={16} />
                </span>
                <input
                  name="zipCode"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  type="text"
                  placeholder="1209"
                  className="w-full h-12 pl-11 pr-4 bg-gray-50/80 rounded-2xl border border-gray-100 outline-none focus:ring-4 focus:ring-[#FBB6E6]/30 focus:border-[#EA638C] font-bold text-xs text-[#3E442B] transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">
              Street Address / House Details
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-4 text-gray-300 pointer-events-none flex items-center justify-center">
                <Home size={16} />
              </span>
              <textarea
                name="street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                rows="2"
                placeholder="House #, Road #, Sector or Area details..."
                className="w-full p-3 pl-11 bg-gray-50/80 rounded-2xl border border-gray-100 outline-none focus:ring-4 focus:ring-[#FBB6E6]/30 focus:border-[#EA638C] font-bold text-xs text-[#3E442B] transition-all"
                required
              />
            </div>
          </div>

          {/* Rate Summary Strip */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#FBB6E6]/20 to-transparent rounded-2xl border border-[#FBB6E6]/40">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-[#EA638C]" size={18} />
              <span className="text-xs font-bold text-[#3E442B]">
                {deliveryCharge === 80
                  ? "Inside Dhaka City & Savar Rate"
                  : "Sub-urban / Outside Dhaka Rate"}
              </span>
            </div>
            <span className="text-lg font-black text-[#EA638C]">
              ৳{deliveryCharge}
            </span>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="w-1/3 py-3.5 bg-gray-100 hover:bg-gray-200 text-[#3E442B] rounded-2xl font-bold text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              type="submit"
              className="w-2/3 py-3.5 bg-[#3E442B] hover:bg-[#EA638C] text-white rounded-2xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap px-4"
            >
              {loading ? (
                "Saving..."
              ) : (
                <>
                  <Save size={16} /> Save Location
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}