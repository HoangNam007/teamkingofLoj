/* ========================================================================
   TRANG.JS - Logic riêng cho từng trang
   ------------------------------------------------------------------------
   - Nhận biết trang hiện tại → chạy khởi tạo tương ứng
   - Chặn tính năng cần đăng nhập
   - Trang chủ: tìm kiếm / lọc miền / lọc danh mục / phân trang
   - Trang giỏ hàng / thông báo / đăng tin / thông tin cá nhân
   ======================================================================== */

let dangChuyenHuongDangNhap = false;

const TRANG_THAI_LOC = {
    keyword: '',
    category: 'all',
    region: 'all',
    page: 1,
    perPage: 30
};

/* ========================================================================
   ĐIỂM KHỞI ĐẦU
   ======================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    capNhatNutAuth();
    capNhatBadgeGioHang();
    capNhatBadgeThongBao();
    setupModalEvents();
    setupModalActions();

    thietLapChanTinhNangCanDangNhap();

    const trangHienTai = nhanBietTrang();

    switch (trangHienTai) {
        case 'home':
            khoiTaoTrangChu();
            break;
        case 'cart':
            khoiTaoTrangGioHang();
            break;
        case 'auth':
            khoiTaoTrangTaiKhoan();
            break;
        case 'post':
            khoiTaoTrangDangTin();
            break;
        case 'notifications':
            khoiTaoTrangThongBao();
            break;
        case 'profile':
            khoiTaoTrangThongTin();
            break;
    }
});

/* ========================================================================
   NHẬN BIẾT TRANG
   ======================================================================== */
function nhanBietTrang() {
    const path = window.location.pathname.toLowerCase();
    const fileName = path.split('/').pop() || 'idea.html';

    if (fileName === '' || fileName === 'idea.html' || fileName === 'index.html') return 'home';
    if (fileName === 'giohang.html') return 'cart';
    if (fileName === 'taikhoan.html') return 'auth';
    if (fileName === 'dangtin.html') return 'post';
    if (fileName === 'thongbao.html') return 'notifications';
    if (fileName === 'thongtin.html') return 'profile';

    return 'other';
}

/* ========================================================================
   CHẶN TÍNH NĂNG CẦN ĐĂNG NHẬP
   ======================================================================== */
function thietLapChanTinhNangCanDangNhap() {
    document.addEventListener('click', (e) => {
        const restrictedTarget = e.target.closest(`
            a[href="giohang.html"],
            a[href="thongbao.html"],
            .btn-post,
            .btn-cart,
            .btn-add-cart
        `);

        if (!restrictedTarget) return;

        // Nếu là nút Đăng tin và đã đăng nhập → cho qua bình thường
        if (restrictedTarget.classList.contains('btn-post') && dangDangNhap()) {
            return;
        }

        // Đã đăng nhập → không chặn
        if (dangDangNhap()) return;

        e.preventDefault();
        e.stopPropagation();

        let message = '⚠️ Vui lòng đăng nhập/đăng ký để sử dụng tính năng này!';

        if (restrictedTarget.classList.contains('btn-post')) {
            message = '⚠️ Vui lòng đăng nhập để đăng tin!';
        } else if (restrictedTarget.classList.contains('btn-cart') || restrictedTarget.classList.contains('btn-add-cart')) {
            message = '⚠️ Vui lòng đăng nhập để sử dụng giỏ hàng!';
        }

        yeuCauDangNhap(message);
    }, true);
}

function yeuCauDangNhap(message) {
    if (dangChuyenHuongDangNhap) return;

    dangChuyenHuongDangNhap = true;
    showToast(message);

    setTimeout(() => {
        window.location.href = 'taikhoan.html';
    }, 1200);
}

/* ========================================================================
   TRANG CHỦ
   ======================================================================== */
function khoiTaoTrangChu() {
    setupDropdownKhuVuc();
    renderBaiDangNguoiDungLenGrid();
    setupCardEvents();
    setupLocDanhMuc();
    setupTimKiem();
    setupLocKhuVucTheoMien();
    apDungBoLocVaPhanTrang();
}

/* ========================================================================
   LỌC DANH MỤC (dropdown trong search)
   ======================================================================== */
