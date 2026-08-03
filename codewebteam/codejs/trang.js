/* ========================================================================
   TRANG.JS - Router chính + logic từng trang
   ======================================================================== */

const TRANG_THAI_LOC = {
    keyword: '',
    category: 'all',
    region: 'all',
    page: 1,
    perPage: 30
};

/* ========================================================================
   CHẶN USER BỊ KHÓA VÀO CÁC TRANG BỊ CẤM
   ------------------------------------------------------------------------
   User bị chặn CHỈ được vào: thongbao.html, thongtin.html, taikhoan.html
   Các trang khác → hiện thông báo "Tài khoản đã bị khóa"
   ======================================================================== */
function chanUserBiKhoaNeuCan() {
    if (!dangDangNhap()) return false;
    if (!userHienTaiBiChan()) return false;

    // Các trang được phép truy cập khi bị chặn
    const trangDuocPhep = ['thongbao.html', 'thongtin.html', 'taikhoan.html'];
    const fileName = window.location.pathname.split('/').pop().toLowerCase();

    if (trangDuocPhep.includes(fileName)) return false;

    // Không thuộc trang được phép → ẩn nội dung, hiện thông báo
    const main = document.querySelector('main');
    if (main) {
        const lyDo = layLyDoBiChan();
        main.innerHTML = `
            <div style="max-width:600px; margin:80px auto; padding:40px; background:#fff; 
                        border-radius:12px; text-align:center; border:2px solid #dc3545;">
                <div style="font-size:80px; margin-bottom:20px;">🔒</div>
                <h2 style="color:#dc3545; margin-bottom:15px;">Tài khoản đã bị khóa</h2>
                <p style="color:#555; margin-bottom:10px;">
                    Bạn không thể sử dụng chức năng này.
                </p>
                <p style="color:#333; padding:15px; background:#fff3cd; border-radius:8px; margin:20px 0;">
                    <strong>Lý do:</strong> ${lyDo}
                </p>
                <a href="thongbao.html" style="display:inline-block; padding:10px 20px; 
                   background:#ff8a00; color:#fff; text-decoration:none; border-radius:5px; margin:5px;">
                    🔔 Xem thông báo
                </a>
                <a href="thongtin.html" style="display:inline-block; padding:10px 20px; 
                   background:#666; color:#fff; text-decoration:none; border-radius:5px; margin:5px;">
                    👤 Trang cá nhân
                </a>
            </div>
        `;
    }

    return true; // Đã chặn
}

document.addEventListener('DOMContentLoaded', () => {
    capNhatNutAuth();
    capNhatBadgeGioHang();
    capNhatBadgeThongBao();

    if (chanUserBiKhoaNeuCan()) return;
    const trang = nhanBietTrang();

    switch (trang) {
        case 'home': khoiTaoTrangChu(); break;
        case 'detail': break;
        case 'cart': khoiTaoTrangGioHang(); break;
        case 'auth': break;
        case 'post': khoiTaoTrangDangTin(); break;
        case 'myposts': khoiTaoTrangTinCuaToi(); break;
        case 'notifications': khoiTaoTrangThongBao(); break;
        case 'profile': khoiTaoTrangThongTin(); break;
        case 'admin': khoiTaoTrangAdmin(); break;
    }
});

function nhanBietTrang() {
    const path = window.location.pathname.toLowerCase();
    const fileName = path.split('/').pop() || 'idea.html';

    if (fileName === '' || fileName === 'idea.html' || fileName === 'index.html') return 'home';
    if (fileName === 'chitiet.html') return 'detail';
    if (fileName === 'giohang.html') return 'cart';
    if (fileName === 'taikhoan.html') return 'auth';
    if (fileName === 'dangtin.html') return 'post';
    if (fileName === 'tincuatoi.html') return 'myposts';
    if (fileName === 'thongbao.html') return 'notifications';
    if (fileName === 'thongtin.html') return 'profile';
    if (fileName === 'quanly.html') return 'admin';
    return 'other';}

/* TRANG CHỦ */
function khoiTaoTrangChu() {
    setupDropdownKhuVuc();
    setupDropdownDanhMuc();
    setupLocDanhMuc();
    setupLocKhuVuc();
    setupTimKiem();
    renderTrangChu();}

