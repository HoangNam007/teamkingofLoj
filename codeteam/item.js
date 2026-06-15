// Giả lập mảng cơ sở dữ liệu chi tiết trong kho hàng
var kho_chi_tiet = [
    { id: 1, ten: "Apple Macbook Pro M1 2020", gia: "15.500.000 đ", tinh_trang: "Đã sử dụng", dia_chi: "Quận Hà Đông, Hà Nội", sdt: "0912345xxx", nguoi_ban: "Nguyễn Văn A" },
    { id: 2, ten: "Điện thoại iPhone 13 Pro Max 128GB", gia: "18.200.000 đ", tinh_trang: "Mới 99%", dia_chi: "Quận 3, TP.HCM", sdt: "0988888xxx", nguoi_ban: "Trần Thị B" }
];

// Hàm 1: Bung cửa sổ nhỏ xem chi tiết
function mo_xem_nhanh(id_san_pham) {
    // Tìm kiếm thông tin sản phẩm khớp với ID được bấm
    var sp = kho_chi_tiet.find(item => item.id === id_san_pham);
    if (!sp) return;

    var vung_noi_dung = document.getElementById("noi_dung_chi_tiet");
    
    // Đổ toàn bộ thông tin chi tiết, liên hệ vào cấu trúc popup
    vung_noi_dung.innerHTML = `
        <h2 style="color:#333; margin-top:0;">${sp.ten}</h2>
        <p style="color:#ee4d2d; font-size:20px; font-weight:bold;">Giá: ${sp.gia}</p>
        <hr>
        <p><b>Tình trạng:</b> ${sp.tinh_trang}</p>
        <p><b>📍 Vị trí:</b> ${sp.dia_chi}</p>
        <p><b>Người đăng tin:</b> ${sp.nguoi_ban}</p>
        <p><b>📞 Số điện thoại:</b> ${sp.sdt}</p>
        <div style="margin-top:20px; display:flex; gap:10px;">
            <button style="flex:1; background-color:#ffcc00; color:white; border:none; padding:10px; border-radius:5px; cursor:pointer;">Nhắn tin trực tiếp</button>
            <button style="flex:1; background-color:#5cb85c; color:white; border:none; padding:10px; border-radius:5px; cursor:pointer;">Gọi điện ngay</button>
        </div>
    `;

    // Hiển thị cửa sổ lên màn hình
    var modal = document.getElementById("cua_so_chi_tiet");
    modal.style.display = "flex";
}

// Hàm 2: Đóng cửa sổ khi bấm trượt ra vùng nền xám bên ngoài
function dong_cua_so(event) {
    var modal = document.getElementById("cua_so_chi_tiet");
    if (event.target === modal) {
        modal.style.display = "none";
    }
}

// Hàm 3: Xử lý nút Tim (Mẹo: dùng stopPropagation để tránh làm kích hoạt hàm mo_xem_nhanh)
function tu_ong_thich(event, id_san_pham) {
    event.stopPropagation(); // Ngăn chặn sự kiện lan truyền lên thẻ cha .san-pham
    alert("Thưa ngài, đã thêm sản phẩm số " + id_san_pham + " vào danh sách yêu thích!");
}

// Hàm 4: Xử lý nút Giỏ hàng
function them_gio_hang(event, id_san_pham) {
    event.stopPropagation(); // Ngăn chặn sự kiện lan truyền lên thẻ cha .san-pham
    alert("Thưa ngài, đã bỏ sản phẩm số " + id_san_pham + " vào giỏ hàng thành công!");
}