function setupLocDanhMuc() {
    const categoryBtn = document.getElementById('categoryBtn');
    const categoryDropdown = document.getElementById('categoryDropdown');
    const categoryText = document.getElementById('categoryText');
    const sectionTitle = document.getElementById('sectionTitle');

    if (!categoryBtn || !categoryDropdown) return;
    if (categoryBtn.dataset.dropdownBound === 'true') return;
    categoryBtn.dataset.dropdownBound = 'true';

    categoryBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        categoryDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        categoryDropdown.classList.remove('show');
    });

    const tenDanhMuc = {
        all: 'Tất cả sản phẩm',
        dientu: 'Thiết bị Điện tử',
        phuongtien: 'Phương tiện',
        trangphuc: 'Trang phục & Phụ kiện',
        vatdung: 'Vật dụng gia đình',
        khac: 'Khác'
    };

    categoryDropdown.querySelectorAll('div[data-cat]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();

            const cat = item.dataset.cat;
            TRANG_THAI_LOC.category = cat;
            TRANG_THAI_LOC.page = 1;

            if (categoryText) categoryText.textContent = tenDanhMuc[cat] || 'Danh mục';
            categoryDropdown.classList.remove('show');

            if (sectionTitle) sectionTitle.textContent = tenDanhMuc[cat] || 'Sản phẩm';

            showToast('📂 Đã chọn: ' + (tenDanhMuc[cat] || 'Danh mục'));
            apDungBoLocVaPhanTrang();
        });
    });
}

/* ========================================================================
   TÌM KIẾM
   ======================================================================== */
function setupTimKiem() {
    const searchInput = document.getElementById('searchInput');
    const btnSearch = document.querySelector('.btn-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        TRANG_THAI_LOC.keyword = searchInput.value.toLowerCase().trim();
        TRANG_THAI_LOC.page = 1;
        apDungBoLocVaPhanTrang();
    });

    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') thucHienTimKiem();
    });

    if (btnSearch) btnSearch.onclick = thucHienTimKiem;
}

function thucHienTimKiem() {
    const searchInput = document.getElementById('searchInput');
    TRANG_THAI_LOC.keyword = searchInput ? searchInput.value.toLowerCase().trim() : '';
    TRANG_THAI_LOC.page = 1;
    apDungBoLocVaPhanTrang();
}

/* ========================================================================
   LỌC THEO MIỀN
   ======================================================================== */
function setupLocKhuVucTheoMien() {
    const regionDropdown = document.getElementById('regionDropdown');
    const regionText = document.getElementById('regionText');
    if (!regionDropdown) return;

    regionDropdown.querySelectorAll('div[data-region]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();

            const region = item.dataset.region;
            TRANG_THAI_LOC.region = region;
            TRANG_THAI_LOC.page = 1;

            if (regionText) {
                regionText.textContent = region === 'all' ? 'Tất cả khu vực' : region;
            }

            regionDropdown.classList.remove('show');

            if (region === 'all') {
                showToast('🌏 Đã chọn tất cả khu vực');
            } else {
                showToast('📍 Đã lọc theo ' + region);
            }

            apDungBoLocVaPhanTrang();
        });
    });
}

/* ========================================================================
   ÁP DỤNG FILTER + PHÂN TRANG
   ======================================================================== */
