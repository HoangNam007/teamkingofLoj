/* ========================================================================
   GIAODIEN.JS - Components giao diện chung
   ------------------------------------------------------------------------
   - Toast notification
   - Modal chi tiết sản phẩm (đầy đủ mô tả, trọng lượng...)
   - Dropdown khu vực (mở/đóng)
   - Gắn sự kiện cho product card
   - Nút Facebook người bán trong modal
   ======================================================================== */

let sanPhamDangXem = null;

/* ========================================================================
   TOAST
   ======================================================================== */
function showToast(message) {
    let toast = document.getElementById('toast');

    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        toast.id = 'toast';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('show');

    clearTimeout(toast._timeoutId);
    toast._timeoutId = setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

/* ========================================================================
   HELPER: YÊU CẦU ĐĂNG NHẬP
   ======================================================================== */
function yeuCauDangNhapNeuCan(message) {
    if (typeof dangDangNhap === 'function' && dangDangNhap()) {
        return true;
    }

    if (typeof yeuCauDangNhap === 'function') {
        yeuCauDangNhap(message || '⚠️ Vui lòng đăng nhập để sử dụng tính năng này!');
    } else {
        showToast(message || '⚠️ Vui lòng đăng nhập để sử dụng tính năng này!');
        setTimeout(() => {
            window.location.href = 'taikhoan.html';
        }, 1000);
    }

    return false;
}

/* ========================================================================
   MODAL - HIỂN THỊ CHI TIẾT SẢN PHẨM (dùng chung ở trang chủ)
   ======================================================================== */
function moModal(product) {
    const modal = document.getElementById('modal');
    if (!modal || !product) return;

    sanPhamDangXem = product;

    const modalImg = document.getElementById('modalImg');
    const modalName = document.getElementById('modalName');
    const modalPrice = document.getElementById('modalPrice');
    const modalDesc = document.getElementById('modalDesc');
    const modalLocation = document.getElementById('modalLocation');
    const modalWeight = document.getElementById('modalWeight');
    const modalSeller = document.getElementById('modalSeller');
    const modalPhone = document.getElementById('modalPhone');

    const defaultImg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23f5f5f5'/><text x='50%25' y='50%25' font-family='Arial,sans-serif' font-size='24' fill='%23bbb' text-anchor='middle' dominant-baseline='middle'>Chợ Tốt</text></svg>";

    if (modalImg) {
        modalImg.src = product.image || defaultImg;
        modalImg.alt = product.name || 'Sản phẩm';

        modalImg.onerror = function () {
            this.onerror = null;
            this.src = defaultImg;
        };
    }

    if (modalName) modalName.textContent = product.name || 'Sản phẩm';
    if (modalPrice) modalPrice.textContent = '₫' + formatGiaTien(product.price);
    if (modalDesc) modalDesc.textContent = product.desc || 'Không có mô tả';
    if (modalLocation) modalLocation.textContent = product.location || 'Chưa cập nhật';

    // Trọng lượng (không bắt buộc)
    if (modalWeight) {
        modalWeight.textContent = product.weight ? product.weight + ' kg' : 'Không có thông tin';
    }

    if (modalSeller) modalSeller.textContent = product.seller || 'Ẩn danh';

    if (modalPhone) {
        if (typeof dangDangNhap === 'function' && dangDangNhap()) {
            modalPhone.textContent = product.phone || 'Người bán chưa cập nhật SĐT';
        } else {
            modalPhone.textContent = 'Đăng nhập để xem số điện thoại';
        }
    }

    capNhatNutFacebookModal(product);

    modal.classList.add('show');
}

function dongModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.classList.remove('show');
    sanPhamDangXem = null;
}

/* ========================================================================
   THÊM SẢN PHẨM ĐANG XEM VÀO GIỎ
   ======================================================================== */
function themSpDangXemVaoGio() {
    if (!sanPhamDangXem) {
        showToast('⚠️ Chưa chọn sản phẩm!');
        return;
    }

    if (!yeuCauDangNhapNeuCan('⚠️ Vui lòng đăng nhập để sử dụng giỏ hàng!')) {
        return;
    }

    if (typeof themVaoGioHang === 'function') {
        themVaoGioHang(sanPhamDangXem);
        dongModal();
    }
}

/* ========================================================================
   SETUP MODAL EVENTS (click ra ngoài, ESC)
   ======================================================================== */
