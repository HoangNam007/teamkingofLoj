/* ========================================================================
   PAGE.JS - Logic riêng cho từng trang
   ------------------------------------------------------------------------
   Vai trò: Tự nhận biết đang ở trang nào → chạy code tương ứng
   Phụ thuộc: storage.js, ui.js, auth.js, cart.js
   ======================================================================== */

/* ========================================================================
   ĐIỂM KHỞI ĐẦU - Chạy khi trang load xong
   ======================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // === Chạy cho MỌI trang ===
    capNhatNutAuth();           // Hiện tên user nếu đã login
    capNhatBadgeGioHang();      // Số đếm icon giỏ hàng
    capNhatBadgeYeuThich();     // Số đếm icon yêu thích
    setupModalEvents();         // ESC, click ra ngoài đóng modal
    setupModalActions();        // 3 nút trong modal

    // === Tự động nhận biết đang ở trang nào ===
    const trangHienTai = nhanBietTrang();

    switch (trangHienTai) {
        case 'home':
            khoiTaoTrangChu();
            break;
        case 'product':
            khoiTaoTrangSanPham();
            break;
        case 'cart':
            khoiTaoTrangGioHang();
            break;
        case 'auth':
            khoiTaoTrangTaiKhoan();
            break;
        case 'favorites':
            khoiTaoTrangYeuThich();
            break;
    }
});

/* ========================================================================
   HÀM NHẬN BIẾT TRANG (dựa vào URL)
   ======================================================================== */
function nhanBietTrang() {
    const path = window.location.pathname.toLowerCase();
    const fileName = path.split('/').pop() || 'idea.html';

    if (fileName === '' || fileName === 'idea.html' || fileName === 'index.html') {
        return 'home';
    }
    if (fileName === 'giohang.html') return 'cart';
    if (fileName === 'taikhoan.html') return 'auth';
    if (fileName === 'yeuthich.html') return 'favorites';
    if (['dientu.html', 'phuongtien.html', 'trangphuc.html', 'vatdung.html'].includes(fileName)) {
        return 'product';
    }
    return 'other';
}

/* ========================================================================
   TRANG CHỦ - idea.html
   ======================================================================== */
function khoiTaoTrangChu() {
    setupCardEvents();          // Click card, yêu thích, giỏ hàng
    setupDropdownKhuVuc();      // Dropdown chọn vùng miền
    setupLocDanhMuc();          // Filter danh mục
    setupTimKiem();             // Search box
}