function apDungBoLocVaPhanTrang() {
    const grid = document.querySelector('.product-grid');
    const sectionTitle = document.getElementById('sectionTitle');
    if (!grid) return;

    const allCards = Array.from(grid.querySelectorAll('.product-card'));

    const matchedCards = allCards.filter(card => {
        const name = (card.dataset.name || '').toLowerCase();
        const cat = card.dataset.cat || '';
        const location = card.dataset.location || '';

        const matchKeyword = TRANG_THAI_LOC.keyword === '' || name.includes(TRANG_THAI_LOC.keyword);
        const matchCategory = TRANG_THAI_LOC.category === 'all' || cat === TRANG_THAI_LOC.category;

        let productRegion = '';
        if (typeof layMienTheoThanhPho === 'function') {
            productRegion = layMienTheoThanhPho(location);
        }
        const matchRegion = TRANG_THAI_LOC.region === 'all' || productRegion === TRANG_THAI_LOC.region;

        return matchKeyword && matchCategory && matchRegion;
    });

    allCards.forEach(card => { card.style.display = 'none'; });

    const oldEmpty = document.getElementById('noResultMessage');
    if (oldEmpty) oldEmpty.remove();

    if (matchedCards.length === 0) {
        anPagination();

        const emptyDiv = document.createElement('div');
        emptyDiv.id = 'noResultMessage';
        emptyDiv.style.gridColumn = '1 / -1';
        emptyDiv.style.textAlign = 'center';
        emptyDiv.style.padding = '60px 20px';
        emptyDiv.style.color = '#888';
        emptyDiv.innerHTML = `
            <div style="font-size:64px; margin-bottom:12px;">🔎</div>
            <h2>Không tìm thấy sản phẩm phù hợp</h2>
            <p>Hãy thử từ khóa khác hoặc chọn lại danh mục/khu vực.</p>
        `;

        grid.appendChild(emptyDiv);

        if (sectionTitle) sectionTitle.textContent = 'Không có kết quả phù hợp';
        return;
    }

    const tenDanhMuc = {
        dientu: 'Thiết bị Điện tử',
        phuongtien: 'Phương tiện',
        trangphuc: 'Trang phục & Phụ kiện',
        vatdung: 'Vật dụng gia đình',
        khac: 'Khác'
    };

    if (sectionTitle) {
        if (TRANG_THAI_LOC.keyword) {
            sectionTitle.textContent = `Kết quả tìm kiếm cho "${TRANG_THAI_LOC.keyword}"`;
        } else if (TRANG_THAI_LOC.region !== 'all') {
            sectionTitle.textContent = `Sản phẩm tại ${TRANG_THAI_LOC.region}`;
        } else if (TRANG_THAI_LOC.category !== 'all') {
            sectionTitle.textContent = tenDanhMuc[TRANG_THAI_LOC.category] || 'Sản phẩm';
        } else {
            sectionTitle.textContent = 'Tất cả sản phẩm';
        }
    }

    const totalPages = Math.ceil(matchedCards.length / TRANG_THAI_LOC.perPage);
    if (TRANG_THAI_LOC.page > totalPages) TRANG_THAI_LOC.page = totalPages;

    const start = (TRANG_THAI_LOC.page - 1) * TRANG_THAI_LOC.perPage;
    const end = start + TRANG_THAI_LOC.perPage;

    matchedCards.forEach((card, index) => {
        card.style.display = index >= start && index < end ? '' : 'none';
    });

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const grid = document.querySelector('.product-grid');
    if (!grid) return;

    anPagination();
    if (totalPages <= 1) return;

    const pagination = document.createElement('div');
    pagination.id = 'paginationContainer';
    pagination.style.textAlign = 'center';
    pagination.style.marginTop = '30px';

    let html = '';

    if (TRANG_THAI_LOC.page > 1) {
        html += `<button class="btn-page" onclick="chuyenTrangSanPham(${TRANG_THAI_LOC.page - 1})">« Trước</button>`;
    }

    for (let i = 1; i <= totalPages; i++) {
        const activeStyle = i === TRANG_THAI_LOC.page
            ? 'background:#ff8a00;color:white;border-color:#ff8a00;'
            : '';

        html += `<button class="btn-page" onclick="chuyenTrangSanPham(${i})"
                    style="margin:0 4px;padding:8px 14px;border-radius:8px;border:1px solid #ddd;cursor:pointer;${activeStyle}">
                    ${i}
                 </button>`;
    }

    if (TRANG_THAI_LOC.page < totalPages) {
        html += `<button class="btn-page" onclick="chuyenTrangSanPham(${TRANG_THAI_LOC.page + 1})">Sau »</button>`;
    }

    pagination.innerHTML = html;
    grid.parentNode.insertBefore(pagination, grid.nextSibling);
}

function chuyenTrangSanPham(page) {
    TRANG_THAI_LOC.page = page;
    apDungBoLocVaPhanTrang();

    const grid = document.querySelector('.product-grid');
    if (grid) {
        window.scrollTo({ top: grid.offsetTop - 120, behavior: 'smooth' });
    }
}

function anPagination() {
    const oldPagination = document.getElementById('paginationContainer');
    if (oldPagination) oldPagination.remove();
}

