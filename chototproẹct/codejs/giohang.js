/* ========================================================================
   GIOHANG.JS - Giỏ hàng
   ------------------------------------------------------------------------
   - Tạo product từ card
   - Thêm/xóa sản phẩm vào giỏ (theo user)
   - Render bảng giỏ hàng + lọc
   - Modal xem chi tiết sản phẩm (đầy đủ: mô tả, trọng lượng, SĐT, địa chỉ, Facebook)
   ======================================================================== */

/* ========================================================================
   HELPER: YÊU CẦU ĐĂNG NHẬP
   ======================================================================== */
function canSuDungTinhNangCanDangNhap(message) {
    if (typeof dangDangNhap === 'function' && dangDangNhap()) return true;

    if (typeof yeuCauDangNhap === 'function') {
        yeuCauDangNhap(message || '⚠️ Vui lòng đăng nhập!');
    } else if (typeof showToast === 'function') {
        showToast(message || '⚠️ Vui lòng đăng nhập!');
        setTimeout(() => { window.location.href = 'taikhoan.html'; }, 1000);
    } else {
        alert(message);
        window.location.href = 'taikhoan.html';
    }
    return false;
}

/* ========================================================================
   HELPER: ESCAPE HTML
   ======================================================================== */
function escapeHtmlGioHang(value) {
    return (value ?? '')
        .toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/* ========================================================================
   TẠO ID ỔN ĐỊNH CHO SẢN PHẨM HARDCODE
   ======================================================================== */
function taoHashSoTuChuoi(text) {
    const str = (text || '').toString();
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
    }
    return Math.abs(hash);
}

function taoIdOnDinhChoCard(card) {
    if (!card) return Date.now();

    const currentId = card.dataset.id;
    if (currentId && /^\d+$/.test(currentId)) return Number(currentId);

    const name = card.dataset.name || '';
    const cat = card.dataset.cat || '';
    const price = card.dataset.price || '0';
    const raw = `${cat}|${name}|${price}`;
    const stableId = taoHashSoTuChuoi(raw);

    card.dataset.id = stableId;
    return stableId;
}

/* ========================================================================
   TẠO OBJECT SẢN PHẨM TỪ CARD
   ======================================================================== */
function taoProductTuCard(card) {
    if (!card) return null;

    const defaultImg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23f5f5f5'/><text x='50%25' y='50%25' font-family='Arial,sans-serif' font-size='24' fill='%23bbb' text-anchor='middle' dominant-baseline='middle'>Chợ Tốt</text></svg>";

    const priceRaw = card.dataset.price || '0';
    const price = parseInt(priceRaw.toString().replace(/\D/g, '')) || 0;
    const id = taoIdOnDinhChoCard(card);
    const img = card.querySelector('.card-img');

    return {
        id,
        name: card.dataset.name || card.querySelector('h3')?.textContent?.trim() || '',
        price,
        image: img?.getAttribute('src') || img?.src || defaultImg,
        cat: card.dataset.cat || 'Sản phẩm',
        desc: card.dataset.desc || '',
        location: card.dataset.location || '',
        weight: card.dataset.weight || '',
        seller: card.dataset.seller || '',
        phone: card.dataset.phone || '',
        region: card.dataset.region || '',
        facebook: card.dataset.facebook || ''
    };
}

/* ========================================================================
   TÌM EMAIL CHỦ SẢN PHẨM
   ======================================================================== */
function layEmailChuSanPham(product) {
    if (!product) return '';
    if (product.ownerEmail) return product.ownerEmail;

    if (typeof layBaiDangTheoId === 'function' && product.id) {
        const post = layBaiDangTheoId(product.id);
        if (post && post.ownerEmail) return post.ownerEmail;
    }
    return '';
}

/* ========================================================================
   THÊM VÀO GIỎ HÀNG
   ======================================================================== */
function themVaoGioHang(product) {
    if (!dangDangNhap()) {
        yeuCauDangNhap('⚠️ Vui lòng đăng nhập để sử dụng giỏ hàng!');
        return;
    }

    if (!product || !product.id) {
        showToast('⚠️ Sản phẩm không hợp lệ!');
        return;
    }

    const currentUser = layUserHienTai();
    const ownerEmail = layEmailChuSanPham(product);

    // Chặn thêm sản phẩm của chính mình
    if (currentUser && ownerEmail && ownerEmail === currentUser.email) {
        showToast('⚠️ Không thể thêm sản phẩm của chính mình!');
        return;
    }

    const cart = layGioHang();
    if (cart.some(item => String(item.id) === String(product.id))) {
        showToast('ℹ️ Sản phẩm đã có trong giỏ hàng!');
        return;
    }

    cart.push(product);
    luuGioHang(cart);
    capNhatBadgeGioHang();

    // Thông báo cho người bán
    if (currentUser && ownerEmail && ownerEmail !== currentUser.email) {
        if (typeof themThongBaoChoNguoiBan === 'function') {
            themThongBaoChoNguoiBan({
                toEmail: ownerEmail,
                fromUser: currentUser.name,
                fromEmail: currentUser.email,
                productName: product.name
            });
        }
    }

    showToast('🛒 Đã thêm vào giỏ hàng!');
}

