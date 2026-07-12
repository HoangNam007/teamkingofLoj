/* ======================================================================== 

   LUUTRU.JS - Quản lý dữ liệu localStorage 

   ------------------------------------------------------------------------ 

   Vai trò: 

   - Lưu danh sách tài khoản 

   - Lưu user đang đăng nhập 

   - Mỗi user có giỏ hàng riêng 

   - Mỗi user có danh sách yêu thích riêng 

   - Lưu tin đăng người dùng tạo 

   - Lưu thông báo riêng cho từng người bán (MỚI) 

   ======================================================================== */ 

 

const STORAGE_KEYS = { 

    USERS: 'users', 

    CURRENT_USER: 'currentUser', 

    POSTS: 'userPosts', 

    NOTIFICATIONS: 'userNotifications'   // MỚI: thông báo theo từng user 

}; 

 

/* ======================================================================== 

   ĐỌC / GHI JSON AN TOÀN 

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

        phone: (user.phone || '').toString().trim(),   // ★ MỚI 

        role: user.role || 'buyer', 

        city: user.city || '', 

        region: user.region || '', 

        cart: Array.isArray(user.cart) ? user.cart : [], 

        favorites: Array.isArray(user.favorites) ? user.favorites : [], 

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

    const normalizedUsers = users.map(chuanHoaUserStorage); 

    ghiJSON(STORAGE_KEYS.USERS, normalizedUsers); 

} 

 

function timUserTheoEmail(email) { 

    const normalizedEmail = chuanHoaEmailStorage(email); 

    return layDanhSachUsers().find(u => u.email === normalizedEmail) || null; 

} 

 

function emailDaTonTai(email) { 

    return timUserTheoEmail(email) !== null; 

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

 

    users[index] = chuanHoaUserStorage({ 

        ...users[index], 

        ...dataMoi 

    }); 

 

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

 

    const updatedUser = chuanHoaUserStorage({ 

        ...user, 

        ...dataMoi 

    }); 

 

    datUserHienTai(updatedUser); 

    capNhatUser(updatedUser.email, updatedUser); 

    return true; 

} 

 

/* ======================================================================== 

   GIỎ HÀNG THEO TỪNG TÀI KHOẢN 

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

   YÊU THÍCH THEO TỪNG TÀI KHOẢN 

   ======================================================================== */ 

function layDanhSachYeuThich() { 

    const user = layUserHienTai(); 

    if (!user) return []; 

    return Array.isArray(user.favorites) ? user.favorites : []; 

} 

 

function luuDanhSachYeuThich(favorites) { 

    const user = layUserHienTai(); 

    if (!user) return false; 

 

    if (!Array.isArray(favorites)) favorites = []; 

 

    user.favorites = favorites; 

    datUserHienTai(user); 

    capNhatUser(user.email, { favorites: favorites }); 

    return true; 

} 

 

/* ======================================================================== 

   TIN ĐĂNG NGƯỜI DÙNG 

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

    const posts = layDanhSachBaiDang(); 

 

    const defaultImg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23f5f5f5'/><text x='50%25' y='50%25' font-family='Arial,sans-serif' font-size='24' fill='%23bbb' text-anchor='middle' dominant-baseline='middle'>Chợ Tốt</text></svg>"; 

 

    const newPost = { 

        id: post.id || Date.now(), 

        ownerEmail: post.ownerEmail || user?.email || '', 

        name: post.name || '', 

        cat: post.cat || 'vatdung', 

        price: Number(post.price) || 0, 

        qty: post.qty || '1', 

        desc: post.desc || '', 

        image: post.image || defaultImg,   // ★ SỬA 

        seller: post.seller || user?.name || '', 

        phone: post.phone || '', 

        location: post.location || user?.city || '', 

        region: post.region || user?.region || '', 

        facebook: post.facebook || '', 

        createdAt: post.createdAt || new Date().toISOString(), 

        updatedAt: null, 

        status: 'active' 

    }; 

 

    posts.unshift(newPost); 

    luuDanhSachBaiDang(posts); 

 

    if (user) { 

        const userPosts = Array.isArray(user.posts) ? user.posts : []; 

        userPosts.unshift(newPost.id); 

        capNhatUserHienTai({ posts: userPosts }); 

    } 

 

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

 

    posts[index] = { 

        ...posts[index], 

        ...dataMoi, 

        updatedAt: new Date().toISOString() 

    }; 

 

    luuDanhSachBaiDang(posts); 

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

 

    const newUserPosts = (user.posts || []).filter(postId => String(postId) !== String(id)); 

    capNhatUserHienTai({ posts: newUserPosts }); 

 

    return true; 

} 

 

/* ======================================================================== 

   ★★★ THÔNG BÁO THEO TỪNG NGƯỜI BÁN (MỚI) ★★★ 

   ------------------------------------------------------------------------ 

   Cấu trúc 1 thông báo: 

   { 

       id: số, 

       toEmail: email người bán nhận thông báo, 

       fromUser: tên người quan tâm, 

       productName: tên sản phẩm, 

       time: ISO string, 

       read: true/false 

   } 

   ======================================================================== */ 

 