// Filter theo danh mục
function setupLocDanhMuc() {
    const navLinks = document.querySelectorAll('#categoryNav a');
    const cards = document.querySelectorAll('.product-card');
    const sectionTitle = document.getElementById('sectionTitle');

    const tenDanhMuc = {
        all: 'Tin Đăng Nổi Bật Hôm Nay',
        dientu: 'Thiết Bị Điện Tử',
        phuongtien: 'Phương Tiện',
        trangphuc: 'Trang Phục & Phụ Kiện',
        vatdung: 'Vật Dụng Gia Đình'
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Chỉ chặn nếu là link nội bộ (data-cat = "all")
            // Các link khác (dientu.html, phuongtien.html...) cho phép chuyển trang
            const cat = link.dataset.cat;
            if (!cat) return;
            
            e.preventDefault();

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            if (sectionTitle) {
                sectionTitle.textContent = tenDanhMuc[cat] || 'Sản phẩm';
            }

            cards.forEach(card => {
                if (cat === 'all' || card.dataset.cat === cat) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
}

// Tìm kiếm sản phẩm
function setupTimKiem() {
    const searchInput = document.getElementById('searchInput');
    const sectionTitle = document.getElementById('sectionTitle');
    if (!searchInput) return;

    // Nhấn Enter để tìm
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') thucHienTimKiem();
    });

    // Gán hàm cho nút Tìm kiếm
    const btnSearch = document.querySelector('.btn-search');
    if (btnSearch) {
        btnSearch.onclick = thucHienTimKiem;
    }
}

function thucHienTimKiem() {
    const searchInput = document.getElementById('searchInput');
    const sectionTitle = document.getElementById('sectionTitle');
    const cards = document.querySelectorAll('.product-card');
    
    const tuKhoa = searchInput.value.toLowerCase().trim();
    
    cards.forEach(card => {
        const name = (card.dataset.name || '').toLowerCase();
        if (tuKhoa === '' || name.includes(tuKhoa)) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });

    if (sectionTitle) {
        sectionTitle.textContent = tuKhoa 
            ? `Kết quả tìm kiếm: "${tuKhoa}"` 
            : 'Tin Đăng Nổi Bật Hôm Nay';
    }
}

// Hàm global cho onclick="doSearch()" (giữ tương thích)
function doSearch() {
    thucHienTimKiem();
}

/* ========================================================================
   TRANG DANH MỤC (dientu, phuongtien, trangphuc, vatdung)
   ======================================================================== */
function khoiTaoTrangSanPham() {
    setupCardEvents();          // Giống trang chủ
}

/* ========================================================================
   TRANG GIỎ HÀNG - giohang.html
   ======================================================================== */
function khoiTaoTrangGioHang() {
    const notLoggedIn = document.getElementById('notLoggedIn');
    const cartContent = document.getElementById('cartContent');

    if (!dangDangNhap()) {
        // Chưa đăng nhập → hiện thông báo
        if (notLoggedIn) notLoggedIn.style.display = 'block';
        if (cartContent) cartContent.style.display = 'none';
    } else {
        // Đã đăng nhập → hiện giỏ hàng
        if (notLoggedIn) notLoggedIn.style.display = 'none';
        if (cartContent) cartContent.style.display = 'block';
        renderBangGioHang();
    }

    // Gán hàm cho nút thanh toán
    const btnCheckout = document.querySelector('.btn-checkout');
    if (btnCheckout) {
        btnCheckout.onclick = thanhToan;
    }
}

// Hàm global cho onclick="checkout()" (giữ tương thích)
function checkout() {
    thanhToan();
}

/* ========================================================================
   TRANG TÀI KHOẢN - taikhoan.html
   ======================================================================== */
function khoiTaoTrangTaiKhoan() {
    // Nếu đã đăng nhập → hỏi có muốn về trang chủ không
    if (dangDangNhap()) {
        const user = layUserHienTai();
        setTimeout(() => {
            if (confirm(`👋 Chào ${user.name}! Bạn muốn về trang chủ?`)) {
                window.location.href = 'idea.html';
            }
        }, 500);
        return;
    }

    // Gán submit cho form đăng nhập
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', xuLyFormDangNhap);
    }

    // Gán submit cho form đăng ký
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', xuLyFormDangKy);
    }
}

// Các hàm global cho onclick (giữ tương thích với HTML cũ)
function switchToRegister() {
    chuyenSangFormDangKy();
}
function switchToLogin() {
    chuyenSangFormDangNhap();
}
function handleLogin(event) {
    xuLyFormDangNhap(event);
}
function handleRegister(event) {
    xuLyFormDangKy(event);
}

/* ========================================================================
   TRANG YÊU THÍCH - yeuthich.html (sẽ làm sau)
   ======================================================================== */
function khoiTaoTrangYeuThich() {
    renderGridYeuThich();
}

// Render lưới yêu thích (placeholder - làm chi tiết khi có yeuthich.html)
function renderGridYeuThich() {
    const grid = document.getElementById('favGrid');
    if (!grid) return;

    const favorites = layDanhSachYeuThich();

    if (favorites.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align:center; padding:60px; color:#888;">
                <div style="font-size:64px;">💔</div>
                <h2>Chưa có sản phẩm yêu thích</h2>
                <a href="idea.html" class="btn-explore" 
                   style="display:inline-block; padding:12px 24px; background:#ff8a00; color:white; border-radius:8px; text-decoration:none; margin-top:15px;">
                    Khám phá ngay
                </a>
            </div>`;
        return;
    }

    let html = '';
    favorites.forEach(product => {
        html += `
            <div class="product-card" data-id="${product.id}">
                <img src="${product.image}" alt="${product.name}" class="card-img">
                <div class="card-actions">
                    <button class="card-btn btn-heart liked" 
                            onclick="boYeuThichTuGrid(${product.id})">♥</button>
                    <button class="card-btn btn-cart" 
                            onclick="themTuYeuThichVaoGio(${product.id})">🛒</button>
                </div>
                <div class="card-body">
                    <h3>${product.name}</h3>
                    <p class="price">₫${(product.price || 0).toLocaleString()}</p>
                </div>
            </div>`;
    });
    grid.innerHTML = html;
}

// Bỏ yêu thích từ grid (cho yeuthich.html)
function boYeuThichTuGrid(productId) {
    xoaKhoiYeuThich(productId);
    renderGridYeuThich();
}

// Thêm từ yêu thích vào giỏ
function themTuYeuThichVaoGio(productId) {
    const favorites = layDanhSachYeuThich();
    const product = favorites.find(f => f.id === productId);
    if (product) themVaoGioHang(product);
}