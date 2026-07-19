/* ========================================================================
   DANGTIN-PAGE.JS - Script trang dangtin.html
   ------------------------------------------------------------------------
   - Preview ảnh
   - Chuyển tab (Đăng tin / Tin của tôi)
   - Render tin của tôi (lọc theo tên + danh mục)
   - Sửa tin (đầy đủ: giá, khối lượng, mô tả, địa chỉ cụ thể, ảnh)
   - Xóa tin
   ======================================================================== */

const TEN_DANH_MUC_DANGTIN = {
    dientu: '📱 Điện tử',
    phuongtien: '🚗 Phương tiện',
    trangphuc: '👕 Thời trang',
    vatdung: '🏠 Vật dụng',
    khac: '🎁 Khác'
};

function escapeHtmlDangTin(value) {
    return (value ?? '')
        .toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/* ========================================================================
   PREVIEW ẢNH
   ======================================================================== */
function capNhatAnhPreview() {
    const imageInput = document.getElementById('postImageInput');
    const imagePreview = document.getElementById('postImagePreview');
    if (!imageInput || !imagePreview) return;

    const defaultImage = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23f5f5f5'/><text x='50%25' y='50%25' font-family='Arial,sans-serif' font-size='24' fill='%23bbb' text-anchor='middle' dominant-baseline='middle'>Chợ Tốt</text></svg>";

    const url = imageInput.value.trim();
    imagePreview.src = url || defaultImage;
}

/* ========================================================================
   TAB
   ======================================================================== */
function chuyenTabDangTin(tab) {
    const tabDangTin = document.getElementById('tabDangTin');
    const tabTinCuaToi = document.getElementById('tabTinCuaToi');
    const contentDangTin = document.getElementById('tabContentDangTin');
    const contentTinCuaToi = document.getElementById('tabContentTinCuaToi');

    if (!tabDangTin || !tabTinCuaToi) return;

    const laDangTin = tab === 'dangtin';

    tabDangTin.classList.toggle('active', laDangTin);
    tabTinCuaToi.classList.toggle('active', !laDangTin);

    if (contentDangTin) contentDangTin.style.display = laDangTin ? 'block' : 'none';
    if (contentTinCuaToi) contentTinCuaToi.style.display = laDangTin ? 'none' : 'block';

    if (!laDangTin) {
        renderTinCuaToi();
    }
}

/* ========================================================================
   CẬP NHẬT SỐ TIN
   ======================================================================== */
function capNhatSoTinCuaToi() {
    const countEl = document.getElementById('myPostCount');
    if (!countEl) return;

    const posts = typeof layBaiDangCuaUserHienTai === 'function'
        ? layBaiDangCuaUserHienTai() : [];

    countEl.textContent = posts.length > 0 ? '(' + posts.length + ')' : '';
}

/* ========================================================================
   RENDER TIN CỦA TÔI
   ======================================================================== */
function renderTinCuaToi() {
    const container = document.getElementById('myPostsContainer');
    if (!container) return;

    const posts = typeof layBaiDangCuaUserHienTai === 'function'
        ? layBaiDangCuaUserHienTai() : [];

    capNhatSoTinCuaToi();

    if (posts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <h2>Bạn chưa đăng tin nào</h2>
                <p>Chuyển sang tab "Đăng tin mới" để đăng bán sản phẩm đầu tiên nhé!</p>
            </div>`;
        return;
    }

    // Lọc (chỉ tên + danh mục)
    const keyword = (document.getElementById('myPostSearch')?.value || '').toLowerCase().trim();
    const catFilter = document.getElementById('myPostCatFilter')?.value || 'all';

    const filtered = posts.filter(post => {
        const matchName = !keyword || (post.name || '').toLowerCase().includes(keyword);
        const matchCat = catFilter === 'all' || post.cat === catFilter;
        return matchName && matchCat;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔎</div>
                <h2>Không tìm thấy tin phù hợp</h2>
                <p>Thử từ khóa hoặc danh mục khác nhé.</p>
            </div>`;
        return;
    }

    let html = '';
    filtered.forEach(post => {
        const ngayDang = post.createdAt
            ? new Date(post.createdAt).toLocaleDateString('vi-VN')
            : '';

        const defaultImg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='90' height='90'><rect width='90' height='90' fill='%23f5f5f5'/></svg>";

        // Địa chỉ đầy đủ (tỉnh + địa chỉ cụ thể)
        const diaChiDayDu = (post.location || 'Chưa rõ') + 
            (post.detailAddress ? ', ' + post.detailAddress : '');

        // Giá (dùng formatGiaTien nếu có, không có thì fallback)
        const priceText = typeof formatGiaTien === 'function' 
            ? formatGiaTien(post.price) 
            : (Number(post.price) || 0).toLocaleString('vi-VN');

        html += `
            <div class="my-post-card" data-id="${escapeHtmlDangTin(post.id)}">
                <img src="${escapeHtmlDangTin(post.image || defaultImg)}"
                     alt="${escapeHtmlDangTin(post.name)}"
                     class="my-post-img"
                     onerror="this.onerror=null;this.src='${defaultImg}';">
                <div class="my-post-info">
                    <h3>${escapeHtmlDangTin(post.name)}</h3>
                    <p class="my-post-price">${priceText} ₫</p>
                    <p class="my-post-meta">
                        ${TEN_DANH_MUC_DANGTIN[post.cat] || '📦 Sản phẩm'}
                        &nbsp;•&nbsp; 📍 ${escapeHtmlDangTin(diaChiDayDu)}
                    </p>
                    <p class="my-post-meta">🗓 Đăng ngày: ${ngayDang}</p>
                </div>
                <div class="my-post-actions">
                    <button type="button" class="btn-edit-post"
                            onclick="moModalSuaTin('${escapeHtmlDangTin(post.id)}')">
                        ✏️ Sửa
                    </button>
                    <button type="button" class="btn-delete-post"
                            onclick="xoaTinDaDang('${escapeHtmlDangTin(post.id)}')">
                        🗑 Xóa
                    </button>
                </div>
            </div>`;
    });

    container.innerHTML = html;
}

function locTinCuaToi() {
    renderTinCuaToi();
}

/* ========================================================================
   MODAL SỬA TIN
   ======================================================================== */
// Biến lưu snapshot dữ liệu ban đầu (để so sánh khi thoát)
let snapshotDuLieuSuaTin = null;

function moModalSuaTin(id) {
    const posts = typeof layDanhSachBaiDang === 'function'
        ? layDanhSachBaiDang() : [];
    const post = posts.find(p => String(p.id) === String(id));

    if (!post) {
        showToast('⚠️ Không tìm thấy tin!');
        return;
    }

    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    };

    setVal('editPostId', post.id);
    setVal('editPostName', post.name || '');
    setVal('editPostPrice', post.price || '');
    setVal('editPostWeight', post.weight || '');
    setVal('editPostDesc', post.desc || '');
    setVal('editPostDetailAddress', post.detailAddress || '');
    setVal('editPostImage', post.image || '');

    // ★ Lưu snapshot data ban đầu
    snapshotDuLieuSuaTin = layDuLieuFormSuaTin();

    const modal = document.getElementById('modalSuaTin');
    if (modal) modal.classList.add('show');
}

