
const ADMIN_EMAILS = ['admin@gmail.com'];

function docJSON(key, mặcĐịnh) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : mặcĐịnh;
    } catch (e) {
        return mặcĐịnh;
    }
}

function ghiJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function chuanHoaEmail(email) {
    return (email || '').toString().trim().toLowerCase();
}

function formatGiaTien(gia) {
    const n = Math.round(Number(gia) || 0);
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function layDanhSachUsers() {
    return docJSON('users', []);
}

function luuDanhSachUsers(users) {
    ghiJSON('users', users);
}

function themUserMoi(user) {
    const users = layDanhSachUsers();
    users.push({
        id: Date.now(),
        name: user.name,
        email: chuanHoaEmail(user.email),
        password: user.password,
        phone: user.phone,
        city: user.city,
        region: user.region,
        createdAt: new Date().toISOString()
    });
    luuDanhSachUsers(users);
}

function emailDaTonTai(email, excludeEmail) {
    const emailChuan = chuanHoaEmail(email);
    const excludeChuan = excludeEmail ? chuanHoaEmail(excludeEmail) : '';
    return layDanhSachUsers().some(u => {
        const userEmail = chuanHoaEmail(u.email);
        if (excludeChuan && userEmail === excludeChuan) return false;
        return userEmail === emailChuan;
    });
}

function phoneDaTonTai(phone, excludeEmail) {
    const excludeChuan = excludeEmail ? chuanHoaEmail(excludeEmail) : '';
    return layDanhSachUsers().some(u => {
        if (excludeChuan && chuanHoaEmail(u.email) === excludeChuan) return false;
        return u.phone === phone;
    });
}

function capNhatUser(email, dataMoi) {
    const emailChuan = chuanHoaEmail(email);
    const users = layDanhSachUsers();
    const index = users.findIndex(u => chuanHoaEmail(u.email) === emailChuan);
    if (index === -1) return false;

    users[index] = { ...users[index], ...dataMoi };
    if (dataMoi.email) {
        users[index].email = chuanHoaEmail(dataMoi.email);
    }
    luuDanhSachUsers(users);
    return true;
}

function laAdmin(user) {
    if (!user || !user.email) return false;
    return ADMIN_EMAILS.includes(chuanHoaEmail(user.email));}

function layUserHienTai() {
    return docJSON('currentUser', null);
}

function datUserHienTai(user) {
    ghiJSON('currentUser', user);
}

function xoaUserHienTai() {
    localStorage.removeItem('currentUser');
}

function dangDangNhap() {
    return layUserHienTai() !== null;
}

function capNhatUserHienTai(dataMoi) {
    const user = layUserHienTai();
    if (!user) return false;
    const updated = { ...user, ...dataMoi };
    datUserHienTai(updated);
    capNhatUser(user.email, dataMoi);
    return true;
}

function layDanhSachBaiDang() {
    return docJSON('posts', []);}

function luuDanhSachBaiDang(posts) {
    ghiJSON('posts', posts);}

function themBaiDangMoi(post) {
    const user = layUserHienTai();
    if (!user) return null;

    const posts = layDanhSachBaiDang();
    const priceOriginal = Math.round(Number(post.price)) || 0;
    const priceDisplay = Math.round(priceOriginal * 1.05); 

    const newPost = {
        id: post.id || Date.now(),
        ownerEmail: chuanHoaEmail(user.email),
        name: post.name || '',
        cat: post.cat || 'vatdung',
        priceOriginal: priceOriginal, 
        price: priceDisplay,             
        desc: post.desc || '',
        image: post.image || '',
        seller: user.name || '',
        phone: user.phone || '',
        location: user.city || '',
        region: user.region || '',
        status: 'active',
        createdAt: new Date().toISOString()
    };

    posts.unshift(newPost);
    luuDanhSachBaiDang(posts);
    return newPost;
}
function layBaiDangTheoId(id) {
    return layDanhSachBaiDang().find(p => String(p.id) === String(id)) || null;}

function layBaiDangCuaUserHienTai() {
    const user = layUserHienTai();
    if (!user) return [];
    const emailChuan = chuanHoaEmail(user.email);
    return layDanhSachBaiDang().filter(p => chuanHoaEmail(p.ownerEmail) === emailChuan);
}

function capNhatBaiDang(id, dataMoi) {
    const user = layUserHienTai();
    if (!user) return false;

    const posts = layDanhSachBaiDang();
    const index = posts.findIndex(p => String(p.id) === String(id));
    if (index === -1) return false;
    if (chuanHoaEmail(posts[index].ownerEmail) !== chuanHoaEmail(user.email)) return false;

    posts[index] = { ...posts[index], ...dataMoi };
    if (dataMoi.price !== undefined) {
        posts[index].price = Number(dataMoi.price) || 0;
    }
    luuDanhSachBaiDang(posts);
    return true;
}

function danhDauDaBan(id) {
    const user = layUserHienTai();
    if (!user) return false;

    const posts = layDanhSachBaiDang();
    const index = posts.findIndex(p => String(p.id) === String(id));
    if (index === -1) return false;
    if (chuanHoaEmail(posts[index].ownerEmail) !== chuanHoaEmail(user.email)) return false;

    posts[index].status = 'sold';
    luuDanhSachBaiDang(posts);

    xoaNotiTheoPostId(id);
    return true;
}

function xoaBaiDang(id) {
    const user = layUserHienTai();
    if (!user) return false;

    const posts = layDanhSachBaiDang();
    const post = posts.find(p => String(p.id) === String(id));
    if (!post) return false;
    if (chuanHoaEmail(post.ownerEmail) !== chuanHoaEmail(user.email)) return false;

    const newPosts = posts.filter(p => String(p.id) !== String(id));
    luuDanhSachBaiDang(newPosts);

    xoaNotiTheoPostId(id);
    return true;
}

function chanUser(email, lyDo) {
    const users = layDanhSachUsers();
    const index = users.findIndex(u => chuanHoaEmail(u.email) === chuanHoaEmail(email));
    if (index === -1) return false;

    users[index].blocked = true;
    users[index].blockReason = lyDo || 'Không có lý do';
    users[index].blockedAt = new Date().toISOString();

    luuDanhSachUsers(users);
    return true;
}

function moKhoaUser(email) {
    const users = layDanhSachUsers();
    const index = users.findIndex(u => chuanHoaEmail(u.email) === chuanHoaEmail(email));
    if (index === -1) return false;

    users[index].blocked = false;
    users[index].blockReason = '';

    luuDanhSachUsers(users);
    return true;
}

function laBiChan(user) {
    if (!user) return false;
    return user.blocked === true;
}

function userHienTaiBiChan() {
    const user = layUserHienTai();
    if (!user) return false;

    const usersMoi = layDanhSachUsers();
    const userMoiNhat = usersMoi.find(u => chuanHoaEmail(u.email) === chuanHoaEmail(user.email));
    if (!userMoiNhat) return false;
    return userMoiNhat.blocked === true;
}

function layLyDoBiChan() {
    const user = layUserHienTai();
    if (!user) return '';
    const usersMoi = layDanhSachUsers();
    const userMoiNhat = usersMoi.find(u => chuanHoaEmail(u.email) === chuanHoaEmail(user.email));
    if (!userMoiNhat) return '';
    return userMoiNhat.blockReason || 'Không có lý do';
}

function tinhDoanhThuUser(userEmail) {
    const posts = layDanhSachBaiDang();
    const emailChuan = chuanHoaEmail(userEmail);

    let doanhThu = 0;  
    let loiNhuan = 0;  

    posts.forEach(p => {
        if (chuanHoaEmail(p.ownerEmail) === emailChuan && p.status === 'sold') {
            const giaGoc = p.priceOriginal || Math.round(p.price / 1.05);
            doanhThu += giaGoc;
            loiNhuan += Math.round(giaGoc * 0.05);
        }
    });

    return { doanhThu, loiNhuan };
}

function layGioHang() {
    const user = layUserHienTai();
    if (!user) return [];
    const allCarts = docJSON('carts', {});
    return allCarts[chuanHoaEmail(user.email)] || [];}

function luuGioHang(cart) {
    const user = layUserHienTai();
    if (!user) return false;
    const allCarts = docJSON('carts', {});
    allCarts[chuanHoaEmail(user.email)] = cart;
    ghiJSON('carts', allCarts);
    return true;    }

function layDanhSachThongBao() {
    return docJSON('notifications', []);
}

function luuDanhSachThongBao(list) {
    ghiJSON('notifications', list);
}


function themThongBao(toEmail, fromUserName, fromUserPhone, fromUserCity, productName, postId, fromEmail) {
    const list = layDanhSachThongBao();
    const emailFromChuan = chuanHoaEmail(fromEmail);

    const filteredList = list.filter(n => {
        return !(
            chuanHoaEmail(n.fromEmail) === emailFromChuan &&
            String(n.postId) === String(postId)
        );
    });

    filteredList.unshift({
        id: Date.now() + Math.random(),
        toEmail: chuanHoaEmail(toEmail),
        fromEmail: emailFromChuan,
        fromUserName: fromUserName,
        fromUserPhone: fromUserPhone,
        fromUserCity: fromUserCity,
        productName: productName,
        postId: postId,
        time: new Date().toISOString(),
        read: false
    });

    if (filteredList.length > 100) filteredList.length = 100;

    luuDanhSachThongBao(filteredList);
    capNhatBadgeThongBao();
}

function layThongBaoCuaUser() {
    const user = layUserHienTai();
    if (!user) return [];
    const emailChuan = chuanHoaEmail(user.email);
    return layDanhSachThongBao().filter(n => chuanHoaEmail(n.toEmail) === emailChuan);
}

function danhDauThongBaoDaDoc() {
    const user = layUserHienTai();
    if (!user) return;
    const emailChuan = chuanHoaEmail(user.email);
    const list = layDanhSachThongBao();
    list.forEach(n => {
        if (chuanHoaEmail(n.toEmail) === emailChuan) {
            n.read = true;
        }
    });
    luuDanhSachThongBao(list);
    capNhatBadgeThongBao();
}

function xoaNotiTheoPostId(postId) {
    const list = layDanhSachThongBao();
    const newList = list.filter(n => String(n.postId) !== String(postId));
    luuDanhSachThongBao(newList);
    capNhatBadgeThongBao();
}

function dongBoPostTheoUser(user) {
    if (!user || !user.email) return;
    const emailChuan = chuanHoaEmail(user.email);
    
    const posts = layDanhSachBaiDang();
    let changed = false;

    posts.forEach(p => {
        if (chuanHoaEmail(p.ownerEmail) === emailChuan) {
            p.seller = user.name;
            p.phone = user.phone;
            p.location = user.city;
            p.region = user.region;
            changed = true;
        }
    });

    if (changed) {
        luuDanhSachBaiDang(posts);
    }
}

function dongBoThongBaoTheoUser(user) {
    if (!user || !user.email) return;
    const emailChuan = chuanHoaEmail(user.email);
    
    const list = layDanhSachThongBao();
    let changed = false;

    list.forEach(n => {
        if (chuanHoaEmail(n.fromEmail) === emailChuan) {
            n.fromUserName = user.name;
            n.fromUserPhone = user.phone;
            n.fromUserCity = user.city;
            changed = true;
        }
    });

    if (changed) {
        luuDanhSachThongBao(list);
    }
}


function capNhatBadgeThongBao() {
    const badges = document.querySelectorAll('#notiCount');
    if (!badges.length) return;

    const user = layUserHienTai();
    let unread = 0;
    if (user) {
        unread = layThongBaoCuaUser().filter(n => !n.read).length;
    }

    badges.forEach(badge => {
        badge.textContent = unread;
        badge.style.display = unread > 0 ? 'flex' : 'none';
    });
}
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(capNhatBadgeThongBao, 50);
});

function xoaTatCaDuLieu() {
    localStorage.removeItem('users');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('posts');
    localStorage.removeItem('carts');
    localStorage.removeItem('notifications');
    console.log('✅ Đã xóa toàn bộ dữ liệu');
}

function dongBoThongBaoTheoUser(user) {
    if (!user || !user.email) return;
    const emailChuan = chuanHoaEmail(user.email);
    
    const list = layDanhSachThongBao();
    let changed = false;

    list.forEach(n => {
        if (chuanHoaEmail(n.fromEmail) === emailChuan) {
            n.fromUserName = user.name;
            n.fromUserPhone = user.phone;
            n.fromUserCity = user.city;
            changed = true;
        }
    });

    if (changed) {
        luuDanhSachThongBao(list);
    }
}
