/* ======================================================================== 

   PAGE.JS - Logic riêng cho từng trang 

   ------------------------------------------------------------------------ 

   Vai trò: 

   - Tự nhận biết trang hiện tại 

   - Chạy code tương ứng từng trang 

   - Chặn tính năng cần đăng nhập 

   - Tìm kiếm / lọc miền / lọc danh mục / phân trang sản phẩm 

   Phụ thuộc: storage.js, ui.js, auth.js, cart.js 

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

    capNhatSoThongBao(); 

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

    } 

}); 

 

/* ======================================================================== 

   NHẬN BIẾT TRANG 

   ======================================================================== */ 

function nhanBietTrang() { 

    const path = window.location.pathname.toLowerCase(); 

    const fileName = path.split('/').pop() || 'idea.html'; 

 

    if (fileName === '' || fileName === 'idea.html' || fileName === 'index.html') { 

        return 'home'; 

    } 

 

    if (fileName === 'giohang.html') return 'cart'; 

    if (fileName === 'taikhoan.html') return 'auth'; 

    if (fileName === 'dangtin.html') return 'post'; 

    if (fileName === 'thongbao.html') return 'notifications'; 

 

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

            .btn-add-cart, 

            .btn-contact, 

            .btn-message 

        `); 

 

        if (!restrictedTarget) return; 

 

        if (restrictedTarget.classList.contains('btn-post') && dangDangNhap()) { 

            e.preventDefault(); 

            e.stopPropagation(); 

            window.location.href = 'dangtin.html'; 

            return; 

        } 

 

        if (dangDangNhap()) return; 

 

        e.preventDefault(); 

        e.stopPropagation(); 

        e.stopImmediatePropagation(); 

 

        let message = '⚠️ Vui lòng đăng nhập/đăng ký để sử dụng tính năng này!'; 

 

        if (restrictedTarget.classList.contains('btn-post')) { 

            message = '⚠️ Vui lòng đăng nhập để đăng tin!'; 

        } else if (restrictedTarget.classList.contains('btn-cart') || restrictedTarget.classList.contains('btn-add-cart')) { 

            message = '⚠️ Vui lòng đăng nhập để sử dụng giỏ hàng!'; 

        } else if (restrictedTarget.classList.contains('btn-message')) { 

            message = '⚠️ Vui lòng đăng nhập để nhắn tin!'; 

        } else if (restrictedTarget.classList.contains('btn-contact')) { 

            message = '⚠️ Vui lòng đăng nhập để xem/gọi người bán!'; 

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

    renderBaiDangNguoiDungLenGrid(); 

    setupCardEvents(); 

    setupLocDanhMuc(); 

    setupTimKiem(); 

    setupLocKhuVucTheoMien(); 

    apDungBoLocVaPhanTrang(); 

} 

 

/* ======================================================================== 

   LỌC DANH MỤC (SỬA - từ nav chuyển sang dropdown trong search) 

   ======================================================================== */ 

function setupLocDanhMuc() { 

    const categoryBtn = document.getElementById('categoryBtn'); 

    const categoryDropdown = document.getElementById('categoryDropdown'); 

    const categoryText = document.getElementById('categoryText'); 

    const sectionTitle = document.getElementById('sectionTitle'); 

 

    if (!categoryBtn || !categoryDropdown) return; 

 

    if (categoryBtn.dataset.dropdownBound === 'true') return; 

    categoryBtn.dataset.dropdownBound = 'true'; 

 

    // Mở/đóng dropdown 

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

 

            if (categoryText) { 

                categoryText.textContent = tenDanhMuc[cat] || 'Danh mục'; 

            } 

 

            categoryDropdown.classList.remove('show'); 

 

            if (sectionTitle) { 

                sectionTitle.textContent = tenDanhMuc[cat] || 'Sản phẩm'; 

            } 

 

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

        if (e.key === 'Enter') { 

            thucHienTimKiem(); 

        } 

    }); 

 

    if (btnSearch) { 

        btnSearch.onclick = thucHienTimKiem; 

    } 

} 

 

function thucHienTimKiem() { 

    const searchInput = document.getElementById('searchInput'); 

 

    TRANG_THAI_LOC.keyword = searchInput ? searchInput.value.toLowerCase().trim() : ''; 

    TRANG_THAI_LOC.page = 1; 

 

    apDungBoLocVaPhanTrang(); 

} 

 

function doSearch() { 

    thucHienTimKiem(); 

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

 

        const matchKeyword = 

            TRANG_THAI_LOC.keyword === '' || 

            name.includes(TRANG_THAI_LOC.keyword); 

 

        const matchCategory = 

            TRANG_THAI_LOC.category === 'all' || 

            cat === TRANG_THAI_LOC.category; 

 

        let productRegion = ''; 

 

        if (typeof layMienTheoThanhPho === 'function') { 

            productRegion = layMienTheoThanhPho(location); 

        } 

 

        const matchRegion = 

            TRANG_THAI_LOC.region === 'all' || 

            productRegion === TRANG_THAI_LOC.region; 

 

        return matchKeyword && matchCategory && matchRegion; 

    }); 

 

    allCards.forEach(card => { 

        card.style.display = 'none'; 

    }); 

 

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

 

        if (sectionTitle) { 

            sectionTitle.textContent = 'Không có kết quả phù hợp'; 

        } 

 

        return; 

    } 

 

    // Cập nhật tiêu đề section 

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

            sectionTitle.textContent = `Tất cả sản phẩm`; 

        } 

    } 

 

    // Phân trang 

    const totalPages = Math.ceil(matchedCards.length / TRANG_THAI_LOC.perPage); 

 

    if (TRANG_THAI_LOC.page > totalPages) { 

        TRANG_THAI_LOC.page = totalPages; 

    } 

 

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

 

        html += ` 

            <button class="btn-page" onclick="chuyenTrangSanPham(${i})" 

                style="margin:0 4px;padding:8px 14px;border-radius:8px;border:1px solid #ddd;cursor:pointer;${activeStyle}"> 

                ${i} 

            </button> 

        `; 

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

        window.scrollTo({ 

            top: grid.offsetTop - 120, 

            behavior: 'smooth' 

        }); 

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

 

    const btnCheckout = document.querySelector('.btn-checkout'); 

    if (btnCheckout) { 

        btnCheckout.onclick = thanhToan; 

    } 

} 

 

function checkout() { 

    thanhToan(); 

} 

 

/* ======================================================================== 

   TRANG TÀI KHOẢN 

   ======================================================================== */ 

function khoiTaoTrangTaiKhoan() { 

    if (typeof themOChonThanhPhoDangKy === 'function') { 

        themOChonThanhPhoDangKy(); 

    } 

 

    if (dangDangNhap()) { 

        const user = layUserHienTai(); 

 

        setTimeout(() => { 

            const cityText = user.city && user.region 

                ? `${user.city} - ${user.region}` 

                : 'Chưa cập nhật địa chỉ'; 

 

            if (confirm(`👋 Chào ${user.name}!\nĐịa chỉ: ${cityText}\n\nBạn muốn về trang chủ?`)) { 

                window.location.href = 'idea.html'; 

            } 

        }, 500); 

 

        return; 

    } 

 

    const loginForm = document.getElementById('loginForm'); 

    if (loginForm) { 

        loginForm.addEventListener('submit', xuLyFormDangNhap); 

    } 

 

    const registerForm = document.getElementById('registerForm'); 

    if (registerForm) { 

        registerForm.addEventListener('submit', xuLyFormDangKy); 

    } 

} 

 

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

 

    const sellerInput = document.querySelector('#postForm [name="seller"]'); 

    if (sellerInput && user.name) { 

        sellerInput.value = user.name; 

        sellerInput.readOnly = true; 

    } 

 

    const locationInput = document.querySelector('#postForm [name="location"]'); 

    if (locationInput && user.city) { 

        locationInput.value = user.city; 

    } 

 

    const postForm = document.getElementById('postForm'); 

    if (postForm) { 

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

 

    const location = form.querySelector('[name="location"]').value.trim(); 

    const region = typeof layMienTheoThanhPho === 'function' 

        ? layMienTheoThanhPho(location) 

        : ''; 

 

    const newPost = { 

        id: Date.now(), 

        ownerEmail: user.email, 

        name: form.querySelector('[name="name"]').value.trim(), 

        cat: form.querySelector('[name="cat"]').value, 

        price: parseInt(form.querySelector('[name="price"]').value) || 0, 

        qty: form.querySelector('[name="qty"]').value.trim() || '1', 

        desc: form.querySelector('[name="desc"]').value.trim(), 

        image: form.querySelector('[name="image"]').value.trim() || 'https://via.placeholder.com/400x300?text=Cho+Tot', 

        seller: form.querySelector('[name="seller"]').value.trim(), 

        phone: form.querySelector('[name="phone"]').value.trim(), 

        location: location, 

        region: region, 

        createdAt: new Date().toISOString() 

    }; 

 

    if (!newPost.name || newPost.price <= 0 || !newPost.phone || !newPost.location) { 

        showToast('⚠️ Vui lòng nhập đầy đủ tên, giá, số điện thoại và địa chỉ!'); 

        return; 

    } 

 

    if (!newPost.region) { 

        showToast('⚠️ Địa chỉ chưa xác định được miền. Hãy nhập đúng tỉnh/thành phố!'); 

        return; 

    } 

 

    if (typeof themBaiDangMoi === 'function') { 

        themBaiDangMoi(newPost); 

    } else { 

        const data = localStorage.getItem('userPosts'); 

        const posts = data ? JSON.parse(data) : []; 

        posts.unshift(newPost); 

        localStorage.setItem('userPosts', JSON.stringify(posts)); 

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

        ? layDanhSachThongBaoCuaUser() 

        : []; 

 

    if (thongBaos.length === 0) { 

        container.innerHTML = ` 

            <div style="text-align:center; padding:60px 20px; color:#888; background:#fff; 

                        border-radius:14px; border:1px dashed #ddd; max-width:800px; margin:0 auto;"> 

                <div style="font-size:64px; margin-bottom:12px;">🔔</div> 

                <h2 style="color:#666; margin-bottom:8px;">Chưa có thông báo nào</h2> 

                <p style="color:#999;">Khi có người quan tâm đến sản phẩm của bạn, thông báo sẽ hiện ở đây.</p> 

            </div> 

        `; 

        return; 

    } 

 

    let html = '<div style="max-width:800px; margin:0 auto;">'; 

 

    thongBaos.forEach((tb, idx) => { 

        const time = new Date(tb.time); 

        const timeText = tinhThoiGianThongBao(time); 

        const fromEmail = tb.fromEmail || ''; 

 

        html += ` 

            <div class="noti-card" data-from-email="${escapeHtml(fromEmail)}"  

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

            </div> 

        `; 

    }); 

 

    html += '</div>'; 

    container.innerHTML = html; 

 

    // ★ Gắn sự kiện click để mở modal thông tin liên hệ 

    container.querySelectorAll('.noti-card').forEach(card => { 

        card.addEventListener('click', () => { 

            const fromEmail = card.dataset.fromEmail; 

            const fromUser = card.dataset.fromUser; 

            const productName = card.dataset.productName; 

 

            moModalThongTinNguoiMua(fromEmail, fromUser, productName); 

        }); 

    }); 

} 

 

/* ======================================================================== 

   ★ MODAL THÔNG TIN NGƯỜI MUA (khi click vào 1 thông báo) 

   ======================================================================== */ 

function moModalThongTinNguoiMua(fromEmail, fromUser, productName) { 
   // Xóa modal cũ nếu có 
   const oldModal = document.getElementById('modalNguoiMua'); 
   if (oldModal) oldModal.remove(); 
 
   // Lấy thông tin user 
   let userInfo = null; 
   if (fromEmail && typeof layThongTinUserTheoEmail === 'function') { 
       userInfo = layThongTinUserTheoEmail(fromEmail); 
   } 
 
   // Fallback nếu không tìm thấy user 
   if (!userInfo) { 
       userInfo = { 
           name: fromUser || 'Người dùng', 
           phone: '', 
           city: '', 
           region: '', 
           role: '' 
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
 
   const roleDisplay = userInfo.role === 'seller' 
       ? '💰 Người bán' 
       : userInfo.role === 'buyer' ? '🛒 Người mua' : 'Thành viên'; 
 
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
                   <p style="color:#555; font-size:13px; margin-top:4px;"> 
                       ${roleDisplay} 
                   </p> 
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
                       <button type="button" class="btn-add-cart" onclick="dongModalNguoiMua()"> 
                           Đóng 
                       </button> 
                   </div> 
               </div> 
           </div> 
       </div> 
   `; 
 
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

   RENDER BÀI ĐĂNG NGƯỜI DÙNG 

   ======================================================================== */ 

function renderBaiDangNguoiDungLenGrid() { 

    const grid = document.querySelector('.product-grid'); 

    if (!grid) return; 

 

    let posts = []; 

 

    if (typeof layDanhSachBaiDang === 'function') { 

        posts = layDanhSachBaiDang(); 

    } else { 

        const data = localStorage.getItem('userPosts'); 

        posts = data ? JSON.parse(data) : []; 

    } 

 

    if (!posts || posts.length === 0) return; 

 

    const fileName = window.location.pathname.toLowerCase().split('/').pop(); 

    const pageCategoryMap = { 

        'idea.html': null, 

        'dientu.html': 'dientu', 

        'phuongtien.html': 'phuongtien', 

        'trangphuc.html': 'trangphuc', 

        'vatdung.html': 'vatdung' 

    }; 

 

    const currentCategory = pageCategoryMap[fileName]; 

 

    posts.forEach(post => { 

        if (currentCategory && post.cat !== currentCategory) return; 

        if (grid.querySelector(`[data-id="${post.id}"]`)) return; 

        grid.insertAdjacentHTML('afterbegin', taoHtmlCardSanPham(post)); 

    }); 

} 

 

function taoHtmlCardSanPham(product) { 

    return ` 

        <div class="product-card" 

             data-id="${escapeHtml(product.id)}" 

             data-cat="${escapeHtml(product.cat)}" 

             data-name="${escapeHtml(product.name)}" 

             data-price="${Number(product.price) || 0}" 

             data-desc="${escapeHtml(product.desc)}" 

             data-seller="${escapeHtml(product.seller)}" 

             data-phone="${escapeHtml(product.phone)}" 

             data-location="${escapeHtml(product.location)}" 

             data-qty="${escapeHtml(product.qty || '1')}"> 

            <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" class="card-img"> 

            <div class="card-actions"> 

                <button class="card-btn btn-cart" type="button">🛒</button> 

            </div> 

            <div class="card-body"> 

                <h3>${escapeHtml(product.name)}</h3> 

                <p class="price">₫${(Number(product.price) || 0).toLocaleString()}</p> 

            </div> 

        </div> 

    `; 

} 

 

/* ======================================================================== 

   HELPER CHỐNG CHÈN HTML LẠ 

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
