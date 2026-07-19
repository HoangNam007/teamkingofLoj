/* ========================================================================
   TAIKHOAN.JS - Đăng ký / Đăng nhập / Đăng xuất
   ======================================================================== */

const TINH_THANH_THEO_MIEN = {
    'Miền Bắc': [
        'Hà Nội', 'Hải Phòng', 'Quảng Ninh', 'Bắc Ninh', 'Hải Dương',
        'Hưng Yên', 'Thái Bình', 'Nam Định', 'Ninh Bình', 'Hà Nam',
        'Vĩnh Phúc', 'Phú Thọ', 'Thái Nguyên', 'Bắc Giang', 'Lạng Sơn',
        'Cao Bằng', 'Bắc Kạn', 'Tuyên Quang', 'Hà Giang', 'Yên Bái',
        'Lào Cai', 'Lai Châu', 'Điện Biên', 'Sơn La', 'Hòa Bình'
    ],
    'Miền Trung': [
        'Thanh Hóa', 'Nghệ An', 'Hà Tĩnh', 'Quảng Bình', 'Quảng Trị',
        'Thừa Thiên Huế', 'Đà Nẵng', 'Quảng Nam', 'Quảng Ngãi', 'Bình Định',
        'Phú Yên', 'Khánh Hòa', 'Ninh Thuận', 'Bình Thuận', 'Kon Tum',
        'Gia Lai', 'Đắk Lắk', 'Đắk Nông', 'Lâm Đồng'
    ],
    'Miền Nam': [
        'TP.HCM', 'Bình Dương', 'Đồng Nai', 'Bà Rịa - Vũng Tàu',
        'Tây Ninh', 'Bình Phước', 'Long An', 'Tiền Giang', 'Bến Tre',
        'Trà Vinh', 'Vĩnh Long', 'Đồng Tháp', 'An Giang', 'Kiên Giang',
        'Cần Thơ', 'Hậu Giang', 'Sóc Trăng', 'Bạc Liêu', 'Cà Mau'
    ]
};

/* ========================================================================
   HELPER
   ======================================================================== */
function thongBaoTaiKhoan(message) {
    if (typeof showToast === 'function') showToast(message);
    else alert(message);
}

function chuanHoaText(text) {
    return (text || '')
        .toString()
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]/g, '');
}

function chuanHoaEmail(email) {
    return (email || '').toString().trim().toLowerCase();
}

/* ========================================================================
   VALIDATE FACEBOOK (dùng chung)
   Chấp nhận: facebook.com/user, www.facebook.com/user, fb.com/user, m.facebook.com/user
   ======================================================================== */
function isValidFacebookUrl(url) {
    if (!url) return true; // rỗng là hợp lệ (tùy chọn)
    const pattern = /^(https?:\/\/)?(www\.|m\.)?(facebook\.com|fb\.com)\/[a-zA-Z0-9._\-\/?=&]+\/?$/i;
    return pattern.test(url.trim());
}

/* ========================================================================
   LẤY MIỀN
   ======================================================================== */
function layMienTheoThanhPho(city) {
    if (!city) return '';
    const input = chuanHoaText(city);

    const aliasesHCM = [
        'tphcm', 'tp hcm', 'tp.hcm', 'hochiminh', 'ho chi minh',
        'thanhphohochiminh', 'sai gon', 'saigon'
    ].map(chuanHoaText);
    if (aliasesHCM.includes(input)) return 'Miền Nam';

    for (const mien in TINH_THANH_THEO_MIEN) {
        const found = TINH_THANH_THEO_MIEN[mien].some(tinh => {
            const t = chuanHoaText(tinh);
            return input === t || input.includes(t) || t.includes(input);
        });
        if (found) return mien;
    }
    return '';
}

/* ========================================================================
   ĐĂNG KÝ
   ======================================================================== */
