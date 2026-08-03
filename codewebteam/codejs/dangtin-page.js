/* ========================================================================
   DANGTIN-PAGE.JS - Đăng tin + Tin của tôi (V4 - có chiết khấu 5%)
   ======================================================================== */

const TEN_DANH_MUC = {
    dientu: '📱 Điện tử',
    phuongtien: '🚗 Phương tiện',
    trangphuc: '👕 Thời trang',
    vatdung: '🏠 Vật dụng',
    khac: '🎁 Khác'
};

const TEN_TRANG_THAI = {
    active: { text: '🟢 Đang bán', color: '#2e7d32' },
    sold: { text: '✅ Đã bán', color: '#1565c0' }
};

const PLACEHOLDER_IMG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='400' height='300' fill='%23f5f5f5'/><text x='50%25' y='50%25' font-family='Arial' font-size='24' fill='%23bbb' text-anchor='middle' dominant-baseline='middle'>Preview</text></svg>";

/* ========================================================================
   TRANG ĐĂNG TIN
   ======================================================================== */
function setupTrangDangTin() {
    const imageInput = document.getElementById('postImageInput');
    const imagePreview = document.getElementById('postImagePreview');

    if (imageInput && imagePreview && imageInput.dataset.bound !== 'true') {
        imageInput.dataset.bound = 'true';
        imageInput.addEventListener('input', () => {
            const url = imageInput.value.trim();
            imagePreview.src = url || PLACEHOLDER_IMG;
        });
        imagePreview.onerror = function () {
            this.src = PLACEHOLDER_IMG;
        };
    }

    const postForm = document.getElementById('postForm');
    if (postForm && postForm.dataset.bound !== 'true') {
        postForm.dataset.bound = 'true';
        postForm.addEventListener('submit', xuLyDangTinMoi);
    }
}

function xuLyDangTinMoi(event) {
    event.preventDefault();

    const user = layUserHienTai();
    if (!user) {
        showToast('⚠️ Vui lòng đăng nhập!', 'warning');
        return;
    }

    const form = event.target;
    const name = form.querySelector('[name="name"]').value.trim();
    const cat = form.querySelector('[name="cat"]').value;
    const priceRaw = form.querySelector('[name="price"]').value;
    const desc = form.querySelector('[name="desc"]').value.trim();
    const image = form.querySelector('[name="image"]').value.trim();

    if (!name) {
        showToast('⚠️ Vui lòng nhập tên sản phẩm!', 'warning');
        return;
    }

    const priceGoc = Number(priceRaw) || 0;
    if (priceGoc <= 0) {
        showToast('⚠️ Giá bán phải lớn hơn 0!', 'warning');
        return;
    }

    if (priceGoc > 999999999999) {
        showToast('⚠️ Giá bán không được vượt quá 999 tỉ!', 'warning');
        return;
    }

    if (!image) {
        showToast('⚠️ Vui lòng nhập link ảnh!', 'warning');
        return;
    }

    // ★ Kiểm tra ảnh có tải được không TRƯỚC KHI hiện modal
    kiemTraAnh(image, function(anhOk) {
        if (!anhOk) {
            showToast('❌ Ảnh không tải được! Vui lòng dùng link ảnh khác.', 'error');
            return;
        }

        // Ảnh OK → tính giá +5% và hiện modal xác nhận
        const priceHienThi = Math.round(priceGoc * 1.05);
        const phi = priceHienThi - priceGoc;

        hienModalXacNhanDangTin({
            priceGoc, phi, priceHienThi,
            onConfirm: function() {
                themBaiDangMoi({ name, cat, price: priceGoc, desc, image });
                showToast('✅ Đăng tin thành công!', 'success');
                form.reset();

                const imagePreview = document.getElementById('postImagePreview');
                if (imagePreview) imagePreview.src = PLACEHOLDER_IMG;

                setTimeout(() => { window.location.href = 'idea.html'; }, 800);
            }
        });
    });
}

function kiemTraAnh(url, callback) {
    const img = new Image();
    img.onload = function () {
        // Ảnh load OK và có kích thước thật
        callback(this.naturalWidth > 0);
    };
    img.onerror = function () {
        // Ảnh lỗi
        callback(false);
    };
    img.src = url;
}
/* ========================================================================
   TRANG TIN CỦA TÔI
   ======================================================================== */
function setupTrangTinCuaToi() {
    renderTinCuaToi();

    const editForm = document.getElementById('editPostForm');
    if (editForm && editForm.dataset.bound !== 'true') {
        editForm.dataset.bound = 'true';
        editForm.addEventListener('submit', xuLySubmitFormSuaTin);
    }

    const editImageInput = document.getElementById('editPostImage');
    const editImagePreview = document.getElementById('editPostImagePreview');
    if (editImageInput && editImagePreview && editImageInput.dataset.bound !== 'true') {
        editImageInput.dataset.bound = 'true';
        editImageInput.addEventListener('input', () => {
            const url = editImageInput.value.trim();
            editImagePreview.src = url || PLACEHOLDER_IMG;
        });
        editImagePreview.onerror = function () {
            this.src = PLACEHOLDER_IMG;
        };
    }
}

