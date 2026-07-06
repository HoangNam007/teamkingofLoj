/* ======================================================================== 

   TAIKHOAN.JS - Đăng ký / Đăng nhập bằng localStorage 

   ------------------------------------------------------------------------ 

   Vai trò: 

   - Đăng ký tài khoản 

   - Đăng nhập tài khoản 

   - Đăng xuất 

   - Mỗi tài khoản có cart/favorites riêng 

   - Chọn tỉnh/thành phố và tự xác định miền 

   ======================================================================== */ 

 

/* ======================================================================== 

   DANH SÁCH TỈNH/THÀNH THEO MIỀN 

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

   TOAST FALLBACK 

   ------------------------------------------------------------------------ 

   Nếu giaodien.js chưa load thì vẫn báo được. 

   ======================================================================== */ 

function thongBaoTaiKhoan(message) { 

    if (typeof showToast === 'function') { 

        showToast(message); 

    } else { 

        alert(message); 

    } 

} 

 

/* ======================================================================== 

   CHUẨN HÓA 

   ======================================================================== */ 

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

   LẤY MIỀN THEO TỈNH/THÀNH 

   ======================================================================== */ 

function layMienTheoThanhPho(city) { 

    if (!city) return ''; 

 

    const input = chuanHoaText(city); 

 

    const aliasesHCM = [ 

        'tphcm', 

        'tp hcm', 

        'tp.hcm', 

        'hochiminh', 

        'ho chi minh', 

        'thanhphohochiminh', 

        'sai gon', 

        'saigon' 

    ].map(chuanHoaText); 

 

    if (aliasesHCM.includes(input)) { 

        return 'Miền Nam'; 

    } 

 

    for (const mien in TINH_THANH_THEO_MIEN) { 

        const found = TINH_THANH_THEO_MIEN[mien].some(tinh => { 

            const tinhChuanHoa = chuanHoaText(tinh); 

 

            return input === tinhChuanHoa || 

                   input.includes(tinhChuanHoa) || 

                   tinhChuanHoa.includes(input); 

        }); 

 

        if (found) return mien; 

    } 

 

    return ''; 

} 

 

/* ======================================================================== 

   TẠO OPTION TỈNH/THÀNH 

   ======================================================================== */ 

function taoOptionsTinhThanh(selectedCity = '') { 

    let html = '<option value="">-- Chọn tỉnh/thành phố --</option>'; 

 

    for (const mien in TINH_THANH_THEO_MIEN) { 

        html += `<optgroup label="${mien}">`; 

 

        TINH_THANH_THEO_MIEN[mien].forEach(tinh => { 

            const selected = tinh === selectedCity ? 'selected' : ''; 

            html += `<option value="${tinh}" ${selected}>${tinh}</option>`; 

        }); 

 

        html += '</optgroup>'; 

    } 

 

    return html; 

} 

 

/* ======================================================================== 

   ĐẢM BẢO FORM ĐĂNG KÝ CÓ Ô TỈNH/THÀNH 

   ------------------------------------------------------------------------ 

   Nếu taikhoan.html cũ chưa có city thì JS tự thêm. 

   ======================================================================== */ 

function damBaoFormDangKyCoThanhPho() { 

    const registerForm = document.getElementById('registerForm'); 

    if (!registerForm) return; 

 

    if (registerForm.querySelector('[name="city"]')) return; 

 

    const roleGroup = registerForm.querySelector('[name="role"]')?.closest('.form-group'); 

    const passwordGroup = registerForm.querySelector('[name="password"]')?.closest('.form-group'); 

 

    const cityGroup = document.createElement('div'); 

    cityGroup.className = 'form-group'; 

 

    cityGroup.innerHTML = ` 

        <label>Tỉnh/Thành phố</label> 

        <select name="city" id="citySelect" required> 

            ${taoOptionsTinhThanh()} 

        </select> 

        <p id="regionPreview" style="font-size:12px; color:#777; margin-top:6px;"> 

            Hệ thống sẽ tự xác định miền sau khi bạn chọn tỉnh/thành. 

        </p> 

    `; 

 

    if (roleGroup) { 

        roleGroup.insertAdjacentElement('afterend', cityGroup); 

    } else if (passwordGroup) { 

        passwordGroup.insertAdjacentElement('beforebegin', cityGroup); 

    } else { 

        const submitBtn = registerForm.querySelector('.btn-submit') || registerForm.querySelector('button[type="submit"]'); 

        registerForm.insertBefore(cityGroup, submitBtn); 

    } 

} 

 

/* ======================================================================== 

   ĐĂNG KÝ 

   ======================================================================== */ 