function renderTrangChu() {
    const grid = document.querySelector('.product-grid');
    if (!grid) return;

    let posts = layDanhSachBaiDang().filter(p => (p.status || 'active') === 'active');

    const users = layDanhSachUsers();
    const emailBiChan = users.filter(u => u.blocked === true).map(u => chuanHoaEmail(u.email));
    posts = posts.filter(p => !emailBiChan.includes(chuanHoaEmail(p.ownerEmail)));

    posts = posts.filter(p => {
        const matchName = TRANG_THAI_LOC.keyword === '' ||
            (p.name || '').toLowerCase().includes(TRANG_THAI_LOC.keyword);
        const matchCat = TRANG_THAI_LOC.category === 'all' || p.cat === TRANG_THAI_LOC.category;
        const matchRegion = TRANG_THAI_LOC.region === 'all' || p.region === TRANG_THAI_LOC.region;
        return matchName && matchCat && matchRegion;
    });

    updateSectionTitle();

    if (posts.length === 0) {
        grid.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:60px 20px; color:#888;">
                <div style="font-size:64px; margin-bottom:12px;">🔎</div>
                <h2>Không tìm thấy sản phẩm phù hợp</h2>
            </div>`;
        anPagination();
        return;}

    const totalPages = Math.ceil(posts.length / TRANG_THAI_LOC.perPage);
    if (TRANG_THAI_LOC.page > totalPages) TRANG_THAI_LOC.page = totalPages;
    if (TRANG_THAI_LOC.page < 1) TRANG_THAI_LOC.page = 1;

    const start = (TRANG_THAI_LOC.page - 1) * TRANG_THAI_LOC.perPage;
    const end = start + TRANG_THAI_LOC.perPage;
    const postsToShow = posts.slice(start, end);

    let html = '';
    postsToShow.forEach(post => {
        html += `
            <div class="product-card" 
                 onclick="window.location.href='chitiet.html?id=${post.id}'"
                 style="cursor:pointer;">
                <img src="${post.image}" alt="${post.name}" class="card-img">
                <div class="card-body">
                    <h3>${post.name}</h3>
                    <p class="price">₫${formatGiaTien(post.price)}</p>
                </div>
            </div>`;
    });
    grid.innerHTML = html;

    renderPagination(totalPages);}

function updateSectionTitle() {
    const sectionTitle = document.getElementById('sectionTitle');
    if (!sectionTitle) return;

    const tenDanhMuc = {
        all: 'Sản phẩm mới nhất',
        dientu: 'Thiết bị Điện tử',
        phuongtien: 'Phương tiện',
        trangphuc: 'Trang phục',
        vatdung: 'Vật dụng gia đình',
        khac: 'Khác'};

    if (TRANG_THAI_LOC.keyword) {
        sectionTitle.textContent = `Kết quả tìm kiếm cho "${TRANG_THAI_LOC.keyword}"`;
    } else if (TRANG_THAI_LOC.region !== 'all') {
        sectionTitle.textContent = `Sản phẩm tại ${TRANG_THAI_LOC.region}`;
    } else if (TRANG_THAI_LOC.category !== 'all') {
        sectionTitle.textContent = tenDanhMuc[TRANG_THAI_LOC.category] || 'Sản phẩm';
    } else {
        sectionTitle.textContent = 'Sản phẩm mới nhất';}
}

function renderPagination(totalPages) {
    const grid = document.querySelector('.product-grid');
    if (!grid) return;
    anPagination();
    if (totalPages <= 1) return;

    const pagination = document.createElement('div');
    pagination.id = 'paginationContainer';

    let html = '';
    if (TRANG_THAI_LOC.page > 1) {
        html += `<button class="btn-page" onclick="chuyenTrang(${TRANG_THAI_LOC.page - 1})">« Trước</button>`;
    }
    for (let i = 1; i <= totalPages; i++) {
        const activeClass = i === TRANG_THAI_LOC.page ? 'active' : '';
        html += `<button class="btn-page ${activeClass}" onclick="chuyenTrang(${i})">${i}</button>`;
    }
    if (TRANG_THAI_LOC.page < totalPages) {
        html += `<button class="btn-page" onclick="chuyenTrang(${TRANG_THAI_LOC.page + 1})">Sau »</button>`;
    }

    pagination.innerHTML = html;
    grid.parentNode.insertBefore(pagination, grid.nextSibling);
}

function chuyenTrang(page) {
    TRANG_THAI_LOC.page = page;
    renderTrangChu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function anPagination() {
    const old = document.getElementById('paginationContainer');
    if (old) old.remove();
}

function setupTimKiem() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', () => {
        TRANG_THAI_LOC.keyword = searchInput.value.toLowerCase().trim();
        TRANG_THAI_LOC.page = 1;
        renderTrangChu();
    });
}

function setupLocDanhMuc() {
    const categoryDropdown = document.getElementById('categoryDropdown');
    const categoryText = document.getElementById('categoryText');
    if (!categoryDropdown) return;

    const tenDanhMuc = {
        all: '📦 Tất cả',
        dientu: '📱 Điện tử',
        phuongtien: '🚗 Phương tiện',
        trangphuc: '👕 Trang phục',
        vatdung: '🏠 Vật dụng',
        khac: '🎁 Khác'
    };

    categoryDropdown.querySelectorAll('div[data-cat]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const cat = item.dataset.cat;
            TRANG_THAI_LOC.category = cat;
            TRANG_THAI_LOC.page = 1;
            if (categoryText) categoryText.textContent = tenDanhMuc[cat];
            categoryDropdown.classList.remove('show');
            renderTrangChu();
        });
    });
}

function setupLocKhuVuc() {
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
            renderTrangChu();
        });
    });
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
        return;
    }

    if (notLoggedIn) notLoggedIn.style.display = 'none';
    if (cartContent) cartContent.style.display = 'block';
    renderBangGioHang();
}

/* ========================================================================
   TRANG THÔNG BÁO
   ======================================================================== */
function khoiTaoTrangThongBao() {
    const container = document.getElementById('thongBaoList');
    if (!container) return;

    if (!dangDangNhap()) {
        container.innerHTML = `
            <div style="text-align:center; padding:60px 20px;">
                <div style="font-size:64px; margin-bottom:20px;">🔐</div>
                <h2 style="color:#666; margin-bottom:15px;">Vui lòng đăng nhập</h2>
                <a href="taikhoan.html" class="btn-explore">Đăng nhập ngay</a>
            </div>`;
        return;
    }

    // ★ MỚI: Nếu user bị chặn, hiện thông báo khóa tài khoản
    if (userHienTaiBiChan()) {
        const lyDo = layLyDoBiChan();
        container.innerHTML = `
            <div style="max-width:800px; margin:20px auto;">
                <div class="noti-card" style="border-left:4px solid #dc3545; background:#fff3cd;">
                    <div class="noti-icon" style="background:#f8d7da;">🔒</div>
                    <div class="noti-content">
                        <p class="noti-text" style="color:#dc3545; font-weight:bold; font-size:16px;">
                            Tài khoản của bạn đã bị Admin khóa
                        </p>
                        <p class="noti-text" style="color:#555; margin-top:8px;">
                            <strong>Lý do:</strong> ${lyDo}
                        </p>
                        <p class="noti-text" style="color:#888; font-size:13px; margin-top:8px;">
                            Bạn chỉ có thể xem thông báo này và đăng xuất. Vui lòng liên hệ Admin để được giải quyết.
                        </p>
                    </div>
                </div>
            </div>`;
        return;
    }

    danhDauThongBaoDaDoc();
    renderDanhSachThongBao();
}

function renderDanhSachThongBao() {
    const container = document.getElementById('thongBaoList');
    if (!container) return;

    const notis = layThongBaoCuaUser();

    if (notis.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔔</div>
                <h2>Chưa có thông báo nào</h2>
            </div>`;
        return;
    }

    let html = '<div style="max-width:800px; margin:0 auto;">';
    notis.forEach(tb => {
        const time = new Date(tb.time);
        const timeText = tinhThoiGian(time);

        html += `
            <div class="noti-card" style="cursor:default;">
                <div class="noti-icon">🛒</div>
                <div class="noti-content">
                    <p class="noti-text">
                        <strong>${tb.fromUserName}</strong> đã thêm sản phẩm 
                        <strong>"${tb.productName}"</strong> vào giỏ hàng
                    </p>
                    <p class="noti-text" style="font-size:13px; color:#555; margin-top:4px;">
                        📞 SĐT: <strong>${tb.fromUserPhone || 'Chưa cập nhật'}</strong>
                        &nbsp;•&nbsp;
                        📍 ${tb.fromUserCity || 'Chưa rõ'}
                    </p>
                    <small class="noti-time">${timeText}</small>
                </div>
            </div>`;
    });
    html += '</div>';
    container.innerHTML = html;
}