/* ========================================================================
   TRANG GIỎ HÀNG
   ======================================================================== */
function khoiTaoTrangGioHang() {
    const notLoggedIn = document.getElementById('notLoggedIn');
    const cartContent = document.getElementById('cartContent');

    if (!dangDangNhap()) {
        if (notLoggedIn) notLoggedIn.style.display = 'block';
        if (cartContent) cartContent.style.display = 'none';
    } else {
        if (notLoggedIn) notLoggedIn.style.display = 'none';
        if (cartContent) cartContent.style.display = 'block';
        renderBangGioHang();
    }
}

/* ========================================================================
   TRANG TÀI KHOẢN
   ======================================================================== */
function khoiTaoTrangTaiKhoan() {
    // Chỉ cần đảm bảo form đã gắn event (taikhoan.js đã tự lo).
    // Không confirm chuyển trang chủ nữa (khó chịu).
    const loginForm = document.getElementById('loginForm');
    if (loginForm && loginForm.dataset.bound !== 'true') {
        loginForm.dataset.bound = 'true';
        loginForm.addEventListener('submit', xuLyFormDangNhap);
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm && registerForm.dataset.bound !== 'true') {
        registerForm.dataset.bound = 'true';
        registerForm.addEventListener('submit', xuLyFormDangKy);
    }
}

/* ========================================================================
   TRANG ĐĂNG TIN
   ======================================================================== */
function khoiTaoTrangDangTin() {
    const notLoggedIn = document.getElementById('notLoggedIn');
    const postContent = document.getElementById('postContent');

    if (!dangDangNhap()) {
        if (notLoggedIn) notLoggedIn.style.display = 'block';
        if (postContent) postContent.style.display = 'none';
        return;
    }

    if (notLoggedIn) notLoggedIn.style.display = 'none';
    if (postContent) postContent.style.display = 'block';

    const user = layUserHienTai();

    // Auto-fill tên người bán (readonly)
    const sellerInput = document.querySelector('#postForm [name="seller"]');
    if (sellerInput && user.name) {
        sellerInput.value = user.name;
        sellerInput.readOnly = true;
    }

    // Auto-fill SĐT (readonly)
    const phoneInput = document.querySelector('#postForm [name="phone"]');
    if (phoneInput && user.phone) {
        phoneInput.value = user.phone;
        phoneInput.readOnly = true;
    }

    // Auto-fill tỉnh (readonly)
    const locationInput = document.getElementById('postLocationInput');
    if (locationInput && user.city) {
        locationInput.value = user.city;
    }

    // Hiện miền
    const regionPreview = document.getElementById('postRegionPreview');
    if (regionPreview && user.region) {
        regionPreview.textContent = 'Khu vực: ' + user.region;
    }

    const postForm = document.getElementById('postForm');
    if (postForm && postForm.dataset.bound !== 'true') {
        postForm.dataset.bound = 'true';
        postForm.addEventListener('submit', xuLyFormDangTin);
    }
}

