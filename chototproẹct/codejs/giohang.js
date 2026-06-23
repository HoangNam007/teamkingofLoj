/* ========================================================================
   CART.JS - Giỏ hàng + Yêu thích
   ------------------------------------------------------------------------
   Vai trò: Quản lý cart và favorites
   Phụ thuộc: storage.js, ui.js
   ======================================================================== */

/* ========================================================================
   GIỎ HÀNG (CART)
   ======================================================================== */

// Thêm sản phẩm vào giỏ
function themVaoGioHang(product) {
    const cart = layGioHang();
    cart.push(product);
    luuGioHang(cart);
    capNhatBadgeGioHang();
    showToast('🛒 Đã thêm vào giỏ hàng!');
}

// Xóa sản phẩm khỏi giỏ theo index
function xoaKhoiGioHang(index) {
    const cart = layGioHang();
    cart.splice(index, 1);
    luuGioHang(cart);
    capNhatBadgeGioHang();
}

// Tính tổng tiền giỏ hàng
function tinhTongTienGioHang() {
    return layGioHang().reduce((sum, item) => sum + (item.price || 0), 0);
}

// Cập nhật số lượng trên icon giỏ hàng (badge)
function capNhatBadgeGioHang() {
    const badge = document.getElementById('cartCount');
    if (!badge) return;
    const cart = layGioHang();
    badge.textContent = cart.length;
    badge.style.display = cart.length > 0 ? 'flex' : 'none';
}

// Render bảng giỏ hàng (cho giohang.html)
function renderBangGioHang() {
    const tbody = document.getElementById('cartBody');
    if (!tbody) return;

    const cart = layGioHang();

    if (cart.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding:40px; color:#888;">
                    🛒 Giỏ hàng trống. 
                    <a href="idea.html" style="color:#ff8a00;">Mua sắm ngay</a>
                </td>
            </tr>`;
        capNhatTongTien();
        return;
    }

    let html = '';
    cart.forEach((item, index) => {
        html += `
            <tr id="row-${index}">
                <td>${index + 1}</td>
                <td>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <img src="${item.image}" alt="${item.name}" 
                             style="width:60px; height:60px; object-fit:cover; border-radius:8px;">
                        <span>${item.name}</span>
                    </div>
                </td>
                <td>${item.cat || 'Sản phẩm'}</td>
                <td class="price">${(item.price || 0).toLocaleString()} đ</td>
                <td>
                    <button class="btn-remove" onclick="xoaSanPhamKhoiBang(${index})">
                        ✕ Xóa
                    </button>
                </td>
            </tr>`;
    });
    tbody.innerHTML = html;
    capNhatTongTien();
}

// Xóa sản phẩm có animation (cho giohang.html)
function xoaSanPhamKhoiBang(index) {
    const row = document.getElementById(`row-${index}`);
    if (!row) return;

    // Animation
    row.style.transition = 'opacity 0.3s, transform 0.3s';
    row.style.opacity = '0';
    row.style.transform = 'translateX(30px)';

    setTimeout(() => {
        xoaKhoiGioHang(index);
        renderBangGioHang();
        showToast('🗑️ Đã xóa sản phẩm khỏi giỏ hàng');
    }, 300);
}

// Cập nhật hiển thị tổng tiền
function capNhatTongTien() {
    const elem = document.getElementById('totalPrice');
    if (!elem) return;
    const total = tinhTongTienGioHang();
    elem.textContent = total.toLocaleString('vi-VN') + ' đ';
}

// Thanh toán
function thanhToan() {
    const cart = layGioHang();
    if (cart.length === 0) {
        showToast('⚠️ Giỏ hàng trống!');
        return;
    }

    const total = tinhTongTienGioHang();
    const message = `🛒 THANH TOÁN\n\n📦 Sản phẩm (${cart.length}):\n${cart.map(p => '• ' + p.name).join('\n')}\n\n💰 Tổng tiền: ${total.toLocaleString()} đ\n\n⚠️ Tính năng thanh toán đang được phát triển!`;

    alert(message);
    showToast('⏳ Tính năng thanh toán đang phát triển...');
}

/* ========================================================================
   YÊU THÍCH (FAVORITES)
   ======================================================================== */

// Kiểm tra sản phẩm có trong yêu thích không
function laYeuThich(productId) {
    return layDanhSachYeuThich().some(f => f.id === productId);
}

// Toggle yêu thích (thêm/bỏ)
function toggleYeuThich(product) {
    let favorites = layDanhSachYeuThich();
    const existIndex = favorites.findIndex(f => f.id === product.id);

    if (existIndex > -1) {
        // Đã có → bỏ
        favorites.splice(existIndex, 1);
        luuDanhSachYeuThich(favorites);
        capNhatBadgeYeuThich();
        showToast('💔 Đã bỏ yêu thích');
        return false;
    } else {
        // Chưa có → thêm
        favorites.push(product);
        luuDanhSachYeuThich(favorites);
        capNhatBadgeYeuThich();
        showToast('❤️ Đã thêm yêu thích!');
        return true;
    }
}

// Xóa khỏi yêu thích theo id
function xoaKhoiYeuThich(productId) {
    let favorites = layDanhSachYeuThich();
    favorites = favorites.filter(f => f.id !== productId);
    luuDanhSachYeuThich(favorites);
    capNhatBadgeYeuThich();
}

// Cập nhật số lượng trên icon yêu thích (badge)
function capNhatBadgeYeuThich() {
    const badge = document.getElementById('favCount');
    if (!badge) return;
    const favorites = layDanhSachYeuThich();
    badge.textContent = favorites.length;
    badge.style.display = favorites.length > 0 ? 'flex' : 'none';
}

/* ========================================================================
   TẠO OBJECT SẢN PHẨM TỪ CARD (HÀM HELPER DÙNG CHUNG)
   ======================================================================== */
function taoProductTuCard(card) {
    const priceRaw = card.dataset.price || '0';
    // Xử lý cả 2 trường hợp: số "1500000" và chuỗi "1.500.000 đ"
    const price = parseInt(priceRaw.toString().replace(/\D/g, '')) || 0;
    
    return {
        id: parseInt(card.dataset.id) || Date.now() + Math.random(),
        name: card.dataset.name || '',
        price: price,
        image: card.querySelector('.card-img')?.src || '',
        cat: card.dataset.cat || 'Sản phẩm',
        desc: card.dataset.desc || '',
        location: card.dataset.location || '',
        qty: card.dataset.qty || '1',
        seller: card.dataset.seller || '',
        phone: card.dataset.phone || ''
    };
}