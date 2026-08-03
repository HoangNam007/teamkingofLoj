
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

function layMienTheoThanhPho(city) {
    if (!city) return '';
    for (const mien in TINH_THANH_THEO_MIEN) {
        if (TINH_THANH_THEO_MIEN[mien].includes(city)) {
            return mien;
        }
    }
    return '';}

function xuLyDangNhap(event) {
    event.preventDefault();
    const form = event.target;

    const email = (form.querySelector('[name="email"]').value || '').trim().toLowerCase();
    const password = form.querySelector('[name="password"]').value || '';

    const user = layDanhSachUsers().find(u =>
        (u.email || '').toLowerCase() === email && u.password === password
    );

    if (!user) {
        showToast('❌ Sai email hoặc mật khẩu!', 'error');
        return;
    }

    datUserHienTai(user);

    if (user.blocked === true) {
        showToast('⚠️ Tài khoản của bạn đã bị khóa! Vui lòng xem thông báo.', 'warning');
        setTimeout(() => { window.location.href = 'thongbao.html'; }, 1500);
        return;
    }

    showToast('✅ Chào mừng ' + user.name + '!', 'success');
    setTimeout(() => { window.location.href = 'idea.html'; }, 800);
}
function xuLyDangKy(event) {
    event.preventDefault();
    const form = event.target;

    const name = (form.querySelector('[name="name"]').value || '').trim();
    const email = (form.querySelector('[name="email"]').value || '').trim().toLowerCase();
    const phone = (form.querySelector('[name="phone"]').value || '').trim();
    const city = form.querySelector('[name="city"]').value || '';
    const password = form.querySelector('[name="password"]').value || '';
    const confirmPassword = form.querySelector('[name="confirmPassword"]').value || '';

    if (!name || !email || !phone || !city || !password || !confirmPassword) {
        showToast('⚠️ Vui lòng nhập đầy đủ tất cả thông tin!', 'warning');
        return;}

    if (name.length < 2) {
        showToast('❌ Họ tên phải có ít nhất 2 ký tự!', 'error');
        return;}

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
        showToast('❌ Email không hợp lệ! Ví dụ: abc@gmail.com', 'error');
        return;}

    if (emailDaTonTai(email)) {
        showToast('❌ Email này đã có người dùng!', 'error');
        return;}

    if (!/^0[0-9]{9}$/.test(phone)) {
        showToast('❌ SĐT phải đủ 10 chữ số và bắt đầu bằng số 0!', 'error');
        return;}

    if (phoneDaTonTai(phone)) {
        showToast('❌ Số điện thoại này đã có người dùng!', 'error');
        return;}

    if (password.length < 6) {
        showToast('❌ Mật khẩu phải có ít nhất 6 ký tự!', 'error');
        return;}

    if (password !== confirmPassword) {
        showToast('❌ Mật khẩu xác nhận không khớp!', 'error');
        return;}

    const region = layMienTheoThanhPho(city);
    if (!region) {
        showToast('❌ Tỉnh/thành không hợp lệ!', 'error');
        return;}

    themUserMoi({ name, email, password, phone, city, region });
    showToast('✅ Đăng ký thành công! Hãy đăng nhập ở form phía trên.', 'success');
    form.reset();

    const regionPreview = document.getElementById('regionPreview');
    if (regionPreview) {
        regionPreview.textContent = 'Chọn tỉnh/thành để xác định miền.';
        regionPreview.style.color = '#777';}

    window.scrollTo({ top: 0, behavior: 'smooth' });}

function capNhatNutAuth() {
    const authButtons = document.querySelectorAll('#authBtn, .btn-login');
    const user = layUserHienTai();

    const fileName = window.location.pathname.split('/').pop().toLowerCase();
    const angOThongTin = (fileName === 'thongtin.html');

    authButtons.forEach(btn => {
        if (!btn) return;
        if (user) {
            btn.textContent = '👤 ' + user.name;
            btn.href = 'thongtin.html';
            if (angOThongTin) {
                btn.classList.add('btn-active');
            } else {btn.classList.remove('btn-active');
            }} 
            
            else {btn.textContent = 'Đăng nhập';
                btn.href = 'taikhoan.html';}
    });
}

function capNhatHienThiTrangTaiKhoan() {
    const user = layUserHienTai();
    const loggedInSection = document.getElementById('loggedInSection');
    const loginSection = document.getElementById('loginSection');
    const dividerSection = document.getElementById('dividerSection');
    const registerSection = document.getElementById('registerSection');

    if (!loginSection || !registerSection) return;

    if (user) {
        if (loggedInSection) {
            loggedInSection.style.display = 'block';
            document.getElementById('loggedInName').textContent = user.name;
            document.getElementById('loggedInEmail').textContent = user.email;
            document.getElementById('loggedInLocation').textContent =
                (user.city || '') + (user.region ? ' - ' + user.region : '');
        }
        loginSection.style.display = 'none';
        if (dividerSection) dividerSection.style.display = 'none';
        registerSection.style.display = 'none';
    } else {
        if (loggedInSection) loggedInSection.style.display = 'none';
        loginSection.style.display = 'block';
        if (dividerSection) dividerSection.style.display = 'block';
        registerSection.style.display = 'block';
    }
}

function ganSuKienTinhThanh() {
    const citySelect = document.getElementById('citySelect');
    const regionPreview = document.getElementById('regionPreview');
    if (!citySelect || !regionPreview) return;
    if (citySelect.dataset.bound === 'true') return;
    citySelect.dataset.bound = 'true';

    citySelect.addEventListener('change', () => {
        const city = citySelect.value;
        if (!city) {
            regionPreview.textContent = 'Chọn tỉnh/thành để xác định miền.';
            regionPreview.style.color = '#777';
            return;
        }
        const region = layMienTheoThanhPho(city);
        if (region) {
            regionPreview.textContent = '📍 Khu vực: ' + region;
            regionPreview.style.color = '#ff8a00';
            regionPreview.style.fontWeight = '600';
        }
    });
}
function ganValidatePhoneRealtime() {
    const phoneInput = document.getElementById('registerPhone');
    if (!phoneInput || phoneInput.dataset.bound === 'true') return;
    phoneInput.dataset.bound = 'true';

    phoneInput.addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.value.length > 10) this.value = this.value.substring(0, 10);
    });
}
function khoiTaoTaiKhoan() {
    ganValidatePhoneRealtime();

    const loginForm = document.getElementById('loginForm');
    if (loginForm && loginForm.dataset.bound !== 'true') {
        loginForm.dataset.bound = 'true';
        loginForm.addEventListener('submit', xuLyDangNhap);
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm && registerForm.dataset.bound !== 'true') {
        registerForm.dataset.bound = 'true';
        registerForm.addEventListener('submit', xuLyDangKy);
    }

    const logoutBtn = document.getElementById('logoutAccountBtn');
    if (logoutBtn && logoutBtn.dataset.bound !== 'true') {
        logoutBtn.dataset.bound = 'true';
        logoutBtn.addEventListener('click', () => {
            if (!confirm('Bạn có chắc muốn đăng xuất?')) return;
            xoaUserHienTai();
            showToast('👋 Đã đăng xuất!', 'success');
            setTimeout(() => { window.location.href = 'idea.html'; }, 800);
        });
    }

    ganSuKienTinhThanh();
    capNhatNutAuth();
    capNhatHienThiTrangTaiKhoan();
}

document.addEventListener('DOMContentLoaded', khoiTaoTaiKhoan);
window.addEventListener('pageshow', () => {
    capNhatNutAuth();
});
