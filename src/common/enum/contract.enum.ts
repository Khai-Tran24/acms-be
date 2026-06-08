// export enum AuctionStatus {
//   MOI = 'MOI', // vừa tạo hồ sơ
//   DANG_NIEM_YET = 'DANG_NIEM_YET', // đang công khai/niêm yết
//   DANG_NHAN_HO_SO = 'DANG_NHAN_HO_SO', // đang tiếp nhận hồ sơ đăng ký
//   DONG_NHAN_HO_SO = 'DONG_NHAN_HO_SO', // hết hạn nhận hồ sơ
//   SAP_DAU_GIA = 'SAP_DAU_GIA', // đủ điều kiện, chờ mở phiên
//   DANG_DAU_GIA = 'DANG_DAU_GIA', // đang diễn ra phiên đấu giá
//   DA_DAU_GIA = 'DA_DAU_GIA', // phiên đã kết thúc
//   DA_CO_KET_QUA = 'DA_CO_KET_QUA', // xác định người trúng
//   KHONG_THANH = 'KHONG_THANH', // không có người tham gia / không đủ điều kiện / không có người trả giá hợp lệ
//   HUY_KET_QUA = 'HUY_KET_QUA', // hủy kết quả đấu giá
//   TAM_DUNG = 'TAM_DUNG', // tạm dừng theo quyết định nghiệp vụ
//   HUY_HO_SO = 'HUY_HO_SO', // hủy hồ sơ trước khi tổ chức
//   THANH_LY = 'THANH_LY', // kết thúc toàn bộ
// }

export enum ContractStatus {
  MOI = 'MOI',
  DANG_THUC_HIEN = 'DANG_THUC_HIEN',
  HET_HAN = 'HET_HAN',
  DANG_THANH_LY = 'DANG_THANH_LY',
  THANH_LY = 'THANH_LY',
  TAM_DUNG = 'TAM_DUNG',
  HUY = 'HUY',
}