function dangKy(name, email, password, confirmPassword, city, phone) {
    name = (name || '').trim();
    email = chuanHoaEmail(email);
    city = (city || '').trim();
    phone = (phone || '').toString().trim().replace(/\s+/g, '').replace(/-/g, '');

    // Kiểm tra rỗng
    if (!name) return { success: false, message: '⚠️ Vui lòng nhập họ tên!' };
    if (!email) return { success: false, message: '⚠️ Vui lòng nhập email!' };
    if (!phone) return { success: false, message: '⚠️ Vui lòng nhập số điện thoại!' };
    if (!password) return { success: false, message: '⚠️ Vui lòng nhập mật khẩu!' };
    if (!confirmPassword) return { success: false, message: '⚠️ Vui lòng nhập xác nhận mật khẩu!' };
    if (!city) return { success: false, message: '⚠️ Vui lòng chọn tỉnh/thành phố!' };

    // ★ Validate TÊN: tối thiểu 2, tối đa 50 ký tự
    if (name.length < 2) {
        return { success: false, message: '❌ Họ tên phải có ít nhất 2 ký tự!' };
    }
    if (name.length > 50) {
        return { success: false, message: '❌ Họ tên không được vượt quá 50 ký tự!' };
    }

    // ★ Validate EMAIL: đúng định dạng có @ và domain (VD: abc@gmail.com)
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
        return { success: false, message: '❌ Email không hợp lệ (VD: yourname@gmail.com)!' };
    }

    // Validate SĐT
    if (!/^[0-9]{10}$/.test(phone)) {
        return { success: false, message: '❌ Số điện thoại phải đúng 10 chữ số (VD: 0912345678)!' };
    }

    // Validate mật khẩu
    if (password.length < 6) {
        return { success: false, message: '❌ Mật khẩu tối thiểu 6 ký tự!' };
    }
    if (password !== confirmPassword) {
        return { success: false, message: '❌ Mật khẩu xác nhận không khớp!' };
    }

    // Xác định miền
    const region = layMienTheoThanhPho(city);
    if (!region) return { success: false, message: '❌ Tỉnh/thành phố không hợp lệ!' };

    // Check email trùng
    if (emailDaTonTai(email)) {
        return { success: false, message: '❌ Email đã tồn tại! Hãy đăng nhập.' };
    }

    if (typeof phoneDaTonTai === 'function' && phoneDaTonTai(phone)) {
        return { success: false, message: '❌ Số điện thoại đã được tài khoản khác sử dụng!' };
    }

    themUserMoi({
        id: Date.now(),
        name, email, password, phone,
        role: 'member',
        city, region,
        cart: [], posts: [],
        createdAt: new Date().toISOString()
    });

    return { success: true, message: '✅ Đăng ký thành công! Hãy đăng nhập.' };
}

/* ========================================================================
   ĐĂNG NHẬP / ĐĂNG XUẤT
   ======================================================================== */
function dangNhap(email, password) {
    email = chuanHoaEmail(email);

    if (!email || !password) {
        return { success: false, message: '⚠️ Vui lòng nhập email và mật khẩu!' };
    }

    const user = layDanhSachUsers().find(u => chuanHoaEmail(u.email) === email && u.password === password);
    if (!user) return { success: false, message: '❌ Email hoặc mật khẩu sai!' };

    datUserHienTai(user);
    return { success: true, message: '✅ Chào mừng, ' + user.name + '!', user };
}

function dangXuat() {
    xoaUserHienTai();
}

/* ========================================================================
   NÚT HEADER
   ======================================================================== */
function capNhatNutAuth() {
    const authButtons = document.querySelectorAll('#authBtn, .btn-login');
    const user = layUserHienTai();

    authButtons.forEach(btn => {
        if (!btn) return;

        if (user) {
            btn.textContent = '👤 ' + user.name;
            btn.href = 'thongtin.html';
            btn.style.background = '#ffba00';
            btn.style.color = '#000';
            btn.style.borderColor = '#000';
            btn.onclick = null;
        } else {
            btn.textContent = 'Đăng nhập';
            btn.href = 'taikhoan.html';
            btn.style.background = '';
            btn.style.color = '';
            btn.style.borderColor = '';
            btn.onclick = null;
        }
    });
}

/* ========================================================================
   CHUYỂN FORM
   ======================================================================== */
function chuyenSangFormDangKy() {
    document.getElementById('loggedInSection')?.style.setProperty('display', 'none');
    document.getElementById('loginSection')?.style.setProperty('display', 'none');
    document.getElementById('registerSection')?.style.setProperty('display', 'block');
    ganSuKienTinhThanh();
}

function chuyenSangFormDangNhap() {
    document.getElementById('loggedInSection')?.style.setProperty('display', 'none');
    document.getElementById('loginSection')?.style.setProperty('display', 'block');
    document.getElementById('registerSection')?.style.setProperty('display', 'none');
}

/* ========================================================================
   XỬ LÝ FORM
   ======================================================================== */
function xuLyFormDangNhap(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;

    const result = dangNhap(email, password);
    thongBaoTaiKhoan(result.message);

    if (result.success) {
        form.reset();
        capNhatNutAuth();
        if (typeof capNhatBadgeGioHang === 'function') capNhatBadgeGioHang();
        if (typeof capNhatBadgeThongBao === 'function') capNhatBadgeThongBao();

        setTimeout(() => { window.location.href = 'idea.html'; }, 800);
    }
}

function xuLyFormDangKy(event) {
    event.preventDefault();
    const form = event.target;

    const name = form.querySelector('[name="name"]').value;
    const email = form.querySelector('[name="email"]').value;
    const phone = (form.querySelector('[name="phone"]')?.value || '').replace(/\s+/g, '').replace(/-/g, '');
    const city = form.querySelector('[name="city"]')?.value || '';
    const password = form.querySelector('[name="password"]').value;
    const confirmPassword = form.querySelector('[name="confirmPassword"]').value;

    const result = dangKy(name, email, password, confirmPassword, city, phone);
    thongBaoTaiKhoan(result.message);

    if (result.success) {
        form.reset();
        resetRegionPreview();
        setTimeout(chuyenSangFormDangNhap, 800);
    }
}

