/* ========================================================================
   AUTH.JS - Xác thực người dùng
   ------------------------------------------------------------------------
   Vai trò: Xử lý đăng nhập, đăng ký, đăng xuất + cập nhật nút header
   Phụ thuộc: storage.js, ui.js
   ======================================================================== */

/* ========================================================================
   ĐĂNG NHẬP
   ======================================================================== */
function dangNhap(email, password) {
    // Validate đầu vào
    if (!email || !password) {
        return { success: false, message: '⚠️ Vui lòng nhập đầy đủ thông tin!' };
    }

    // Tìm user khớp
    const user = layDanhSachUsers().find(
        u => u.email === email && u.password === password
    );

    if (!user) {
        return { success: false, message: '❌ Email hoặc mật khẩu sai!' };
    }

    // ✅ Đăng nhập thành công - GIỮ NGUYÊN cart, favorites của user
    datUserHienTai({
        name: user.name,
        email: user.email,
        role: user.role,
        cart: user.cart || [],            // ← FIX BUG: giữ cart cũ
        favorites: user.favorites || []   // ← FIX BUG: giữ favorites cũ
    });

    // Gộp guest data (nếu có) vào user
    gopGuestCartVaoUser();
    gopGuestFavoritesVaoUser();

    return { 
        success: true, 
        message: '✅ Chào mừng, ' + user.name + '!',
        user: user 
    };
}

/* ========================================================================
   ĐĂNG KÝ
   ======================================================================== */
function dangKy(name, email, password, confirmPassword, role) {
    // Validate
    if (!name || !email || !password) {
        return { success: false, message: '⚠️ Vui lòng nhập đầy đủ thông tin!' };
    }
    
    if (password !== confirmPassword) {
        return { success: false, message: '❌ Mật khẩu xác nhận không khớp!' };
    }
    
    if (password.length < 6) {
        return { success: false, message: '❌ Mật khẩu tối thiểu 6 ký tự!' };
    }

    if (emailDaTonTai(email)) {
        return { success: false, message: '❌ Email đã tồn tại! Hãy đăng nhập.' };
    }

    // Tạo user mới (có sẵn cart & favorites rỗng)
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password,   // ⚠️ KHÔNG MÃ HÓA - CHỈ DEMO!
        role: role || 'buyer',
        cart: [],
        favorites: [],
        createdAt: new Date().toISOString()
    };

    themUserMoi(newUser);

    return { 
        success: true, 
        message: '✅ Đăng ký thành công! Hãy đăng nhập.' 
    };
}

/* ========================================================================
   ĐĂNG XUẤT
   ======================================================================== */
function dangXuat() {
    xoaUserHienTai();
}

/* ========================================================================
   CẬP NHẬT NÚT AUTH TRÊN HEADER
   ------------------------------------------------------------------------
   Gọi hàm này khi load mọi trang để hiện đúng trạng thái
   ======================================================================== */
function capNhatNutAuth() {
    const authBtn = document.getElementById('authBtn');
    if (!authBtn) return;

    const user = layUserHienTai();
    
    if (user) {
        // Đã đăng nhập → hiện tên + cho phép đăng xuất
        authBtn.textContent = '👤 ' + user.name;
        authBtn.style.background = '#ffba00';
        authBtn.style.color = '#000';
        authBtn.href = '#';
        authBtn.onclick = function(e) {
            e.preventDefault();
            if (confirm('Bạn muốn đăng xuất?')) {
                dangXuat();
                showToast('👋 Đã đăng xuất');
                setTimeout(() => window.location.reload(), 1000);
            }
        };
    } else {
        // Chưa đăng nhập → giữ nguyên link tới taikhoan.html
        authBtn.textContent = 'Đăng nhập';
        authBtn.href = 'taikhoan.html';
        authBtn.onclick = null;
    }
}

/* ========================================================================
   XỬ LÝ FORM ĐĂNG NHẬP (cho taikhoan.html)
   ======================================================================== */
function xuLyFormDangNhap(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.querySelector('[name="email"]').value.trim();
    const password = form.querySelector('[name="password"]').value;

    const ketQua = dangNhap(email, password);
    showToast(ketQua.message);

    if (ketQua.success) {
        form.reset();
        capNhatNutAuth();
        setTimeout(() => window.location.href = 'idea.html', 1000);
    }
}

/* ========================================================================
   XỬ LÝ FORM ĐĂNG KÝ (cho taikhoan.html)
   ======================================================================== */
function xuLyFormDangKy(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const password = form.querySelector('[name="password"]').value;
    const confirmPassword = form.querySelector('[name="confirmPassword"]').value;
    const role = form.querySelector('[name="role"]').value;

    const ketQua = dangKy(name, email, password, confirmPassword, role);
    showToast(ketQua.message);

    if (ketQua.success) {
        form.reset();
        setTimeout(() => chuyenSangFormDangNhap(), 1500);
    } else if (ketQua.message.includes('đã tồn tại')) {
        setTimeout(() => chuyenSangFormDangNhap(), 1500);
    }
}

/* ========================================================================
   CHUYỂN ĐỔI FORM LOGIN ↔ REGISTER (cho taikhoan.html)
   ======================================================================== */
function chuyenSangFormDangKy() {
    const loginSection = document.getElementById('loginSection') 
                      || document.querySelector('.auth-section');
    const registerSection = document.getElementById('registerSection');
    if (registerSection) registerSection.style.display = 'block';
    if (loginSection) {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) loginForm.parentElement.style.display = 'none';
    }
}

function chuyenSangFormDangNhap() {
    const loginForm = document.getElementById('loginForm');
    const registerSection = document.getElementById('registerSection');
    if (loginForm) loginForm.parentElement.style.display = 'block';
    if (registerSection) registerSection.style.display = 'none';
}