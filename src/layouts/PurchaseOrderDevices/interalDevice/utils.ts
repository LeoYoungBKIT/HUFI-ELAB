export const ObjAccept: { [key in string]: string } = {
  "Cán bộ phụ trách PTN": "Chờ xác nhận cấp CBPTN phụ trách PTN",
};

export const exportLabStatusEditing = "Chờ chỉnh sửa";
export const doneStatus = "Đã xác nhận";

export const matchAccept = (key: string, value: string) => {
  return ObjAccept[key] === value;
};

export const nextStatus: { [key in string]: string } = {
  "Chờ chỉnh sửa": "Chờ xác nhận cấp CBPTN phụ trách PTN",
  "Chờ xác nhận cấp CBPTN phụ trách PTN": "Đã xác nhận",
};
