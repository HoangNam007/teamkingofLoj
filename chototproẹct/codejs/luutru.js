/* ========================================================================
   LUUTRU.JS - Quản lý dữ liệu localStorage
   ======================================================================== */

const STORAGE_KEYS = {
    USERS: 'users',
    CURRENT_USER: 'currentUser',
    POSTS: 'userPosts',
    NOTIFICATIONS: 'userNotifications'
};

/* ========================================================================
   FORMAT GIÁ TIỀN
   ======================================================================== */
function formatGiaTien(gia) {
    const n = Math.round(Number(gia) || 0);
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/* ========================================================================
   ĐỌC / GHI JSON
   ======================================================================== */
function docJSON(key, fallbackValue) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallbackValue;
    } catch (error) {
        console.warn('Lỗi đọc localStorage:', key, error);
        return fallbackValue;
    }
}

function ghiJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.warn('Lỗi ghi localStorage:', key, error);
        return false;
    }
}

/* ========================================================================
   CHUẨN HÓA USER
   ======================================================================== */
function chuanHoaEmailStorage(email) {
    return (email || '').toString().trim().toLowerCase();
}

function chuanHoaUserStorage(user) {
    return {
        id: user.id || Date.now(),
        name: user.name || user.fullName || '',
        email: chuanHoaEmailStorage(user.email),
        password: user.password || '',
        phone: (user.phone || '').toString().trim(),
        role: user.role || 'member',
        city: user.city || '',
        region: user.region || '',
        cart: Array.isArray(user.cart) ? user.cart : [],
        posts: Array.isArray(user.posts) ? user.posts : [],
        createdAt: user.createdAt || new Date().toISOString()
    };
}

/* ========================================================================
   USERS
   ======================================================================== */
function layDanhSachUsers() {
    const users = docJSON(STORAGE_KEYS.USERS, []);
    if (!Array.isArray(users)) return [];
    return users.map(chuanHoaUserStorage);
}

function luuDanhSachUsers(users) {
    if (!Array.isArray(users)) users = [];
    ghiJSON(STORAGE_KEYS.USERS, users.map(chuanHoaUserStorage));
}

function timUserTheoEmail(email) {
    const normalizedEmail = chuanHoaEmailStorage(email);
    return layDanhSachUsers().find(u => u.email === normalizedEmail) || null;
}

function emailDaTonTai(email, excludeEmail) {
    if (!email) return false;
    const normalizedEmail = chuanHoaEmailStorage(email);
    const normalizedExclude = excludeEmail ? chuanHoaEmailStorage(excludeEmail) : '';

    return layDanhSachUsers().some(u => {
        if (normalizedExclude && u.email === normalizedExclude) return false;
        return u.email === normalizedEmail;
    });
}

function phoneDaTonTai(phone, excludeEmail) {
    if (!phone) return false;
    const cleanPhone = phone.toString().trim().replace(/\s+/g, '').replace(/-/g, '');
    const normalizedExclude = excludeEmail ? chuanHoaEmailStorage(excludeEmail) : '';

    return layDanhSachUsers().some(u => {
        if (normalizedExclude && u.email === normalizedExclude) return false;
        const userPhone = (u.phone || '').toString().trim().replace(/\s+/g, '').replace(/-/g, '');
        return userPhone === cleanPhone;
    });
}

function themUserMoi(user) {
    const users = layDanhSachUsers();
    users.push(chuanHoaUserStorage(user));
    luuDanhSachUsers(users);
}

function capNhatUser(email, dataMoi) {
    const normalizedEmail = chuanHoaEmailStorage(email);
    const users = layDanhSachUsers();
    const index = users.findIndex(u => u.email === normalizedEmail);
    if (index === -1) return false;

    users[index] = chuanHoaUserStorage({ ...users[index], ...dataMoi });
    luuDanhSachUsers(users);
    return true;
}

/* ========================================================================
   CURRENT USER
   ======================================================================== */
function layUserHienTai() {
    const user = docJSON(STORAGE_KEYS.CURRENT_USER, null);
    if (!user) return null;
    return chuanHoaUserStorage(user);
}

function datUserHienTai(user) {
    if (!user) return;
    ghiJSON(STORAGE_KEYS.CURRENT_USER, chuanHoaUserStorage(user));
}

function xoaUserHienTai() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