function dongModalSuaTin() {
    const modal = document.getElementById('modalSuaTin');
    if (modal) modal.classList.remove('show');
    snapshotDuLieuSuaTin = null;
}

// Hàm helper: lấy toàn bộ dữ liệu form hiện tại
function layDuLieuFormSuaTin() {
    return {
        name: (document.getElementById('editPostName')?.value || '').trim(),
        price: (document.getElementById('editPostPrice')?.value || '').trim(),
        weight: (document.getElementById('editPostWeight')?.value || '').trim(),
        desc: (document.getElementById('editPostDesc')?.value || '').trim(),
        detailAddress: (document.getElementById('editPostDetailAddress')?.value || '').trim(),
        image: (document.getElementById('editPostImage')?.value || '').trim()
    };
}

// Hàm helper: khôi phục form về snapshot
function khoiPhucFormSuaTin() {
    if (!snapshotDuLieuSuaTin) return;
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    };
    setVal('editPostName', snapshotDuLieuSuaTin.name);
    setVal('editPostPrice', snapshotDuLieuSuaTin.price);
    setVal('editPostWeight', snapshotDuLieuSuaTin.weight);
    setVal('editPostDesc', snapshotDuLieuSuaTin.desc);
    setVal('editPostDetailAddress', snapshotDuLieuSuaTin.detailAddress);
    setVal('editPostImage', snapshotDuLieuSuaTin.image);
}

// Nút Hủy: reset về snapshot rồi đóng
function huyModalSuaTin() {
    khoiPhucFormSuaTin();
    dongModalSuaTin();
}

