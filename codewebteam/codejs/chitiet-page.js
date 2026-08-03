/* ========================================================================
   CHITIET-PAGE.JS - Trang chi tiết sản phẩm (V4)
   ======================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    renderTrangChiTiet();
});

function renderTrangChiTiet() {
    const container = document.getElementById('detailContainer');
    if (!container) return;

    // Đọc ID từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1;">
                <div class="empty-state-icon">⚠️</div>
                <h2>Không có sản phẩm</h2>
            </div>`;
        return;
    }

    const product = layBaiDangTheoId(productId);
    if (!product) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1;">
                <div class="empty-state-icon">😢</div>
                <h2>Sản phẩm không tồn tại hoặc đã bị xóa</h2>
            </div>`;
        return;
    }

    // Check trạng thái
    if (product.status === 'sold') {
        container.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1;">
                <div class="empty-state-icon">✅</div>
                <h2>Sản phẩm này đã được bán</h2>
            </div>`;
        return;
    }

    const currentUser = layUserHienTai();
    const laSPCuaMinh = currentUser &&
        chuanHoaEmail(product.ownerEmail) === chuanHoaEmail(currentUser.email);

    let daCoTrongGio = false;
    if (currentUser) {
        const cart = layGioHang();
        daCoTrongGio = cart.some(item => String(item.id) === String(product.id));
    }

    let btnAddCartHtml = '';
    if (laSPCuaMinh) {
        btnAddCartHtml = `<button class="btn-detail-add" disabled 
                                  style="background:#ccc; cursor:not-allowed;">
                             🚫 Đây là sản phẩm của bạn
                          </button>`;
    } else if (daCoTrongGio) {
        btnAddCartHtml = `<button class="btn-detail-add" disabled
                                  style="background:#4caf50; cursor:not-allowed;">
                             ✅ Đã có trong giỏ
                          </button>`;
    } else {
        btnAddCartHtml = `<button class="btn-detail-add" 
                                  onclick="themVaoGioHang('${product.id}'); setTimeout(()=>location.reload(), 500);">
                             🛒 Thêm vào giỏ hàng
                          </button>`;
    }

    const phoneHtml = product.phone
        ? `<a href="tel:${product.phone}" style="color:#ff8a00; font-weight:600;">📞 ${product.phone}</a>`
        : `<span style="color:#999;">Chưa cập nhật</span>`;

    container.innerHTML = `
        <div class="detail-img-box">
            <img src="${product.image}" alt="${product.name}">
        </div>

        <div class="detail-info">
            <h1>${product.name}</h1>
            <p class="detail-price">₫${formatGiaTien(product.price)}</p>

            <div class="detail-row">
                <span class="label">📝 Mô tả:</span>
                <span class="value">${product.desc || 'Không có mô tả'}</span>
            </div>
            <div class="detail-row">
                <span class="label">📂 Danh mục:</span>
                <span class="value">${layTenDanhMuc(product.cat)}</span>
            </div>
            <div class="detail-row">
                <span class="label">📍 Địa chỉ:</span>
                <span class="value">${product.location || ''}</span>
            </div>
            <div class="detail-row">
                <span class="label">🌏 Khu vực:</span>
                <span class="value">${product.region || ''}</span>
            </div>
            <div class="detail-row">
                <span class="label">👤 Người bán:</span>
                <span class="value">${product.seller || ''}</span>
            </div>
            <div class="detail-row">
                <span class="label">📞 SĐT:</span>
                <span class="value">${phoneHtml}</span>
            </div>

            <div class="detail-actions">
                ${btnAddCartHtml}
                <button class="btn-detail-back" onclick="window.location.href='idea.html'">
                    ← Quay lại
                </button>
            </div>
        </div>
    `;
}

function layTenDanhMuc(cat) {
    const map = {
        dientu: '📱 Điện tử',
        phuongtien: '🚗 Phương tiện',
        trangphuc: '👕 Thời trang',
        vatdung: '🏠 Vật dụng',
        khac: '🎁 Khác'
    };
    return map[cat] || 'Sản phẩm';
}