function xuLyFormDangTin(event) {
    event.preventDefault();

    const form = event.target;
    const user = layUserHienTai();

    if (!user) {
        yeuCauDangNhap('⚠️ Vui lòng đăng nhập để đăng tin!');
        return;
    }

    const name = form.querySelector('[name="name"]').value.trim();
    const cat = form.querySelector('[name="cat"]').value;
    const priceRaw = form.querySelector('[name="price"]').value;
    const weight = (form.querySelector('[name="weight"]')?.value || '').toString().trim();
    const desc = form.querySelector('[name="desc"]').value.trim();
    const imageRaw = form.querySelector('[name="image"]').value.trim();
    const facebook = form.querySelector('[name="facebook"]')?.value.trim() || '';
    const location = user.city;  // Lấy trực tiếp từ user (tỉnh mặc định)
    const detailAddress = (form.querySelector('[name="detailAddress"]')?.value || '').trim();
    const region = user.region;

    // Validate
    if (!name) {
        showToast('⚠️ Vui lòng nhập tên sản phẩm!');
        return;
    }

    const price = Math.round(Number(priceRaw)) || 0;
    if (price <= 0) {
        showToast('⚠️ Giá bán phải lớn hơn 0!');
        return;
    }

    // Bắt buộc link ảnh
    if (!imageRaw) {
        showToast('⚠️ Vui lòng nhập link hình ảnh sản phẩm!');
        return;
    }
    if (!/^https?:\/\/.+/.test(imageRaw)) {
        showToast('❌ Link ảnh không hợp lệ (phải bắt đầu bằng http:// hoặc https://)!');
        return;
    }

    // Validate Facebook nếu có
    if (facebook && typeof isValidFacebookUrl === 'function' && !isValidFacebookUrl(facebook)) {
        showToast('❌ Link Facebook không hợp lệ!');
        return;
    }

    const newPost = {
        id: Date.now(),
        ownerEmail: user.email,
        name,
        cat,
        price,
        weight,
        desc,
        image: imageRaw,
        seller: user.name,
        phone: user.phone,
        facebook,
        location,
        detailAddress,
        region,
        createdAt: new Date().toISOString()
    };

    const result = typeof themBaiDangMoi === 'function' ? themBaiDangMoi(newPost) : null;

    if (!result) {
        showToast('❌ Không thể đăng tin. Vui lòng thử lại!');
        return;
    }

    showToast('✅ Đăng tin thành công!');
    form.reset();

    setTimeout(() => {
        window.location.href = 'idea.html';
    }, 1200);
}

/* ========================================================================
   TRANG THÔNG BÁO
   ======================================================================== */
function khoiTaoTrangThongBao() {
    if (!dangDangNhap()) {
        const container = document.getElementById('thongBaoList');
        if (container) {
            container.innerHTML = `
                <div style="text-align:center; padding:60px 20px;">
                    <div style="font-size:64px; margin-bottom:20px;">🔐</div>
                    <h2 style="color:#666; margin-bottom:15px;">Vui lòng đăng nhập để xem thông báo</h2>
                    <a href="taikhoan.html" class="btn-explore">Đăng nhập ngay</a>
                </div>
            `;
        }
        return;
    }

    if (typeof danhDauThongBaoDaDoc === 'function') {
        danhDauThongBaoDaDoc();
    }

    renderDanhSachThongBao();
}