function dangDangNhap() {
    return layUserHienTai() !== null;
}

function capNhatUserHienTai(dataMoi) {
    const user = layUserHienTai();
    if (!user) return false;

    const updatedUser = chuanHoaUserStorage({ ...user, ...dataMoi });
    datUserHienTai(updatedUser);
    capNhatUser(updatedUser.email, updatedUser);
    return true;
}

function layThongTinUserTheoEmail(email) {
    const user = timUserTheoEmail(email);
    if (!user) return null;
    return {
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        city: user.city,
        region: user.region
    };
}

/* ========================================================================
   GIỎ HÀNG
   ======================================================================== */
function layGioHang() {
    const user = layUserHienTai();
    if (!user) return [];
    return Array.isArray(user.cart) ? user.cart : [];
}

function luuGioHang(cart) {
    const user = layUserHienTai();
    if (!user) return false;
    if (!Array.isArray(cart)) cart = [];

    user.cart = cart;
    datUserHienTai(user);
    capNhatUser(user.email, { cart: cart });
    return true;
}

/* ========================================================================
   TIN ĐĂNG
   ======================================================================== */
function layDanhSachBaiDang() {
    const posts = docJSON(STORAGE_KEYS.POSTS, []);
    return Array.isArray(posts) ? posts : [];
}

function luuDanhSachBaiDang(posts) {
    if (!Array.isArray(posts)) posts = [];
    ghiJSON(STORAGE_KEYS.POSTS, posts);
}

function themBaiDangMoi(post) {
    const user = layUserHienTai();

    // Bắt buộc phải đăng nhập
    if (!user) {
        console.warn('Chưa đăng nhập → không thể đăng tin');
        return null;
    }

    const posts = layDanhSachBaiDang();

    const defaultImg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23f5f5f5'/><text x='50%25' y='50%25' font-family='Arial,sans-serif' font-size='24' fill='%23bbb' text-anchor='middle' dominant-baseline='middle'>Chợ Tốt</text></svg>";

    const newPost = {
        id: post.id || Date.now(),
        ownerEmail: user.email,   // ★ Luôn lấy từ user hiện tại
        name: post.name || '',
        cat: post.cat || 'vatdung',
        price: Math.round(Number(post.price)) || 0,
        weight: (post.weight || '').toString().trim(),   // Giữ nguyên chuỗi (cho phép 2.5)
        desc: post.desc || '',
        image: post.image || defaultImg,
        seller: post.seller || user.name || '',
        phone: post.phone || user.phone || '',
        location: post.location || user.city || '',
        detailAddress: (post.detailAddress || '').toString().trim(),
        region: post.region || user.region || '',
        facebook: post.facebook || '',
        createdAt: post.createdAt || new Date().toISOString(),
        updatedAt: null,
        status: 'active'
    };

    posts.unshift(newPost);
    luuDanhSachBaiDang(posts);

    // Cập nhật posts của user
    const userPosts = Array.isArray(user.posts) ? user.posts : [];
    userPosts.unshift(newPost.id);
    capNhatUserHienTai({ posts: userPosts });

    return newPost;
}

function layBaiDangTheoId(id) {
    return layDanhSachBaiDang().find(p => String(p.id) === String(id)) || null;
}

function layBaiDangCuaUserHienTai() {
    const user = layUserHienTai();
    if (!user) return [];
    return layDanhSachBaiDang().filter(p => p.ownerEmail === user.email);
}

function capNhatBaiDang(id, dataMoi) {
    const user = layUserHienTai();
    if (!user) return false;

    const posts = layDanhSachBaiDang();
    const index = posts.findIndex(p => String(p.id) === String(id));
    if (index === -1) return false;
    if (posts[index].ownerEmail !== user.email) return false;

    // Chuẩn hóa các field
    if (dataMoi.price !== undefined) {
        dataMoi.price = Math.round(Number(dataMoi.price)) || 0;
    }
    if (dataMoi.weight !== undefined) {
        dataMoi.weight = (dataMoi.weight || '').toString().trim();
    }
    if (dataMoi.detailAddress !== undefined) {
        dataMoi.detailAddress = (dataMoi.detailAddress || '').toString().trim();
    }

    posts[index] = {
        ...posts[index],
        ...dataMoi,
        updatedAt: new Date().toISOString()
    };

    luuDanhSachBaiDang(posts);

    // ★ Đồng bộ vào giỏ hàng của user khác đang có SP này
    dongBoSanPhamTrongGioTatCaUser(id, posts[index]);

    return true;
}