// Click ra ngoài: nếu có thay đổi → hỏi lưu
function xuLyClickNgoaiModalSuaTin(e) {
    const modal = document.getElementById('modalSuaTin');
    if (!modal || e.target !== modal) return;

    // So sánh snapshot với dữ liệu hiện tại
    const current = layDuLieuFormSuaTin();
    const hasChange = snapshotDuLieuSuaTin && (
        current.name !== snapshotDuLieuSuaTin.name ||
        current.price !== snapshotDuLieuSuaTin.price ||
        current.weight !== snapshotDuLieuSuaTin.weight ||
        current.desc !== snapshotDuLieuSuaTin.desc ||
        current.detailAddress !== snapshotDuLieuSuaTin.detailAddress ||
        current.image !== snapshotDuLieuSuaTin.image
    );

    if (hasChange) {
        const wantSave = confirm('Bạn có muốn lưu thay đổi trước khi thoát không?\n\n👉 OK: Lưu và thoát\n👉 Cancel: Không lưu, thoát luôn');
        if (wantSave) {
            // Trigger submit form để lưu
            const form = document.getElementById('editPostForm');
            if (form) form.requestSubmit();
            return;
        }
        // Không lưu → khôi phục và đóng
        khoiPhucFormSuaTin();
    }

    dongModalSuaTin();
}

/* ========================================================================
   XÓA TIN
   ======================================================================== */
function xoaTinDaDang(id) {
    if (!confirm('Bạn chắc chắn muốn xóa tin này? Hành động không thể hoàn tác.')) {
        return;
    }

    if (typeof xoaBaiDang === 'function' && xoaBaiDang(id)) {
        showToast('🗑️ Đã xóa tin đăng!');
        renderTinCuaToi();
    } else {
        showToast('⚠️ Không thể xóa tin này!');
    }
}

/* ========================================================================
   SUBMIT FORM SỬA TIN
   ======================================================================== */
function xuLySubmitFormSuaTin(e) {
    e.preventDefault();

    const id = document.getElementById('editPostId')?.value || '';
    const name = (document.getElementById('editPostName')?.value || '').trim();
    const priceRaw = document.getElementById('editPostPrice')?.value || '';
    const weight = (document.getElementById('editPostWeight')?.value || '').toString().trim();
    const desc = (document.getElementById('editPostDesc')?.value || '').trim();
    const detailAddress = (document.getElementById('editPostDetailAddress')?.value || '').trim();
    const image = (document.getElementById('editPostImage')?.value || '').trim();

    // Validate
    if (!name) {
        showToast('⚠️ Vui lòng nhập tên sản phẩm!');
        return;
    }

    const price = Math.round(Number(priceRaw)) || 0;
    if (price <= 0) {
        showToast('⚠️ Giá bán phải lớn hơn 0!');
        return;
    }

    if (!image) {
        showToast('⚠️ Vui lòng nhập link ảnh!');
        return;
    }
    if (!/^https?:\/\/.+/.test(image)) {
        showToast('❌ Link ảnh không hợp lệ!');
        return;
    }

    const dataMoi = { name, price, weight, desc, detailAddress, image };

    if (typeof capNhatBaiDang === 'function' && capNhatBaiDang(id, dataMoi)) {
        showToast('✅ Đã lưu thay đổi!');
        dongModalSuaTin();
        renderTinCuaToi();
    } else {
        showToast('⚠️ Không thể lưu thay đổi!');
    }
}

/* ========================================================================
   KHỞI TẠO KHI DOM READY
   ======================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Preview ảnh
    const imageInput = document.getElementById('postImageInput');
    const imagePreview = document.getElementById('postImagePreview');
    if (imageInput) imageInput.addEventListener('input', capNhatAnhPreview);
    if (imagePreview) {
        imagePreview.onerror = function () {
            this.onerror = null;
            this.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='400' height='300' fill='%23f5f5f5'/><text x='50%25' y='50%25' font-family='Arial,sans-serif' font-size='24' fill='%23bbb' text-anchor='middle' dominant-baseline='middle'>Chợ Tốt</text></svg>";
        };
    }

    // Tab
    const tabDangTin = document.getElementById('tabDangTin');
    const tabTinCuaToi = document.getElementById('tabTinCuaToi');
    if (tabDangTin) tabDangTin.addEventListener('click', () => chuyenTabDangTin('dangtin'));
    if (tabTinCuaToi) tabTinCuaToi.addEventListener('click', () => chuyenTabDangTin('tincuatoi'));

    // Form sửa tin
    const editForm = document.getElementById('editPostForm');
    if (editForm && editForm.dataset.bound !== 'true') {
        editForm.dataset.bound = 'true';
        editForm.addEventListener('submit', xuLySubmitFormSuaTin);
    }
        // ★ Gắn sự kiện click ra ngoài modal sửa tin
    const modalSuaTin = document.getElementById('modalSuaTin');
    if (modalSuaTin && modalSuaTin.dataset.bound !== 'true') {
        modalSuaTin.dataset.bound = 'true';
        modalSuaTin.addEventListener('click', xuLyClickNgoaiModalSuaTin);
    }
    // Cập nhật số tin nếu đã đăng nhập
    if (typeof dangDangNhap === 'function' && dangDangNhap()) {
        capNhatSoTinCuaToi();
    }
});
