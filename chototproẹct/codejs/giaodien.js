/* ========================================================================
   UI.JS - Components giao diện chung
   ------------------------------------------------------------------------
   Vai trò: Toast notification, Modal chi tiết SP, Dropdown khu vực
   Phụ thuộc: storage.js, cart.js
   ======================================================================== */

// Biến lưu sản phẩm đang xem trong modal (dùng cho nút "Thêm vào giỏ")
let sanPhamDangXem = null;

/* ========================================================================
   TOAST - Thông báo bật lên góc dưới
   ======================================================================== */
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) {
        // Nếu trang chưa có toast → tự tạo
        const newToast = document.createElement('div');
        newToast.className = 'toast';
        newToast.id = 'toast';
        document.body.appendChild(newToast);
        return showToast(message);
    }

    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

/* ========================================================================
   MODAL - Hiển thị chi tiết sản phẩm
   ======================================================================== */

// Mở modal với thông tin sản phẩm
function moModal(product) {
    const modal = document.getElementById('modal');
    if (!modal) return;

    sanPhamDangXem = product;

    // Đổ dữ liệu vào modal
    const fields = {
        'modalImg': { attr: 'src', value: product.image },
        'modalName': { attr: 'text', value: product.name },
        'modalPrice': { attr: 'text', value: '₫' + (product.price || 0).toLocaleString() },
        'modalDesc': { attr: 'text', value: product.desc || 'Không có mô tả' },
        'modalLocation': { attr: 'text', value: product.location || 'Chưa cập nhật' },
        'modalQty': { attr: 'text', value: product.qty || '1' },
        'modalSeller': { attr: 'text', value: product.seller || 'Ẩn danh' },
        'modalPhone': { attr: 'text', value: product.phone || 'Liên hệ qua chat' }
    };

    for (const id in fields) {
        const elem = document.getElementById(id);
        if (elem) {
            if (fields[id].attr === 'src') {
                elem.src = fields[id].value;
            } else {
                elem.textContent = fields[id].value;
            }
        }
    }

    modal.classList.add('show');
}

// Đóng modal
function dongModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.classList.remove('show');
    sanPhamDangXem = null;
}

// Thêm sản phẩm trong modal vào giỏ hàng
function themSpDangXemVaoGio() {
    if (sanPhamDangXem) {
        themVaoGioHang(sanPhamDangXem);
        dongModal();
    }
}

// Setup các sự kiện đóng modal (ESC, click overlay)
function setupModalEvents() {
    const modal = document.getElementById('modal');
    if (!modal) return;

    // Click ra ngoài → đóng
    modal.addEventListener('click', (e) => {
        if (e.target === modal) dongModal();
    });

    // Nhấn ESC → đóng
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') dongModal();
    });
}

/* ========================================================================
   DROPDOWN KHU VỰC (cho trang chủ idea.html)
   ======================================================================== */
function setupDropdownKhuVuc() {
    const locationBtn = document.getElementById('locationBtn');
    const regionDropdown = document.getElementById('regionDropdown');
    const regionText = document.getElementById('regionText');

    if (!locationBtn || !regionDropdown) return;

    // Toggle khi click button
    locationBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        regionDropdown.classList.toggle('show');
    });

    // Chọn 1 vùng
    regionDropdown.querySelectorAll('div').forEach(item => {
        item.addEventListener('click', () => {
            if (regionText) regionText.textContent = item.dataset.region;
            regionDropdown.classList.remove('show');
            showToast('📍 Đã chọn ' + item.dataset.region);
        });
    });

    // Click ra ngoài → đóng dropdown
    document.addEventListener('click', () => {
        regionDropdown.classList.remove('show');
    });
}

/* ========================================================================
   GẮN EVENTS CHO CARD SẢN PHẨM (dùng chung cho mọi trang)
   ------------------------------------------------------------------------
   - Click card → mở modal
   - Click nút ♡ → toggle yêu thích
   - Click nút 🛒 → thêm giỏ hàng
   ======================================================================== */
function setupCardEvents() {
    const cards = document.querySelectorAll('.product-card');
    
    cards.forEach((card, index) => {
        // Gán ID nếu chưa có
        if (!card.dataset.id) {
            card.dataset.id = 'sp-' + index + '-' + Date.now();
        }

        // === Click card → mở modal ===
        card.addEventListener('click', (e) => {
            // Nếu click vào nút (♡, 🛒) thì không mở modal
            if (e.target.closest('.card-btn')) return;
            
            const product = taoProductTuCard(card);
            moModal(product);
        });

        // === Nút ♡ Yêu thích ===
        const btnHeart = card.querySelector('.btn-heart');
        if (btnHeart) {
            const product = taoProductTuCard(card);
            
            // Set trạng thái ban đầu (nếu đã yêu thích)
            if (laYeuThich(product.id)) {
                btnHeart.classList.add('liked');
                btnHeart.textContent = '♥';
            }

            btnHeart.addEventListener('click', (e) => {
                e.stopPropagation(); // Không lan tới card
                const product = taoProductTuCard(card);
                const isAdded = toggleYeuThich(product);
                
                if (isAdded) {
                    btnHeart.classList.add('liked');
                    btnHeart.textContent = '♥';
                } else {
                    btnHeart.classList.remove('liked');
                    btnHeart.textContent = '♡';
                }
            });
        }

        // === Nút 🛒 Giỏ hàng ===
        const btnCart = card.querySelector('.btn-cart');
        if (btnCart) {
            btnCart.addEventListener('click', (e) => {
                e.stopPropagation();
                const product = taoProductTuCard(card);
                themVaoGioHang(product);
            });
        }
    });
}

/* ========================================================================
   3 NÚT TRONG MODAL (Thêm giỏ, Gọi điện, Nhắn tin)
   ======================================================================== */
function setupModalActions() {
    // Tìm các nút trong modal và gán event
    const btnAddCart = document.querySelector('.btn-add-cart');
    const btnContact = document.querySelector('.btn-contact');
    const btnMessage = document.querySelector('.btn-message');

    if (btnAddCart) {
        btnAddCart.onclick = themSpDangXemVaoGio;
    }
    if (btnContact) {
        btnContact.onclick = () => {
            if (sanPhamDangXem) {
                showToast('📞 Đang gọi ' + (sanPhamDangXem.phone || 'người bán') + '...');
            }
        };
    }
    if (btnMessage) {
        btnMessage.onclick = () => showToast('💬 Mở khung nhắn tin...');
    }

    // Nút đóng modal
    const btnClose = document.querySelector('.modal-close');
    if (btnClose) {
        btnClose.onclick = dongModal;
    }
}