/* ========================================================================
   XÓA / BADGE
   ======================================================================== */
function xoaKhoiGioHang(index) {
    if (!canSuDungTinhNangCanDangNhap('⚠️ Vui lòng đăng nhập!')) return;

    const cart = layGioHang();
    if (index < 0 || index >= cart.length) return;

    cart.splice(index, 1);
    luuGioHang(cart);
    capNhatBadgeGioHang();
}

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
   TÊN DANH MỤC
   ======================================================================== */
function hienThiTenDanhMuc(cat) {
    const map = {
        dientu: 'Điện tử',
        phuongtien: 'Phương tiện',
        trangphuc: 'Thời trang',
        vatdung: 'Đồ dùng',
        khac: 'Khác'
    };
    return map[cat] || 'Sản phẩm';
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
                    🛒 Giỏ hàng trống. <a href="idea.html" style="color:#ff8a00;">Mua sắm ngay</a>
                </td>
            </tr>`;
        return;
    }

    // Lọc
    const keyword = (document.getElementById('cartSearch')?.value || '').toLowerCase().trim();
    const regionFilter = document.getElementById('cartRegionFilter')?.value || 'all';
    const catFilter = document.getElementById('cartCatFilter')?.value || 'all';

    const filtered = cart.filter(item => {
        const matchName = !keyword || (item.name || '').toLowerCase().includes(keyword);
        const matchCat = catFilter === 'all' || item.cat === catFilter;
        const matchRegion = regionFilter === 'all' ||
            (typeof layMienTheoThanhPho === 'function' && layMienTheoThanhPho(item.location || '') === regionFilter);
        return matchName && matchCat && matchRegion;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center; padding:40px; color:#888;">
                    🔎 Không tìm thấy sản phẩm phù hợp trong giỏ hàng.
                </td>
            </tr>`;
        return;
    }

    const defaultImgSmall = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' fill='%23f5f5f5'/></svg>";

    let html = '';
      filtered.forEach(item => {
        const originalIndex = cart.indexOf(item);

        // ★ Kiểm tra sản phẩm còn tồn tại không (người bán đã gỡ chưa?)
        let dabiGo = false;
        if (item.id && typeof layBaiDangTheoId === 'function') {
            const postGoc = layBaiDangTheoId(item.id);
            // Nếu sản phẩm user đăng (có ownerEmail) mà không tìm thấy trong DB → đã bị gỡ
            if (item.ownerEmail && !postGoc) {
                dabiGo = true;
            }
        }

        const image = escapeHtmlGioHang(item.image || defaultImgSmall);
        const name = escapeHtmlGioHang(item.name || 'Sản phẩm');
        const cat = escapeHtmlGioHang(hienThiTenDanhMuc(item.cat));
        const price = Number(item.price) || 0;
        const seller = escapeHtmlGioHang(item.seller || 'Ẩn danh');

        const dataSeller = escapeHtmlGioHang(item.seller || '');
        const dataPhone = escapeHtmlGioHang(item.phone || '');
        const dataLoc = escapeHtmlGioHang(item.location || '');
        const dataName = escapeHtmlGioHang(item.name || '');
        const dataFb = escapeHtmlGioHang(item.facebook || '');
        const dataDesc = escapeHtmlGioHang(item.desc || '');
        const dataWeight = escapeHtmlGioHang(item.weight || '');
        const dataImg = escapeHtmlGioHang(item.image || '');

        if (dabiGo) {
            // ★ SẢN PHẨM ĐÃ BỊ GỠ — hiển thị xám
            html += `
                <tr id="row-${originalIndex}" style="opacity:0.5; cursor:default;">
                    <td>${originalIndex + 1}</td>
                    <td>
                        <div style="display:flex; align-items:center; gap:12px;">
                            <img src="${image}" alt="${name}"
                                 style="width:60px; height:60px; object-fit:contain; background:#f0f0f0; border-radius:8px; border:1px solid #ddd; filter:grayscale(100%);">
                            <div>
                                <strong style="color:#999; text-decoration:line-through;">${name}</strong>
                                <br><small style="color:#aaa;">👤 ${seller}</small>
                            </div>
                        </div>
                    </td>
                    <td style="color:#999;">${cat}</td>
                    <td style="color:#ff4757; font-weight:600; font-size:12px;">
                        Người bán đã gỡ sản phẩm
                    </td>
                    <td>
                        <button class="btn-remove" onclick="xoaSanPhamKhoiBang(${originalIndex})">✕ Xóa</button>
                    </td>
                </tr>`;
        } else {
            // ★ SẢN PHẨM BÌNH THƯỜNG
            html += `
                <tr id="row-${originalIndex}"
                    style="cursor:pointer;"
                    data-seller="${dataSeller}"
                    data-phone="${dataPhone}"
                    data-loc="${dataLoc}"
                    data-pname="${dataName}"
                    data-fb="${dataFb}"
                    data-desc="${dataDesc}"
                    data-weight="${dataWeight}"
                    data-img="${dataImg}"
                    data-price="${price}"
                    onclick="xemChiTietSanPhamTuRow(this)">
                    <td>${originalIndex + 1}</td>
                    <td>
                        <div style="display:flex; align-items:center; gap:12px;">
                            <img src="${image}" alt="${name}"
                                 style="width:60px; height:60px; object-fit:contain; background:#fff; border-radius:8px; border:1px solid #eee;">
                            <div>
                                <strong>${name}</strong>
                                <br><small style="color:#888;">👤 ${seller}</small>
                            </div>
                        </div>
                    </td>
                    <td>${cat}</td>
                    <td class="price">${formatGiaTien(price)} ₫</td>
                    <td onclick="event.stopPropagation();">
                        <button class="btn-remove" onclick="xoaSanPhamKhoiBang(${originalIndex})">✕ Xóa</button>
                    </td>
                </tr>`;
        }
    });

    tbody.innerHTML = html;
}