function renderTinCuaToi() {
    const container = document.getElementById('myPostsContainer');
    if (!container) return;

    const posts = layBaiDangCuaUserHienTai();

    if (posts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <h2>Bạn chưa đăng tin nào</h2>
                <p>Hãy vào trang <a href="dangtin.html" style="color:#ff8a00; font-weight:600;">Đăng tin</a> để bắt đầu!</p>
            </div>`;
        return;
    }

    let html = '';
    posts.forEach(post => {
        const ngayDang = post.createdAt
            ? new Date(post.createdAt).toLocaleDateString('vi-VN')
            : '';

        // Hiển thị cả 2 giá
        const giaGoc = post.priceOriginal || Math.round(post.price / 1.05);
        const giaHienThi = post.price;
        const priceHtml = `
            <span style="color:#888; text-decoration:line-through; font-size:13px;">
                ${formatGiaTien(giaGoc)} đ
            </span>
            <br>
            <span style="color:#ee4d2d; font-weight:700; font-size:15px;">
                ${formatGiaTien(giaHienThi)} đ
            </span>
            <small style="color:#ff8a00;">(+5%)</small>
        `;

        const trangThaiInfo = TEN_TRANG_THAI[post.status || 'active'];
        const cardStyle = post.status === 'sold' ? 'opacity:0.6; background:#fafafa;' : '';

        let nutHanhDong = '';
        if (post.status === 'active') {
            nutHanhDong = `
                <button type="button" class="btn-edit-post" onclick="moModalSuaTin('${post.id}')">
                    ✏️ Sửa
                </button>
                <button type="button" 
                        onclick="xuLyDanhDauDaBan('${post.id}')"
                        style="background:#e3f2fd; color:#1565c0; border:1.5px solid #90caf9;
                               padding:8px 14px; border-radius:8px; font-weight:700; font-size:13px;
                               white-space:nowrap; cursor:pointer;">
                    ✅ Đã bán
                </button>
                <button type="button" class="btn-delete-post" onclick="xoaTinDaDang('${post.id}')">
                    🗑 Xóa
                </button>`;
        } else {
            nutHanhDong = `
                <span style="color:#999; font-size:13px; font-style:italic;">Đã bán</span>
                <button type="button" class="btn-delete-post" onclick="xoaTinDaDang('${post.id}')">
                    🗑 Xóa
                </button>`;
        }

        html += `
            <div class="my-post-card" style="${cardStyle}">
                <img src="${post.image}" alt="${post.name}" class="my-post-img">
                <div class="my-post-info">
                    <h3>${post.name}</h3>
                    <p class="my-post-price">${priceHtml}</p>
                    <p class="my-post-meta">
                        ${TEN_DANH_MUC[post.cat] || '📦 Sản phẩm'}
                        &nbsp;•&nbsp; 📍 ${post.location || ''}
                    </p>
                    <p class="my-post-meta">
                        🗓 ${ngayDang} 
                        &nbsp;•&nbsp; 
                        <span style="color:${trangThaiInfo.color}; font-weight:700;">${trangThaiInfo.text}</span>
                    </p>
                </div>
                <div class="my-post-actions">
                    ${nutHanhDong}
                </div>
            </div>`;
    });

    container.innerHTML = html;
}

function xuLyDanhDauDaBan(id) {
    if (!confirm('Đánh dấu sản phẩm này là ĐÃ BÁN?')) return;
    if (danhDauDaBan(id)) {
        alert('✅ Đã đánh dấu là đã bán!');
        renderTinCuaToi();
    } else {
        alert('⚠️ Không thể đánh dấu!');
    }
}

function xoaTinDaDang(id) {
    if (!confirm('Bạn chắc chắn muốn XÓA tin này?')) return;
    if (xoaBaiDang(id)) {
        alert('🗑️ Đã xóa tin!');
        renderTinCuaToi();
    } else {
        alert('⚠️ Không thể xóa!');
    }
}

/* ========================================================================
   MODAL SỬA TIN
   ======================================================================== */
function moModalSuaTin(id) {
    const post = layBaiDangTheoId(id);
    if (!post) {
        alert('⚠️ Không tìm thấy tin!');
        return;
    }
    if (post.status === 'sold') {
        alert('⚠️ Không thể sửa sản phẩm đã bán!');
        return;
    }

    // Lấy giá GỐC (không phải giá đã +5%)
    const giaGoc = post.priceOriginal || Math.round(post.price / 1.05);

    document.getElementById('editPostId').value = post.id;
    document.getElementById('editPostName').value = post.name || '';
    document.getElementById('editPostPrice').value = giaGoc;
    document.getElementById('editPostDesc').value = post.desc || '';
    document.getElementById('editPostImage').value = post.image || '';

    const preview = document.getElementById('editPostImagePreview');
    if (preview) preview.src = post.image || PLACEHOLDER_IMG;

    document.getElementById('modalSuaTin').style.display = 'flex';
}

function dongModalSuaTin() {
    document.getElementById('modalSuaTin').style.display = 'none';
}

function xuLySubmitFormSuaTin(e) {
    e.preventDefault();

    const id = document.getElementById('editPostId').value;
    const name = document.getElementById('editPostName').value.trim();
    const priceRaw = document.getElementById('editPostPrice').value;
    const desc = document.getElementById('editPostDesc').value.trim();
    const image = document.getElementById('editPostImage').value.trim();

    if (!name) {
        showToast('⚠️ Vui lòng nhập tên sản phẩm!', 'warning');
        return;
    }

    const priceGoc = Number(priceRaw) || 0;
    if (priceGoc <= 0 || priceGoc > 999999999999) {
        showToast('⚠️ Giá không hợp lệ!', 'warning');
        return;
    }

    if (!image) {
        showToast('⚠️ Vui lòng nhập link ảnh!', 'warning');
        return;
    }

    // ★ Kiểm tra ảnh có tải được không
    kiemTraAnh(image, function(anhOk) {
        if (!anhOk) {
            showToast('❌ Ảnh không tải được! Vui lòng dùng link ảnh khác.', 'error');
            return;
        }

        const priceHienThi = Math.round(priceGoc * 1.05);
        const phi = priceHienThi - priceGoc;

        hienModalXacNhanDangTin({
            priceGoc, phi, priceHienThi,
            onConfirm: function() {
                const dataMoi = { 
                    name, 
                    priceOriginal: priceGoc, 
                    price: priceHienThi, 
                    desc, 
                    image 
                };

                if (capNhatBaiDang(id, dataMoi)) {
                    showToast('✅ Đã lưu thay đổi!', 'success');
                    dongModalSuaTin();
                    renderTinCuaToi();
                } else {
                    showToast('⚠️ Không thể lưu thay đổi!', 'error');
                }
            }
        });
    });
}
/* ========================================================================
   MODAL XÁC NHẬN ĐĂNG TIN (thay cho confirm())
   ======================================================================== */
function hienModalXacNhanDangTin(config) {
    // Xóa modal cũ nếu có
    const oldModal = document.getElementById('modalConfirmDangTin');
    if (oldModal) oldModal.remove();

    const modalHtml = `
        <div id="modalConfirmDangTin" 
             style="position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:9999;
                    display:flex; justify-content:center; align-items:center; padding:20px;">
            <div style="background:#fff; border-radius:12px; max-width:450px; width:100%; padding:25px;">
                <h2 style="margin-bottom:15px; color:#333;">💰 Xác nhận đăng tin</h2>
                
                <div style="background:#f9f9f9; padding:15px; border-radius:8px; margin-bottom:15px;">
                    <p style="margin-bottom:8px;">
                        📌 Giá bạn nhập: 
                        <strong>${formatGiaTien(config.priceGoc)} đ</strong>
                    </p>
                    <p style="margin-bottom:8px; color:#ff8a00;">
                        💰 Phí dịch vụ 5%: 
                        <strong>${formatGiaTien(config.phi)} đ</strong>
                    </p>
                    <hr style="margin:10px 0;">
                    <p style="font-size:16px;">
                        🏷️ Giá hiển thị cho người mua: 
                        <strong style="color:#ee4d2d;">${formatGiaTien(config.priceHienThi)} đ</strong>
                    </p>
                </div>

                <p style="margin-bottom:20px; color:#666; font-size:13px;">
                    Bạn có đồng ý đăng tin với mức giá này không?
                </p>

                <div style="display:flex; gap:10px;">
                    <button onclick="dongModalXacNhanDangTin(true)" 
                            style="flex:1; padding:12px; background:#28a745; color:#fff; 
                                   border:none; border-radius:6px; font-weight:bold; cursor:pointer;">
                        ✅ Đồng ý đăng
                    </button>
                    <button onclick="dongModalXacNhanDangTin(false)" 
                            style="flex:1; padding:12px; background:#dc3545; color:#fff; 
                                   border:none; border-radius:6px; font-weight:bold; cursor:pointer;">
                        ❌ Hủy
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Lưu callback vào biến toàn cục để nút bấm gọi được
    window._callbackDangTin = config.onConfirm;
}

function dongModalXacNhanDangTin(dongY) {
    const modal = document.getElementById('modalConfirmDangTin');
    if (modal) modal.remove();

    if (dongY && typeof window._callbackDangTin === 'function') {
        window._callbackDangTin();
    }
    window._callbackDangTin = null;
}