function dangKy(name, email, password, confirmPassword, role, city) { 

    name = (name || '').trim(); 

    email = chuanHoaEmail(email); 

    city = (city || '').trim(); 

 

    if (!name || !email || !password || !confirmPassword || !city) { 

        return { 

            success: false, 

            message: '⚠️ Vui lòng nhập đầy đủ thông tin!' 

        }; 

    } 

 

    if (password.length < 6) { 

        return { 

            success: false, 

            message: '❌ Mật khẩu tối thiểu 6 ký tự!' 

        }; 

    } 

 

    if (password !== confirmPassword) { 

        return { 

            success: false, 

            message: '❌ Mật khẩu xác nhận không khớp!' 

        }; 

    } 

 

    const region = layMienTheoThanhPho(city); 

 

    if (!region) { 

        return { 

            success: false, 

            message: '❌ Tỉnh/thành phố không hợp lệ!' 

        }; 

    } 

 

    if (emailDaTonTai(email)) { 

        return { 

            success: false, 

            message: '❌ Email đã tồn tại! Hãy đăng nhập.' 

        }; 

    } 

 

    const user = { 

        id: Date.now(), 

        name: name, 

        email: email, 

        password: password, 

        role: role || 'buyer', 

        city: city, 

        region: region, 

        cart: [], 

        favorites: [], 

        posts: [], 

        createdAt: new Date().toISOString() 

    }; 

 

    themUserMoi(user); 

 

    return { 

        success: true, 

        message: '✅ Đăng ký thành công! Hãy đăng nhập.' 

    }; 

} 

 

/* ======================================================================== 

   ĐĂNG NHẬP 

   ======================================================================== */ 

function dangNhap(email, password) { 

    email = chuanHoaEmail(email); 

 

    if (!email || !password) { 

        return { 

            success: false, 

            message: '⚠️ Vui lòng nhập email và mật khẩu!' 

        }; 

    } 

 

    const users = layDanhSachUsers(); 

 

    const user = users.find(u => { 

        return chuanHoaEmail(u.email) === email && u.password === password; 

    }); 

 

    if (!user) { 

        return { 

            success: false, 

            message: '❌ Email hoặc mật khẩu sai!' 

        }; 

    } 

 

    datUserHienTai(user); 

 

    return { 

        success: true, 

        message: '✅ Chào mừng, ' + user.name + '!', 

        user: user 

    }; 

} 

 

/* ======================================================================== 

   ĐĂNG XUẤT 

   ======================================================================== */ 

function dangXuat() { 

    xoaUserHienTai(); 

} 

 

/* ======================================================================== 

   CẬP NHẬT NÚT HEADER 

   ======================================================================== */ 