function renderDanhSachThongBao() {
    const container = document.getElementById('thongBaoList');
    if (!container) return;

    const thongBaos = typeof layDanhSachThongBaoCuaUser === 'function'
        ? layDanhSachThongBaoCuaUser() : [];

    if (thongBaos.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:60px 20px; color:#888; background:#fff;
                        border-radius:14px; border:1px dashed #ddd; max-width:800px; margin:0 auto;">
                <div style="font-size:64px; margin-bottom:12px;">🔔</div>
                <h2 style="color:#666; margin-bottom:8px;">Chưa có thông báo nào</h2>
                <p style="color:#999;">Khi có người quan tâm đến sản phẩm của bạn, thông báo sẽ hiện ở đây.</p>
            </div>`;
        return;
    }

    let html = '<div style="max-width:800px; margin:0 auto;">';

    thongBaos.forEach(tb => {
        const time = new Date(tb.time);
        const timeText = tinhThoiGianThongBao(time);
        const fromEmail = tb.fromEmail || '';

        html += `
            <div class="noti-card"
                 data-from-email="${escapeHtml(fromEmail)}"
                 data-from-user="${escapeHtml(tb.fromUser)}"
                 data-product-name="${escapeHtml(tb.productName)}">
                <div class="noti-icon">🛒</div>
                <div class="noti-content">
                    <p class="noti-text">
                        <strong>${escapeHtml(tb.fromUser)}</strong>
                        đã thêm sản phẩm <strong>"${escapeHtml(tb.productName)}"</strong> vào giỏ hàng
                    </p>
                    <small class="noti-time">${timeText}</small>
                </div>
                <div class="noti-arrow">›</div>
            </div>`;
    });

    html += '</div>';
    container.innerHTML = html;

    container.querySelectorAll('.noti-card').forEach(card => {
        card.addEventListener('click', () => {
            moModalThongTinNguoiMua(
                card.dataset.fromEmail,
                card.dataset.fromUser,
                card.dataset.productName
            );
        });
    });
}

/* ========================================================================
   MODAL THÔNG TIN NGƯỜI MUA (khi click 1 thông báo)
   ======================================================================== */
function moModalThongTinNguoiMua(fromEmail, fromUser, productName) {
    const oldModal = document.getElementById('modalNguoiMua');
    if (oldModal) oldModal.remove();

    let userInfo = null;
    if (fromEmail && typeof layThongTinUserTheoEmail === 'function') {
        userInfo = layThongTinUserTheoEmail(fromEmail);
    }

    if (!userInfo) {
        userInfo = {
            name: fromUser || 'Người dùng',
            phone: '',
            city: '',
            region: ''
        };
    }

    const phoneDisplay = userInfo.phone
        ? `<a href="tel:${escapeHtml(userInfo.phone)}"
              style="color:#ff8a00; text-decoration:none; font-weight:600; font-size:16px;">
             📞 ${escapeHtml(userInfo.phone)}
           </a>`
        : `<span style="color:#999;">Chưa cập nhật</span>`;

    const addressDisplay = userInfo.city
        ? `${escapeHtml(userInfo.city)}${userInfo.region ? ' - ' + escapeHtml(userInfo.region) : ''}`
        : `<span style="color:#999;">Chưa cập nhật</span>`;

    const modalHtml = `
        <div class="modal-overlay show" id="modalNguoiMua">
            <div class="modal-box">
                <button class="modal-close" type="button" onclick="dongModalNguoiMua()">✕</button>

                <div style="padding:30px 24px 20px; text-align:center;
                            background:linear-gradient(135deg, #ffd65e, #ffba00);">
                    <div style="width:80px; height:80px; margin:0 auto 14px; background:#fff;
                                border-radius:50%; display:flex; align-items:center;
                                justify-content:center; font-size:40px;
                                box-shadow:0 4px 12px rgba(0,0,0,0.15);">
                        👤
                    </div>
                    <h2 style="font-size:22px; color:#000; margin:0;">
                        ${escapeHtml(userInfo.name)}
                    </h2>
                </div>

                <div class="modal-body">
                    <div style="background:#fff8e1; border-left:4px solid #ffba00;
                                padding:12px 14px; border-radius:6px; margin-bottom:20px;
                                font-size:13px;">
                        💡 Người này quan tâm sản phẩm
                        <strong>"${escapeHtml(productName)}"</strong> của bạn.
                        Hãy chủ động liên hệ để chốt giao dịch!
                    </div>

                    <div class="modal-info">
                        <div class="modal-info-row">
                            <span class="label">📞 Số điện thoại:</span>
                            <span class="value">${phoneDisplay}</span>
                        </div>

                        <div class="modal-info-row">
                            <span class="label">📍 Địa chỉ:</span>
                            <span class="value">${addressDisplay}</span>
                        </div>
                    </div>

                    <div class="modal-actions" style="margin-top:20px;">
                        <button type="button" class="btn-add-cart" onclick="dongModalNguoiMua()">Đóng</button>
                    </div>
                </div>
            </div>
        </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = document.getElementById('modalNguoiMua');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) dongModalNguoiMua();
    });
}

function dongModalNguoiMua() {
    const modal = document.getElementById('modalNguoiMua');
    if (modal) modal.remove();
}

function tinhThoiGianThongBao(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return Math.floor(diff / 60) + ' phút trước';
    if (diff < 86400) return Math.floor(diff / 3600) + ' giờ trước';
    if (diff < 604800) return Math.floor(diff / 86400) + ' ngày trước';
    return date.toLocaleDateString('vi-VN');
}

/* ========================================================================
   RENDER BÀI ĐĂNG NGƯỜI DÙNG LÊN GRID TRANG CHỦ
   ======================================================================== */
function renderBaiDangNguoiDungLenGrid() {
    const grid = document.querySelector('.product-grid');
    if (!grid) return;

    let posts = [];
    if (typeof layDanhSachBaiDang === 'function') {
        posts = layDanhSachBaiDang();
    }

    if (!posts || posts.length === 0) return;

    posts.forEach(post => {
        if (grid.querySelector(`[data-id="${post.id}"]`)) return;
        grid.insertAdjacentHTML('afterbegin', taoHtmlCardSanPham(post));
    });
}