function tinhThoiGian(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return Math.floor(diff / 60) + ' phút trước';
    if (diff < 86400) return Math.floor(diff / 3600) + ' giờ trước';
    if (diff < 604800) return Math.floor(diff / 86400) + ' ngày trước';
    return date.toLocaleDateString('vi-VN');
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

    if (typeof setupTrangDangTin === 'function') {
        setupTrangDangTin();
    }
}

/* ========================================================================
   TRANG TIN CỦA TÔI
   ======================================================================== */
function khoiTaoTrangTinCuaToi() {
    const notLoggedIn = document.getElementById('notLoggedIn');
    const myPostsContent = document.getElementById('myPostsPageContent');

    if (!dangDangNhap()) {
        if (notLoggedIn) notLoggedIn.style.display = 'block';
        if (myPostsContent) myPostsContent.style.display = 'none';
        return;
    }

    if (notLoggedIn) notLoggedIn.style.display = 'none';
    if (myPostsContent) myPostsContent.style.display = 'block';

    if (typeof setupTrangTinCuaToi === 'function') {
        setupTrangTinCuaToi();
    }
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

    document.getElementById('profileName').textContent = user.name || 'Người dùng';

    const posts = layBaiDangCuaUserHienTai();
    const cart = layGioHang();
    const statPosts = document.getElementById('statPosts');
    const statCart = document.getElementById('statCart');
    if (statPosts) statPosts.textContent = posts.length;
    if (statCart) statCart.textContent = cart.length;

    document.getElementById('editName').value = user.name || '';
    document.getElementById('editEmail').value = user.email || '';
    document.getElementById('editPhone').value = user.phone || '';
    document.getElementById('editCity').value = user.city || '';

    const form = document.getElementById('profileForm');
    if (form && form.dataset.bound !== 'true') {
        form.dataset.bound = 'true';
        form.addEventListener('submit', xuLyLuuThongTin);
    }

    const btnLogout = document.getElementById('btnLogoutProfile');
    if (btnLogout && btnLogout.dataset.bound !== 'true') {
        btnLogout.dataset.bound = 'true';
        btnLogout.onclick = () => {
            if (!confirm('Bạn có chắc muốn đăng xuất?')) return;
            xoaUserHienTai();
            showToast('👋 Đã đăng xuất!', 'success');
            setTimeout(() => { window.location.href = 'idea.html'; }, 800);
        };
    }
}