function capNhatNutAuth() { 

    const authButtons = document.querySelectorAll('#authBtn, .btn-login'); 

    const user = layUserHienTai(); 

 

    authButtons.forEach(btn => { 

        if (!btn) return; 

 

        if (user) { 

            btn.textContent = '👤 ' + user.name; 

            btn.href = '#'; 

            btn.style.background = '#ffba00'; 

            btn.style.color = '#000'; 

            btn.style.borderColor = '#000'; 

 

            btn.onclick = function(e) { 

                e.preventDefault(); 

 

                const choice = confirm( 

                    `👋 Xin chào ${user.name}!\n` + 

                    `${user.email}\n` + 

                    `${user.city || 'Chưa có địa chỉ'} ${user.region ? '- ' + user.region : ''}\n\n` + 

                    `Bạn muốn:\n` + 

                    `1. Xem tin đã đăng (OK)\n` + 

                    `2. Đăng xuất (Cancel)` 

                ); 

 

                if (choice) { 

                    // Xem tin đã đăng 

                    window.location.href = 'dangtin.html'; 

                } else { 

                    // Đăng xuất 

                    dangXuat(); 

                    showToast('👋 Đã đăng xuất'); 

                    capNhatNutAuth(); 

                    if (typeof capNhatBadgeGioHang === 'function') capNhatBadgeGioHang(); 

                } 

            }; 

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

    damBaoFormDangKyCoThanhPho(); 

 

    const loginSection = document.getElementById('loginSection'); 

    const registerSection = document.getElementById('registerSection'); 

    const loggedInSection = document.getElementById('loggedInSection'); 

 

    if (loggedInSection) loggedInSection.style.display = 'none'; 

    if (loginSection) loginSection.style.display = 'none'; 

    if (registerSection) registerSection.style.display = 'block'; 

 

    ganSuKienTinhThanh(); 

} 

 

function chuyenSangFormDangNhap() { 

    const loginSection = document.getElementById('loginSection'); 

    const registerSection = document.getElementById('registerSection'); 

    const loggedInSection = document.getElementById('loggedInSection'); 

 

    if (loggedInSection) loggedInSection.style.display = 'none'; 

    if (loginSection) loginSection.style.display = 'block'; 

    if (registerSection) registerSection.style.display = 'none'; 

} 

 

function switchToRegister() { 

    chuyenSangFormDangKy(); 

} 

 

function switchToLogin() { 

    chuyenSangFormDangNhap(); 

} 

 

/* ======================================================================== 

   XỬ LÝ SUBMIT FORM 

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

 

        if (typeof capNhatBadgeGioHang === 'function') { 

            capNhatBadgeGioHang(); 

        } 

 

        if (typeof capNhatBadgeYeuThich === 'function') { 

            capNhatBadgeYeuThich(); 

        } 

 

        setTimeout(() => { 

            window.location.href = 'idea.html'; 

        }, 800); 

    } 

} 

 

function xuLyFormDangKy(event) { 

    event.preventDefault(); 

 

    const form = event.target; 

 

    const name = form.querySelector('[name="name"]').value; 

    const email = form.querySelector('[name="email"]').value; 

    const role = form.querySelector('[name="role"]')?.value || 'buyer'; 

    const city = form.querySelector('[name="city"]')?.value || ''; 

    const password = form.querySelector('[name="password"]').value; 

    const confirmPassword = form.querySelector('[name="confirmPassword"]').value; 

 

    const result = dangKy(name, email, password, confirmPassword, role, city); 

 

    thongBaoTaiKhoan(result.message); 

 

    if (result.success) { 

        form.reset(); 

        resetRegionPreview(); 

 

        setTimeout(() => { 

            chuyenSangFormDangNhap(); 

        }, 800); 

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

 

        if (!city) { 

            resetRegionPreview(); 

            return; 

        } 

 

        if (region) { 

            regionPreview.textContent = 'Khu vực tự động: ' + region; 

            regionPreview.style.color = '#ff8a00'; 

            regionPreview.style.fontWeight = '600'; 

        } else { 

            regionPreview.textContent = 'Không xác định được miền. Vui lòng chọn lại.'; 

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

   GẮN SỰ KIỆN 

   ======================================================================== */ 

function khoiTaoTaiKhoan() { 

    if (window.location.search) { 

        window.history.replaceState({}, document.title, window.location.pathname); 

    } 

 

    damBaoFormDangKyCoThanhPho(); 

 

    const loginForm = document.getElementById('loginForm'); 

    const registerForm = document.getElementById('registerForm'); 

 

    const showRegisterLink = document.getElementById('showRegisterLink'); 

    const showLoginLink = document.getElementById('showLoginLink'); 

 

    const logoutBtn = document.getElementById('logoutAccountBtn'); 

 

    if (loginForm && loginForm.dataset.bound !== 'true') { 

        loginForm.dataset.bound = 'true'; 

        loginForm.addEventListener('submit', xuLyFormDangNhap); 

    } 

 

    if (registerForm && registerForm.dataset.bound !== 'true') { 

        registerForm.dataset.bound = 'true'; 

        registerForm.addEventListener('submit', xuLyFormDangKy); 

    } 

 

    if (showRegisterLink) { 

        showRegisterLink.onclick = function(e) { 

            e.preventDefault(); 

            chuyenSangFormDangKy(); 

        }; 

    } 

 

    if (showLoginLink) { 

        showLoginLink.onclick = function(e) { 

            e.preventDefault(); 

            chuyenSangFormDangNhap(); 

        }; 

    } 

 

    if (logoutBtn) { 

        logoutBtn.onclick = function() { 

            dangXuat(); 

            thongBaoTaiKhoan('👋 Đã đăng xuất'); 

 

            capNhatNutAuth(); 

            capNhatHienThiTrangTaiKhoan(); 

 

            if (typeof capNhatBadgeGioHang === 'function') { 

                capNhatBadgeGioHang(); 

            } 

 

            if (typeof capNhatBadgeYeuThich === 'function') { 

                capNhatBadgeYeuThich(); 

            } 

        }; 

    } 

 

    ganSuKienTinhThanh(); 

    capNhatNutAuth(); 

    capNhatHienThiTrangTaiKhoan(); 

} 

 

/* ======================================================================== 

   CHẠY KHI LOAD TRANG 

   ======================================================================== */ 

document.addEventListener('DOMContentLoaded', khoiTaoTaiKhoan); 

 

window.addEventListener('pageshow', () => { 

    capNhatNutAuth(); 

    capNhatHienThiTrangTaiKhoan(); 

}); 

 
