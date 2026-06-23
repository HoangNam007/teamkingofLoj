/* ========================================================================
   STORAGE.JS - Quản lý dữ liệu trên localStorage
   ------------------------------------------------------------------------
   Vai trò: Lớp trung gian giao tiếp với localStorage.
            Mọi thao tác lưu/đọc dữ liệu đều phải qua file này.
   Lợi ích: Sau này chuyển sang ASP.NET API chỉ cần sửa file này!
   ======================================================================== */

// ===== KEYS - Tên các "ngăn" lưu trong localStorage =====
const STORAGE_KEYS = {
    USERS: 'users',                  // Danh sách tất cả tài khoản
    CURRENT_USER: 'currentUser',     // User đang đăng nhập
    GUEST_CART: 'guestCart',         // Giỏ hàng khi chưa đăng nhập
    GUEST_FAVORITES: 'guestFavorites' // Yêu thích khi chưa đăng nhập
};

/* ========================================================================
   QUẢN LÝ DANH SÁCH USERS
   ======================================================================== */

// Lấy toàn bộ danh sách user đã đăng ký
function layDanhSachUsers() {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
}

// Lưu danh sách users
function luuDanhSachUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

// Tìm user theo email
function timUserTheoEmail(email) {
    const users = layDanhSachUsers();
    return users.find(u => u.email === email);
}

// Kiểm tra email đã tồn tại chưa
function emailDaTonTai(email) {
    return layDanhSachUsers().some(u => u.email === email);
}

// Thêm user mới vào danh sách
function themUserMoi(user) {
    const users = layDanhSachUsers();
    users.push(user);
    luuDanhSachUsers(users);
}

// Cập nhật thông tin user trong danh sách (theo email)
function capNhatUser(email, dataMoi) {
    const users = layDanhSachUsers();
    const index = users.findIndex(u => u.email === email);
    if (index > -1) {
        users[index] = { ...users[index], ...dataMoi };
        luuDanhSachUsers(users);
        return true;
    }
    return false;
}

/* ========================================================================
   QUẢN LÝ USER HIỆN TẠI (Đang đăng nhập)
   ======================================================================== */

// Lấy user đang đăng nhập (null nếu chưa login)
function layUserHienTai() {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
}

// Đặt user hiện tại (sau khi login thành công)
function datUserHienTai(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

// Xóa user hiện tại (đăng xuất)
function xoaUserHienTai() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

// Kiểm tra có đang đăng nhập không
function dangDangNhap() {
    return layUserHienTai() !== null;
}

/* ========================================================================
   QUẢN LÝ GIỎ HÀNG
   ------------------------------------------------------------------------
   - Nếu user đã login → lưu trong currentUser.cart
   - Nếu chưa login → lưu vào guestCart riêng (gộp vào user sau khi login)
   ======================================================================== */

// Lấy giỏ hàng của user hiện tại (hoặc guest)
function layGioHang() {
    const user = layUserHienTai();
    if (user) {
        return user.cart || [];
    }
    // Guest: lấy từ guestCart
    const data = localStorage.getItem(STORAGE_KEYS.GUEST_CART);
    return data ? JSON.parse(data) : [];
}

// Lưu giỏ hàng
function luuGioHang(cart) {
    const user = layUserHienTai();
    if (user) {
        // User đã login → cập nhật vào currentUser VÀ vào users[]
        user.cart = cart;
        datUserHienTai(user);
        capNhatUser(user.email, { cart: cart });
    } else {
        // Guest → lưu riêng
        localStorage.setItem(STORAGE_KEYS.GUEST_CART, JSON.stringify(cart));
    }
}

// Gộp guestCart vào user khi đăng nhập
function gopGuestCartVaoUser() {
    const guestCart = JSON.parse(localStorage.getItem(STORAGE_KEYS.GUEST_CART)) || [];
    if (guestCart.length === 0) return;

    const user = layUserHienTai();
    if (!user) return;

    const userCart = user.cart || [];
    const mergedCart = [...userCart, ...guestCart];

    user.cart = mergedCart;
    datUserHienTai(user);
    capNhatUser(user.email, { cart: mergedCart });

    // Xóa guestCart
    localStorage.removeItem(STORAGE_KEYS.GUEST_CART);
}

/* ========================================================================
   QUẢN LÝ YÊU THÍCH (FAVORITES)
   ======================================================================== */

// Lấy danh sách yêu thích
function layDanhSachYeuThich() {
    const user = layUserHienTai();
    if (user) {
        return user.favorites || [];
    }
    const data = localStorage.getItem(STORAGE_KEYS.GUEST_FAVORITES);
    return data ? JSON.parse(data) : [];
}

// Lưu danh sách yêu thích
function luuDanhSachYeuThich(favorites) {
    const user = layUserHienTai();
    if (user) {
        user.favorites = favorites;
        datUserHienTai(user);
        capNhatUser(user.email, { favorites: favorites });
    } else {
        localStorage.setItem(STORAGE_KEYS.GUEST_FAVORITES, JSON.stringify(favorites));
    }
}

// Gộp guestFavorites vào user khi đăng nhập
function gopGuestFavoritesVaoUser() {
    const guestFavs = JSON.parse(localStorage.getItem(STORAGE_KEYS.GUEST_FAVORITES)) || [];
    if (guestFavs.length === 0) return;

    const user = layUserHienTai();
    if (!user) return;

    const userFavs = user.favorites || [];
    // Tránh trùng lặp khi gộp (theo id)
    const merged = [...userFavs];
    guestFavs.forEach(gFav => {
        if (!merged.some(f => f.id === gFav.id)) {
            merged.push(gFav);
        }
    });

    user.favorites = merged;
    datUserHienTai(user);
    capNhatUser(user.email, { favorites: merged });

    localStorage.removeItem(STORAGE_KEYS.GUEST_FAVORITES);
}