/** 

 * Thêm thông báo cho người bán khi có người thêm sản phẩm vào giỏ. 

 * @param {Object} noti - { toEmail, fromUser, productName } 

 */ 

function themThongBaoChoNguoiBan(noti) { 

    if (!noti || !noti.toEmail) return false; 

 

    const all = docJSON(STORAGE_KEYS.NOTIFICATIONS, []); 

    const list = Array.isArray(all) ? all : []; 

 

    list.unshift({ 

        id: Date.now() + Math.floor(Math.random() * 1000), 

        toEmail: chuanHoaEmailStorage(noti.toEmail), 

        fromUser: noti.fromUser || 'Người dùng', 

        fromEmail: chuanHoaEmailStorage(noti.fromEmail || ''),  // ★ MỚI 

        productName: noti.productName || 'Sản phẩm', 

        time: new Date().toISOString(), 

        read: false 

    }); 

 

    if (list.length > 100) list.length = 100; 

 

    ghiJSON(STORAGE_KEYS.NOTIFICATIONS, list); 

    capNhatBadgeThongBao(); 

    return true; 

} 

 

/** 

 * Lấy danh sách thông báo của user đang đăng nhập (mới nhất trước). 

 */ 

function layDanhSachThongBaoCuaUser() { 

    const user = layUserHienTai(); 

    if (!user) return []; 

 

    const all = docJSON(STORAGE_KEYS.NOTIFICATIONS, []); 

    if (!Array.isArray(all)) return []; 

 

    return all.filter(n => chuanHoaEmailStorage(n.toEmail) === user.email); 

} 

 

/** 

 * Đánh dấu tất cả thông báo của user hiện tại là đã đọc. 

 */ 

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

 

    if (changed) { 

        ghiJSON(STORAGE_KEYS.NOTIFICATIONS, all); 

    } 

 

    capNhatBadgeThongBao(); 

    return true; 

} 

 

/** 

 * Cập nhật badge chuông (#notiCount) = số thông báo CHƯA ĐỌC của user hiện tại. 

 */ 

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

 

/* Chạy sau cùng (setTimeout) để đè lên badge cũ của giaodien.js nếu còn */ 

document.addEventListener('DOMContentLoaded', () => { 

    setTimeout(capNhatBadgeThongBao, 50); 

}); 

/** 

 * Lấy thông tin chi tiết user để hiển thị (loại bỏ password). 

 * Dùng khi cần xem thông tin liên hệ người mua trong thông báo. 

 */ 

function layThongTinUserTheoEmail(email) { 

    const user = timUserTheoEmail(email); 

    if (!user) return null; 

 

    return { 

        name: user.name, 

        email: user.email, 

        phone: user.phone || '', 

        city: user.city, 

        region: user.region, 

        role: user.role 

    }; 

} 

 

/* ======================================================================== 

   RESET DEMO - chỉ dùng khi test 

   ======================================================================== */ 

function xoaTatCaDuLieuDemo() { 

    localStorage.removeItem(STORAGE_KEYS.USERS); 

    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER); 

    localStorage.removeItem(STORAGE_KEYS.POSTS); 

    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS); 

} 

 

 