/* ========================================================================
   MODAL XEM CHI TIẾT SẢN PHẨM (đầy đủ như trang chủ)
   ======================================================================== */
function xemChiTietSanPhamTuRow(row) {
    xemChiTietSanPham(
        row.dataset.seller,
        row.dataset.phone,
        row.dataset.loc,
        row.dataset.pname,
        row.dataset.fb,
        row.dataset.desc,
        row.dataset.weight,
        row.dataset.img,
        Number(row.dataset.price) || 0
    );
}

function xemChiTietSanPham(seller, phone, location, productName, facebook, desc, weight, image, price) {
    const oldModal = document.getElementById('modalChiTietGio');
    if (oldModal) oldModal.remove();

    const defaultImg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23f5f5f5'/><text x='50%25' y='50%25' font-family='Arial,sans-serif' font-size='24' fill='%23bbb' text-anchor='middle' dominant-baseline='middle'>Chợ Tốt</text></svg>";

    const imgSrc = image || defaultImg;
    const priceText = formatGiaTien(price);

    const phoneHtml = phone
        ? `<a href="tel:${phone}" style="color:#ff8a00; font-weight:600; text-decoration:none;">📞 ${phone}</a>`
        : '<span style="color:#999;">Chưa cập nhật</span>';

    const weightText = weight ? weight + ' kg' : 'Không có thông tin';

    const fbHtml = facebook
        ? `<div style="text-align:center; margin-top:12px;">
             <a href="${escapeHtmlGioHang(facebook)}" target="_blank"
                style="display:inline-block; background:#1877f2; color:#fff;
                       padding:10px 18px; border-radius:8px; font-weight:600; text-decoration:none;">
                📘 Facebook người bán
             </a>
           </div>`
        : '';

    const html = `
        <div class="modal-overlay show" id="modalChiTietGio" onclick="if(event.target===this)this.remove()">
            <div class="modal-box">
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>

                <img src="${imgSrc}" alt="${escapeHtmlGioHang(productName)}" class="modal-img"
                     style="object-fit:contain; background:#fff;"
                     onerror="this.onerror=null;this.src='${defaultImg}';">

                <div class="modal-body">
                    <h2>${escapeHtmlGioHang(productName)}</h2>
                    <p class="modal-price">₫${priceText}</p>

                    <div class="modal-info">
                        <div class="modal-info-row">
                            <span class="label">📝 Mô tả:</span>
                            <span class="value">${escapeHtmlGioHang(desc) || 'Không có mô tả'}</span>
                        </div>
                        <div class="modal-info-row">
                            <span class="label">⚖️ Trọng lượng:</span>
                            <span class="value">${weightText}</span>
                        </div>
                        <div class="modal-info-row">
                            <span class="label">📍 Địa chỉ:</span>
                            <span class="value">${escapeHtmlGioHang(location) || 'Không rõ'}</span>
                        </div>
                        <div class="modal-info-row">
                            <span class="label">👤 Người bán:</span>
                            <span class="value">${escapeHtmlGioHang(seller) || 'Ẩn danh'}</span>
                        </div>
                        <div class="modal-info-row">
                            <span class="label">📞 SĐT:</span>
                            <span class="value">${phoneHtml}</span>
                        </div>
                    </div>

                    ${fbHtml}

                    <button class="btn-add-cart" style="width:100%; margin-top:16px;"
                            onclick="this.closest('.modal-overlay').remove()">Đóng</button>
                </div>
            </div>
        </div>`;

    document.body.insertAdjacentHTML('beforeend', html);
}

/* ========================================================================
   LỌC + XÓA
   ======================================================================== */
function locGioHang() {
    renderBangGioHang();
}

function xoaSanPhamKhoiBang(index) {
    if (!canSuDungTinhNangCanDangNhap('⚠️ Vui lòng đăng nhập!')) return;

    const row = document.getElementById(`row-${index}`);
    if (!row) return;

    row.style.transition = 'opacity 0.3s, transform 0.3s';
    row.style.opacity = '0';
    row.style.transform = 'translateX(30px)';

    setTimeout(() => {
        xoaKhoiGioHang(index);
        renderBangGioHang();
        showToast('🗑️ Đã xóa sản phẩm khỏi giỏ hàng');
    }, 300);
}
