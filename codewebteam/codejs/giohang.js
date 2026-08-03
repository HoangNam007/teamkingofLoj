/* ========================================================================
   GIOHANG.JS - Giỏ hàng (V4 - Siêu đơn giản)
   ======================================================================== */

/* ========================================================================
   TÊN DANH MỤC
   ======================================================================== */
function hienThiTenDanhMuc(cat) {
    const map = {
        dientu: 'Điện tử',
        phuongtien: 'Phương tiện',
        trangphuc: 'Thời trang',
        vatdung: 'Vật dụng',
        khac: 'Khác'
    };
    return map[cat] || 'Sản phẩm';
}

/* ========================================================================
   THÊM VÀO GIỎ HÀNG
   ======================================================================== */
function themVaoGioHang(productId) {
    if (!dangDangNhap()) {
        showToast('⚠️ Vui lòng đăng nhập để dùng giỏ hàng!', 'warning');
        return;
    }

    const post = layBaiDangTheoId(productId);
    if (!post) {
        showToast('⚠️ Sản phẩm không còn tồn tại!', 'warning');
        return;
    }

    const currentUser = layUserHienTai();

    // Chặn thêm SP của chính mình
    if (chuanHoaEmail(post.ownerEmail) === chuanHoaEmail(currentUser.email)) {
        showToast('⚠️ Không thể thêm sản phẩm của chính mình!', 'warning');
        return;
    }

    // Check đã có trong giỏ chưa
    const cart = layGioHang();
    if (cart.some(item => String(item.id) === String(productId))) {
        showToast('ℹ️ Sản phẩm đã có trong giỏ hàng!', 'info');
        return;
    }

    // Thêm vào giỏ
    cart.push({
        id: post.id,
        name: post.name,
        price: post.price,
        image: post.image,
        cat: post.cat,
        location: post.location,
        seller: post.seller,
        phone: post.phone,
        ownerEmail: post.ownerEmail
    });

    luuGioHang(cart);
    capNhatBadgeGioHang();

    // Gửi thông báo cho người bán
    themThongBao(
        post.ownerEmail,
        currentUser.name,
        currentUser.phone,
        currentUser.city,
        post.name,
        post.id,
        currentUser.email
        );

    showToast('🛒 Đã thêm vào giỏ hàng!', 'success');
}

/* ========================================================================
   XÓA KHỎI GIỎ
   ======================================================================== */
function xoaKhoiGioHang(index) {
    const cart = layGioHang();
    if (index < 0 || index >= cart.length) return;

    cart.splice(index, 1);
    luuGioHang(cart);
    capNhatBadgeGioHang();
}

/* ========================================================================
   CẬP NHẬT BADGE GIỎ HÀNG
   ======================================================================== */
function capNhatBadgeGioHang() {
    const badges = document.querySelectorAll('#cartCount');
    if (!badges.length) return;

    const cart = layGioHang();
    badges.forEach(badge => {
        badge.textContent = cart.length;
        badge.style.display = cart.length > 0 ? 'flex' : 'none';
    });
}

/* ========================================================================
   RENDER BẢNG GIỎ HÀNG
   ======================================================================== */
function renderBangGioHang() {
    const tbody = document.getElementById('cartBody');
    if (!tbody) return;

    if (!dangDangNhap()) {
        tbody.innerHTML = '';
        return;
    }

    const cart = layGioHang();

    if (cart.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding:40px; color:#888;">
                    🛒 Giỏ hàng trống. 
                    <a href="idea.html" style="color:#ff8a00;">Mua sắm ngay</a>
                </td>
            </tr>`;
        return;
    }

    let html = '';
    cart.forEach((item, index) => {
        const post = layBaiDangTheoId(item.id);
        const daBiXoa = !post;
        const daBan = post && post.status === 'sold';

        const name = item.name;
        const image = item.image;
        const cat = hienThiTenDanhMuc(item.cat);
        const price = Number(item.price) || 0;
        const seller = item.seller;

        // 3 trạng thái: bình thường, đã xóa, đã bán
        let statusText = '';
        let rowStyle = 'cursor:pointer;';
        let clickable = true;

        if (daBiXoa) {
            statusText = '⚫ Người bán đã xóa sản phẩm';
            rowStyle = 'opacity:0.5; background:#fafafa;';
            clickable = false;
        } else if (daBan) {
            statusText = '✅ Sản phẩm đã được bán';
            rowStyle = 'opacity:0.5; background:#fafafa;';
            clickable = false;
        }

        const onClickAttr = clickable
            ? `onclick="window.location.href='chitiet.html?id=${item.id}'"`
            : '';

        if (daBiXoa || daBan) {
            html += `
                <tr id="row-${index}" style="${rowStyle}">
                    <td>${index + 1}</td>
                    <td>
                        <div style="display:flex; align-items:center; gap:12px;">
                            <img src="${image}" alt="${name}"
                                 style="width:60px; height:60px; object-fit:cover; 
                                        border-radius:8px; filter:grayscale(100%);">
                            <div>
                                <strong style="color:#999; text-decoration:line-through;">${name}</strong>
                                <br><small style="color:#aaa;">👤 ${seller}</small>
                            </div>
                        </div>
                    </td>
                    <td style="color:#999;">${cat}</td>
                    <td style="color:#ff4757; font-weight:600; font-size:13px;">${statusText}</td>
                    <td>
                        <button class="btn-remove" onclick="xoaSanPhamKhoiBang(${index})">✕ Xóa</button>
                    </td>
                </tr>`;
        } else {
            html += `
                <tr id="row-${index}" style="${rowStyle}" ${onClickAttr}>
                    <td>${index + 1}</td>
                    <td>
                        <div style="display:flex; align-items:center; gap:12px;">
                            <img src="${image}" alt="${name}"
                                 style="width:60px; height:60px; object-fit:cover; 
                                        border-radius:8px; border:1px solid #eee;">
                            <div>
                                <strong>${name}</strong>
                                <br><small style="color:#888;">👤 ${seller}</small>
                            </div>
                        </div>
                    </td>
                    <td>${cat}</td>
                    <td class="price">${formatGiaTien(price)} ₫</td>
                    <td onclick="event.stopPropagation();">
                        <button class="btn-remove" onclick="xoaSanPhamKhoiBang(${index})">✕ Xóa</button>
                    </td>
                </tr>`;
        }
    });

    tbody.innerHTML = html;
}

/* ========================================================================
   XÓA SP KHỎI BẢNG
   ======================================================================== */
function xoaSanPhamKhoiBang(index) {
    if (!confirm('Xóa sản phẩm này khỏi giỏ hàng?')) return;
    xoaKhoiGioHang(index);
    renderBangGioHang();
}