function setupModalEvents() {
    const modal = document.getElementById('modal');
    if (!modal) return;

    if (modal.dataset.modalEventsBound === 'true') return;
    modal.dataset.modalEventsBound = 'true';

    modal.addEventListener('click', (e) => {
        if (e.target === modal) dongModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') dongModal();
    });
}

/* ========================================================================
   DROPDOWN KHU VỰC (mở/đóng)
   ======================================================================== */
function setupDropdownKhuVuc() {
    const locationBtn = document.getElementById('locationBtn');
    const regionDropdown = document.getElementById('regionDropdown');

    if (!locationBtn || !regionDropdown) return;

    if (locationBtn.dataset.dropdownBound === 'true') return;
    locationBtn.dataset.dropdownBound = 'true';

    locationBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        regionDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        regionDropdown.classList.remove('show');
    });
}

/* ========================================================================
   GẮN SỰ KIỆN CHO PRODUCT CARD
   - Click card: mở modal chi tiết
   - Click nút 🛒: thêm giỏ hàng
   ======================================================================== */
function setupCardEvents() {
    const cards = document.querySelectorAll('.product-card');

    cards.forEach(card => {
        if (card.dataset.cardEventsBound === 'true') return;
        card.dataset.cardEventsBound = 'true';

        if (typeof taoProductTuCard === 'function') {
            taoProductTuCard(card);
        }

        // Click card → mở modal
        card.addEventListener('click', (e) => {
            if (e.target.closest('.card-btn')) return;
            if (typeof taoProductTuCard !== 'function') return;

            const product = taoProductTuCard(card);
            moModal(product);
        });

        // Nút thêm giỏ
        const btnCart = card.querySelector('.btn-cart');
        if (btnCart) {
            btnCart.addEventListener('click', (e) => {
                e.stopPropagation();

                if (!yeuCauDangNhapNeuCan('⚠️ Vui lòng đăng nhập để sử dụng giỏ hàng!')) {
                    return;
                }

                if (typeof taoProductTuCard !== 'function' || typeof themVaoGioHang !== 'function') {
                    return;
                }

                const product = taoProductTuCard(card);
                themVaoGioHang(product);
            });
        }
    });
}

/* ========================================================================
   SETUP NÚT TRONG MODAL
   - Thêm giỏ
   - Facebook người bán (nếu có link)
   - Đóng modal
   ======================================================================== */
function setupModalActions() {
    const btnAddCart = document.querySelector('.btn-add-cart');
    const btnClose = document.querySelector('.modal-close');
    const modalActions = document.querySelector('.modal-actions');

    if (btnAddCart) btnAddCart.onclick = themSpDangXemVaoGio;
    if (btnClose) btnClose.onclick = dongModal;

    // Tạo nút Facebook (nếu chưa có)
    if (modalActions && !document.querySelector('.btn-facebook')) {
        const btnFacebook = document.createElement('button');
        btnFacebook.type = 'button';
        btnFacebook.className = 'btn-facebook';
        btnFacebook.textContent = '📘 Facebook người bán';
        btnFacebook.style.background = '#1877f2';
        btnFacebook.style.color = '#fff';
        btnFacebook.style.display = 'none';

        btnFacebook.onclick = () => {
            if (!sanPhamDangXem) {
                showToast('⚠️ Chưa chọn sản phẩm!');
                return;
            }

            if (!yeuCauDangNhapNeuCan('⚠️ Vui lòng đăng nhập để xem Facebook người bán!')) {
                return;
            }

            const facebook = sanPhamDangXem.facebook || '';
            if (!facebook) {
                showToast('ℹ️ Người bán chưa cung cấp Facebook.');
                return;
            }

            window.open(facebook, '_blank');
        };

        modalActions.appendChild(btnFacebook);
    }
}

/* ========================================================================
   CẬP NHẬT NÚT FACEBOOK TRONG MODAL
   ======================================================================== */
function capNhatNutFacebookModal(product) {
    const btnFacebook = document.querySelector('.btn-facebook');
    if (!btnFacebook) return;

    const hasFacebook = product && product.facebook;
    const isLoggedIn = typeof dangDangNhap === 'function' && dangDangNhap();

    btnFacebook.style.display = (hasFacebook && isLoggedIn) ? 'block' : 'none';
}
