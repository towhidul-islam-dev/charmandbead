export const buttonData = ["All","men's clothing", "jewelery","electronics","women's clothing"];
if (typeof window !== 'undefined') {
    localStorage.setItem("buttonData", JSON.stringify(buttonData));
  }