function xuLyLuuThongTin(event) {
    event.preventDefault();
    const user = layUserHienTai();
    if (!user) return;

    const name = document.getElementById('editName').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    const city = document.getElementById('editCity').value;

    if (!name || !phone || !city) {
        showToast('⚠️ Vui lòng nhập đầy đủ thông tin!', 'warning');
        return;}

    if (name.length < 2) {
        showToast('❌ Họ tên phải có ít nhất 2 ký tự!', 'error');
        return;}

    if (!/^0[0-9]{9}$/.test(phone)) {
        showToast('❌ SĐT phải đủ 10 chữ số và bắt đầu bằng số 0!', 'error');
        return;}

    if (phoneDaTonTai(phone, user.email)) {
        showToast('❌ Số điện thoại này đã có người dùng!', 'error');
        return;}

    const region = layMienTheoThanhPho(city);
    if (!region) {
        showToast('❌ Tỉnh/thành không hợp lệ!', 'error');
        return;}

    capNhatUserHienTai({ name, phone, city, region });
    // ★ Đồng bộ tất cả posts + noti cũ của user này
    const updatedUser = layUserHienTai();
    dongBoPostTheoUser(updatedUser);
    dongBoThongBaoTheoUser(updatedUser);

    showToast('✅ Đã lưu thay đổi!', 'success');
    setTimeout(() => { location.reload(); }, 800);
}

/* TRANG ADMIN */
function khoiTaoTrangAdmin() {
    const notPermitted = document.getElementById('notPermitted');
    const adminContent = document.getElementById('adminContent');

    if (!dangDangNhap()) {
        if (adminContent) adminContent.style.display = 'none';
        if (notPermitted) notPermitted.style.display = 'block';
        return;
    }

    const user = layUserHienTai();
    if (!laAdmin(user)) {
        if (adminContent) adminContent.style.display = 'none';
        if (notPermitted) notPermitted.style.display = 'block';
        return;
    }

    if (notPermitted) notPermitted.style.display = 'none';
    if (adminContent) adminContent.style.display = 'block';

    if (typeof khoiTaoNoiDungAdmin === 'function') {
        khoiTaoNoiDungAdmin();
    }}