function taoHtmlCardSanPham(product) {
    // Địa chỉ đầy đủ (dùng trong data-location cho modal)
    const diaChiDayDu = (product.location || '') + 
        (product.detailAddress ? ', ' + product.detailAddress : '');

    // Địa chỉ ngắn hiện trên box (chỉ tên tỉnh)
    const diaChiNgan = product.location || 'Chưa rõ';

    return `
        <div class="product-card"
             data-id="${escapeHtml(product.id)}"
             data-cat="${escapeHtml(product.cat)}"
             data-name="${escapeHtml(product.name)}"
             data-price="${Number(product.price) || 0}"
             data-desc="${escapeHtml(product.desc)}"
             data-seller="${escapeHtml(product.seller)}"
             data-phone="${escapeHtml(product.phone)}"
             data-location="${escapeHtml(diaChiDayDu)}"
             data-weight="${escapeHtml(product.weight || '')}"
             data-facebook="${escapeHtml(product.facebook || '')}">
            <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" class="card-img">
            <div class="card-actions">
                <button class="card-btn btn-cart" type="button">🛒</button>
            </div>
            <div class="card-body">
                <h3>${escapeHtml(product.name)}</h3>
                <p class="card-location">📍 ${escapeHtml(diaChiNgan)}</p>
                <p class="price">₫${formatGiaTien(product.price)}</p>
            </div>
        </div>
    `;
}

/* ========================================================================
   TRANG THÔNG TIN CÁ NHÂN
   ======================================================================== */
function khoiTaoTrangThongTin() {
    const notLoggedIn = document.getElementById('notLoggedIn');
    const profileContent = document.getElementById('profileContent');

    if (!dangDangNhap()) {
        if (notLoggedIn) notLoggedIn.style.display = 'block';
        if (profileContent) profileContent.style.display = 'none';
        return;
    }

    if (notLoggedIn) notLoggedIn.style.display = 'none';
    if (profileContent) profileContent.style.display = 'block';

    const user = layUserHienTai();

    // Avatar + tên
    document.getElementById('profileName').textContent = user.name || 'Người dùng';

    // Thống kê
    const posts = typeof layBaiDangCuaUserHienTai === 'function' ? layBaiDangCuaUserHienTai() : [];
    const cart = typeof layGioHang === 'function' ? layGioHang() : [];

    const statPosts = document.getElementById('statPosts');
    const statCart = document.getElementById('statCart');
    const statFavs = document.getElementById('statFavs');

    if (statPosts) statPosts.textContent = posts.length;
    if (statCart) statCart.textContent = cart.length;
    if (statFavs) statFavs.textContent = 0; // Đã bỏ chức năng yêu thích

    // Điền form
    document.getElementById('editName').value = user.name || '';
    document.getElementById('editEmail').value = user.email || '';
    document.getElementById('editPhone').value = user.phone || '';
    document.getElementById('editCity').value = user.city || '';

    capNhatMienPreviewProfile();

    const editCity = document.getElementById('editCity');
    if (editCity && editCity.dataset.bound !== 'true') {
        editCity.dataset.bound = 'true';
        editCity.addEventListener('change', capNhatMienPreviewProfile);
    }

    const profileForm = document.getElementById('profileForm');
    if (profileForm && profileForm.dataset.bound !== 'true') {
        profileForm.dataset.bound = 'true';
        profileForm.addEventListener('submit', xuLyLuuThongTin);
    }

    const btnLogout = document.getElementById('btnLogoutProfile');
    if (btnLogout && btnLogout.dataset.bound !== 'true') {
        btnLogout.dataset.bound = 'true';
        btnLogout.addEventListener('click', () => {
            if (!confirm('Bạn chắc chắn muốn đăng xuất?')) return;
            dangXuat();
            showToast('👋 Đã đăng xuất');
            setTimeout(() => { window.location.href = 'idea.html'; }, 800);
        });
    }
}

function capNhatMienPreviewProfile() {
    const editCity = document.getElementById('editCity');
    const preview = document.getElementById('editRegionPreview');
    if (!editCity || !preview) return;

    const city = editCity.value;
    if (!city) {
        preview.textContent = 'Chọn tỉnh/thành để xác định miền.';
        preview.style.color = '#777';
        return;
    }

    const region = typeof layMienTheoThanhPho === 'function' ? layMienTheoThanhPho(city) : '';
    if (region) {
        preview.textContent = 'Khu vực: ' + region;
        preview.style.color = '#ff8a00';
        preview.style.fontWeight = '600';
    } else {
        preview.textContent = 'Không xác định được miền.';
        preview.style.color = '#ff4757';
    }
}