function xoaBaiDang(id) {
    const user = layUserHienTai();
    if (!user) return false;

    const posts = layDanhSachBaiDang();
    const post = posts.find(p => String(p.id) === String(id));
    if (!post) return false;
    if (post.ownerEmail !== user.email) return false;

    const newPosts = posts.filter(p => String(p.id) !== String(id));
    luuDanhSachBaiDang(newPosts);

    const newUserPosts = (user.posts || []).filter(pid => String(pid) !== String(id));
    capNhatUserHienTai({ posts: newUserPosts });
    return true;
}

/* ========================================================================
   ĐỒNG BỘ THÔNG TIN SP TRONG GIỎ HÀNG CỦA MỌI USER
   ------------------------------------------------------------------------
   Khi 1 tin được sửa → các giỏ hàng có SP này (của user khác) cũng update.
   ======================================================================== */
function dongBoSanPhamTrongGioTatCaUser(postId, postMoi) {
    const allUsers = layDanhSachUsers();
    let changed = false;

    allUsers.forEach(u => {
        if (!Array.isArray(u.cart)) return;

        u.cart.forEach(item => {
            if (String(item.id) === String(postId)) {
                // Cập nhật snapshot theo bài đăng mới
                item.name = postMoi.name;
                item.price = postMoi.price;
                item.weight = postMoi.weight;
                item.desc = postMoi.desc;
                item.image = postMoi.image;
                item.location = postMoi.location;
                item.detailAddress = postMoi.detailAddress;
                item.region = postMoi.region;
                item.seller = postMoi.seller;
                item.phone = postMoi.phone;
                item.facebook = postMoi.facebook;
                changed = true;
            }
        });
    });

    if (changed) luuDanhSachUsers(allUsers);
}

/* ========================================================================
   THÔNG BÁO
   ======================================================================== */
function themThongBaoChoNguoiBan(noti) {
    if (!noti || !noti.toEmail) return false;

    const all = docJSON(STORAGE_KEYS.NOTIFICATIONS, []);
    const list = Array.isArray(all) ? all : [];

    list.unshift({
        id: Date.now() + Math.floor(Math.random() * 1000),
        toEmail: chuanHoaEmailStorage(noti.toEmail),
        fromUser: noti.fromUser || 'Người dùng',
        fromEmail: chuanHoaEmailStorage(noti.fromEmail || ''),
        productName: noti.productName || 'Sản phẩm',
        time: new Date().toISOString(),
        read: false
    });

    if (list.length > 100) list.length = 100;

    ghiJSON(STORAGE_KEYS.NOTIFICATIONS, list);
    capNhatBadgeThongBao();
    return true;
}

function layDanhSachThongBaoCuaUser() {
    const user = layUserHienTai();
    if (!user) return [];

    const all = docJSON(STORAGE_KEYS.NOTIFICATIONS, []);
    if (!Array.isArray(all)) return [];

    return all.filter(n => chuanHoaEmailStorage(n.toEmail) === user.email);
}

function danhDauThongBaoDaDoc() {
    const user = layUserHienTai();
    if (!user) return false;

    const all = docJSON(STORAGE_KEYS.NOTIFICATIONS, []);
    if (!Array.isArray(all)) return false;

    let changed = false;
    all.forEach(n => {
        if (chuanHoaEmailStorage(n.toEmail) === user.email && !n.read) {
            n.read = true;
            changed = true;
        }
    });

    if (changed) ghiJSON(STORAGE_KEYS.NOTIFICATIONS, all);
    capNhatBadgeThongBao();
    return true;
}

function capNhatBadgeThongBao() {
    const badges = document.querySelectorAll('#notiCount');
    if (!badges || badges.length === 0) return;

    const user = layUserHienTai();
    let unread = 0;
    if (user) {
        unread = layDanhSachThongBaoCuaUser().filter(n => !n.read).length;
    }

    badges.forEach(badge => {
        badge.textContent = unread;
        badge.style.display = unread > 0 ? 'flex' : 'none';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(capNhatBadgeThongBao, 50);
});

/* ========================================================================
   RESET DEMO
   ======================================================================== */
function xoaTatCaDuLieuDemo() {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.POSTS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
}