/* ========================================================================
   HIỂN THỊ TRANG TÀI KHOẢN
   ======================================================================== */
function capNhatHienThiTrangTaiKhoan() {
    const loggedInSection = document.getElementById('loggedInSection');
    const loginSection = document.getElementById('loginSection');
    const registerSection = document.getElementById('registerSection');
    const user = layUserHienTai();

    if (!loginSection || !registerSection) return;

    if (user && loggedInSection) {
        loggedInSection.style.display = 'block';
        loginSection.style.display = 'none';
        registerSection.style.display = 'none';

        const loggedInName = document.getElementById('loggedInName');
        const loggedInEmail = document.getElementById('loggedInEmail');
        const loggedInLocation = document.getElementById('loggedInLocation');

        if (loggedInName) loggedInName.textContent = user.name;
        if (loggedInEmail) loggedInEmail.textContent = user.email;
        if (loggedInLocation) {
            loggedInLocation.textContent =
                `${user.city || 'Chưa có địa chỉ'} ${user.region ? '- ' + user.region : ''}`;
        }
        return;
    }

    if (loggedInSection) loggedInSection.style.display = 'none';
    loginSection.style.display = 'block';
    registerSection.style.display = 'none';
}

/* ========================================================================
   PREVIEW MIỀN
   ======================================================================== */
function ganSuKienTinhThanh() {
    const citySelect = document.querySelector('[name="city"]');
    const regionPreview = document.getElementById('regionPreview');
    if (!citySelect || !regionPreview) return;
    if (citySelect.dataset.bound === 'true') return;
    citySelect.dataset.bound = 'true';

    citySelect.addEventListener('change', () => {
        const city = citySelect.value;
        const region = layMienTheoThanhPho(city);

        if (!city) return resetRegionPreview();

        if (region) {
            regionPreview.textContent = 'Khu vực tự động: ' + region;
            regionPreview.style.color = '#ff8a00';
            regionPreview.style.fontWeight = '600';
        } else {
            regionPreview.textContent = 'Không xác định được miền.';
            regionPreview.style.color = '#ff4757';
            regionPreview.style.fontWeight = '600';
        }
    });
}

function resetRegionPreview() {
    const regionPreview = document.getElementById('regionPreview');
    if (!regionPreview) return;
    regionPreview.textContent = 'Hệ thống sẽ tự xác định miền sau khi bạn chọn tỉnh/thành.';
    regionPreview.style.color = '#777';
    regionPreview.style.fontWeight = '400';
}

/* ========================================================================
   VALIDATE SĐT REALTIME
   ======================================================================== */
function ganValidatePhoneRealtime() {
    const phoneInput = document.getElementById('registerPhone');
    if (!phoneInput || phoneInput.dataset.bound === 'true') return;
    phoneInput.dataset.bound = 'true';

    phoneInput.addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.value.length > 10) this.value = this.value.substring(0, 10);
    });
}

/* ========================================================================
   KHỞI TẠO
   ======================================================================== */
function khoiTaoTaiKhoan() {
    if (window.location.search) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegisterLink = document.getElementById('showRegisterLink');
    const showLoginLink = document.getElementById('showLoginLink');
    const logoutBtn = document.getElementById('logoutAccountBtn');

    ganValidatePhoneRealtime();

    if (loginForm && loginForm.dataset.bound !== 'true') {
        loginForm.dataset.bound = 'true';
        loginForm.addEventListener('submit', xuLyFormDangNhap);
    }

    if (registerForm && registerForm.dataset.bound !== 'true') {
        registerForm.dataset.bound = 'true';
        registerForm.addEventListener('submit', xuLyFormDangKy);
    }

    if (showRegisterLink) {
        showRegisterLink.onclick = e => { e.preventDefault(); chuyenSangFormDangKy(); };
    }
    if (showLoginLink) {
        showLoginLink.onclick = e => { e.preventDefault(); chuyenSangFormDangNhap(); };
    }

    if (logoutBtn) {
        logoutBtn.onclick = () => {
            dangXuat();
            thongBaoTaiKhoan('👋 Đã đăng xuất');
            capNhatNutAuth();
            capNhatHienThiTrangTaiKhoan();
            if (typeof capNhatBadgeGioHang === 'function') capNhatBadgeGioHang();
            if (typeof capNhatBadgeThongBao === 'function') capNhatBadgeThongBao();
        };
    }

    ganSuKienTinhThanh();
    capNhatNutAuth();
    capNhatHienThiTrangTaiKhoan();
}

document.addEventListener('DOMContentLoaded', khoiTaoTaiKhoan);
window.addEventListener('pageshow', () => {
    capNhatNutAuth();
    capNhatHienThiTrangTaiKhoan();
});