function xuLyLuuThongTin(event) {
    event.preventDefault();

    const user = layUserHienTai();
    if (!user) return;

    const name = document.getElementById('editName').value.trim();
    const email = document.getElementById('editEmail').value.trim().toLowerCase();
    const phone = document.getElementById('editPhone').value.trim().replace(/\s+/g, '').replace(/-/g, '');
    const city = document.getElementById('editCity').value;

    // Validate rỗng
    if (!name || !email || !phone || !city) {
        showToast('⚠️ Vui lòng nhập đầy đủ thông tin!');
        return;
    }

    if (name.length < 2) {
        showToast('❌ Họ tên phải có ít nhất 2 ký tự!');
        return;
    }
    if (name.length > 50) {
        showToast('❌ Họ tên không được vượt quá 50 ký tự!');
        return;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
        showToast('❌ Email không hợp lệ (VD: yourname@gmail.com)!');
        return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
        showToast('❌ Số điện thoại phải đúng 10 chữ số!');
        return;
    }

    // Check trùng email (loại trừ chính mình)
    if (typeof emailDaTonTai === 'function' && emailDaTonTai(email, user.email)) {
        showToast('❌ Email này đã được người khác sử dụng!');
        return;
    }

    // Check trùng SĐT (loại trừ chính mình)
    if (typeof phoneDaTonTai === 'function' && phoneDaTonTai(phone, user.email)) {
        showToast('❌ Số điện thoại này đã được tài khoản khác sử dụng!');
        return;
    }

    const region = typeof layMienTheoThanhPho === 'function' ? layMienTheoThanhPho(city) : '';
    if (!region) {
        showToast('❌ Tỉnh/thành không hợp lệ!');
        return;
    }

    const oldEmail = user.email;
    const dataMoi = { name, email, phone, city, region };

    // ★ ĐỒNG BỘ TẤT CẢ BÀI ĐĂNG CŨ CỦA USER
    if (typeof layDanhSachBaiDang === 'function' && typeof luuDanhSachBaiDang === 'function') {
        const allPosts = layDanhSachBaiDang();
        let postsChanged = false;

        allPosts.forEach(post => {
            if (post.ownerEmail === oldEmail) {
                post.ownerEmail = email;
                post.seller = name;
                post.phone = phone;
                post.location = city;
                post.region = region;
                postsChanged = true;
            }
        });

        if (postsChanged) luuDanhSachBaiDang(allPosts);
    }

    // ★ ĐỒNG BỘ SP TRONG GIỎ HÀNG CỦA CÁC USER KHÁC
    if (typeof layDanhSachUsers === 'function' && typeof luuDanhSachUsers === 'function') {
        const allUsers = layDanhSachUsers();
        let cartChanged = false;

        allUsers.forEach(u => {
            if (!Array.isArray(u.cart)) return;
            u.cart.forEach(item => {
                if (item.ownerEmail === oldEmail) {
                    item.ownerEmail = email;
                    item.seller = name;
                    item.phone = phone;
                    item.location = city;
                    item.region = region;
                    cartChanged = true;
                }
            });
        });

        if (cartChanged) luuDanhSachUsers(allUsers);
    }

    // Cập nhật user hiện tại
    if (email !== oldEmail) {
        const users = layDanhSachUsers();
        const idx = users.findIndex(u => u.email === oldEmail);
        if (idx > -1) {
            users[idx] = { ...users[idx], ...dataMoi };
            luuDanhSachUsers(users);
        }
        datUserHienTai({ ...user, ...dataMoi });
    } else {
        capNhatUserHienTai(dataMoi);
    }

    showToast('✅ Đã lưu thay đổi thành công!');

    if (typeof capNhatNutAuth === 'function') capNhatNutAuth();

    setTimeout(() => { location.reload(); }, 800);
}

/* ========================================================================
   HELPER: ESCAPE HTML
   ======================================================================== */
function escapeHtml(value) {
    return (value ?? '')
        .toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
