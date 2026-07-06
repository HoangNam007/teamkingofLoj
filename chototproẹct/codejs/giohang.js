/* ======================================================================== 

   GIOHANG.JS - Giỏ hàng + Yêu thích 

   ------------------------------------------------------------------------ 

   Vai trò: 

   - Quản lý cart theo từng tài khoản 

   - Quản lý favorites theo từng tài khoản 

   - Tạo object sản phẩm từ card 

   - Cập nhật badge giỏ hàng / yêu thích 

   ======================================================================== */ 

 

/* ======================================================================== 

   HELPER: YÊU CẦU ĐĂNG NHẬP 

   ======================================================================== */ 

function canSuDungTinhNangCanDangNhap(message) { 

    if (typeof dangDangNhap === 'function' && dangDangNhap()) { 

        return true; 

    } 

 

    if (typeof yeuCauDangNhap === 'function') { 

        yeuCauDangNhap(message || '⚠️ Vui lòng đăng nhập để sử dụng tính năng này!'); 

    } else if (typeof showToast === 'function') { 

        showToast(message || '⚠️ Vui lòng đăng nhập để sử dụng tính năng này!'); 

        setTimeout(() => { 

            window.location.href = 'taikhoan.html'; 

        }, 1000); 

    } else { 

        alert(message || 'Vui lòng đăng nhập để sử dụng tính năng này!'); 

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

   HELPER: TẠO ID ỔN ĐỊNH CHO SẢN PHẨM 

   ------------------------------------------------------------------------ 

   Nếu sản phẩm hardcode không có data-id thì tạo ID từ: 

   category + name + price 

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

 

    if (currentId && /^\d+$/.test(currentId)) { 

        return Number(currentId); 

    } 

 

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

 

    const priceRaw = card.dataset.price || '0'; 

    const price = parseInt(priceRaw.toString().replace(/\D/g, '')) || 0; 

    const id = taoIdOnDinhChoCard(card); 

    const img = card.querySelector('.card-img'); 

 

    return { 

        id: id, 

        name: card.dataset.name || card.querySelector('h3')?.textContent?.trim() || '', 

        price: price, 

        image: img?.getAttribute('src') || img?.src || 'https://via.placeholder.com/400x300?text=Cho+Tot', 

        cat: card.dataset.cat || 'Sản phẩm', 

        desc: card.dataset.desc || '', 

        location: card.dataset.location || '', 

        qty: card.dataset.qty || '1', 

        seller: card.dataset.seller || '', 

        phone: card.dataset.phone || '', 

        region: card.dataset.region || '', 

        facebook: card.dataset.facebook || card.dataset.fb || '' 

    }; 

} 

 

function layEmailChuSanPham(product) { 

    if (!product) return ''; 

 

    if (product.ownerEmail) return product.ownerEmail; 

 

    if (typeof layBaiDangTheoId === 'function' && product.id) { 

        const post = layBaiDangTheoId(product.id); 

        if (post && post.ownerEmail) return post.ownerEmail; 

    } 

 

    return ''; 

} 

 

// GIỎ HÀNG 

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

 

    // NGĂN THÊM SẢN PHẨM CỦA CHÍNH MÌNH 

    if (currentUser) { 

        const isOwnProduct = 

            (ownerEmail && ownerEmail === currentUser.email) || 

            (product.seller && product.seller === currentUser.name); 

 

        if (isOwnProduct) { 

            showToast('⚠️ Bạn không thể thêm sản phẩm của chính mình vào giỏ hàng!'); 

            return; 

        } 

    } 

 

    const cart = layGioHang(); 

 

    const existed = cart.some(item => String(item.id) === String(product.id)); 

 

    if (existed) { 

        showToast('ℹ️ Sản phẩm đã có trong giỏ hàng!'); 

        return; 

    } 

 

    cart.push(product); 

    luuGioHang(cart); 

    capNhatBadgeGioHang(); 

 

    // ★ GỬI THÔNG BÁO CHO NGƯỜI BÁN (hệ thống mới - theo từng user) 

    if (currentUser && ownerEmail && ownerEmail !== currentUser.email) { 

        if (typeof themThongBaoChoNguoiBan === 'function') { 

            themThongBaoChoNguoiBan({ 

                toEmail: ownerEmail, 

                fromUser: currentUser.name, 

                productName: product.name 

            }); 

        } 

    } 

 

    showToast('🛒 Đã thêm vào giỏ hàng!'); 

} 

 

 

function xoaKhoiGioHang(index) { 

    if (!canSuDungTinhNangCanDangNhap('⚠️ Vui lòng đăng nhập để dùng giỏ hàng!')) { 

        return; 

    } 

 

    const cart = typeof layGioHang === 'function' ? layGioHang() : []; 

 

    if (index < 0 || index >= cart.length) return; 

 

    cart.splice(index, 1); 

 

    if (typeof luuGioHang === 'function') { 

        luuGioHang(cart); 

    } 

 

    capNhatBadgeGioHang(); 

} 

 

function tinhTongTienGioHang() { 

    const cart = typeof layGioHang === 'function' ? layGioHang() : []; 

 

    return cart.reduce((sum, item) => { 

        return sum + (Number(item.price) || 0); 

    }, 0); 

} 

 

function capNhatBadgeGioHang() { 

    const badges = document.querySelectorAll('#cartCount'); 

 

    if (!badges || badges.length === 0) return; 

 

    const cart = typeof layGioHang === 'function' ? layGioHang() : []; 

 

    badges.forEach(badge => { 

        badge.textContent = cart.length; 

        badge.style.display = cart.length > 0 ? 'flex' : 'none'; 

    }); 

} 

 

function hienThiTenDanhMuc(cat) { 

    const map = { 

        dientu: 'Điện tử', 

        phuongtien: 'Phương tiện', 

        trangphuc: 'Thời trang', 

        vatdung: 'Đồ dùng' 

    }; 

 

    return map[cat] || 'Sản phẩm'; 

} 

 

/* ======================================================================== 

   RENDER BẢNG GIỎ HÀNG 

   ======================================================================== */ 

function renderBangGioHang() { 

    const tbody = document.getElementById('cartBody'); 

 

    if (!tbody) return; 

 

    if (typeof dangDangNhap === 'function' && !dangDangNhap()) { 

        tbody.innerHTML = ''; 

        return; 

    } 

 

    const cart = typeof layGioHang === 'function' ? layGioHang() : []; 

 

    if (cart.length === 0) { 

        tbody.innerHTML = ` 

            <tr> 

                <td colspan="5" style="text-align:center; padding:40px; color:#888;"> 

                    🛒 Giỏ hàng trống. 

                    <a href="idea.html" style="color:#ff8a00;">Mua sắm ngay</a> 

                </td> 

            </tr> 

        `; 

 

        capNhatTongTien(); 

        return; 

    } 

 

    let html = ''; 

 

    cart.forEach((item, index) => { 

        const image = escapeHtmlGioHang(item.image || 'https://via.placeholder.com/100x100?text=No+Image'); 

        const name = escapeHtmlGioHang(item.name || 'Sản phẩm'); 

        const cat = escapeHtmlGioHang(hienThiTenDanhMuc(item.cat)); 

        const price = Number(item.price) || 0; 

 

        html += ` 

            <tr id="row-${index}"> 

                <td>${index + 1}</td> 

                <td> 

                    <div style="display:flex; align-items:center; gap:12px;"> 

                        <img src="${image}" alt="${name}" 

                             style="width:60px; height:60px; object-fit:cover; border-radius:8px;"> 

                        <span>${name}</span> 

                    </div> 

                </td> 

                <td>${cat}</td> 

                <td class="price">${price.toLocaleString('vi-VN')} đ</td> 

                <td> 

                    <button class="btn-remove" onclick="xoaSanPhamKhoiBang(${index})"> 

                        ✕ Xóa 

                    </button> 

                </td> 

            </tr> 

        `; 

    }); 

 

    tbody.innerHTML = html; 

 

    capNhatTongTien(); 

} 

 

function xoaSanPhamKhoiBang(index) { 

    if (!canSuDungTinhNangCanDangNhap('⚠️ Vui lòng đăng nhập để dùng giỏ hàng!')) { 

        return; 

    } 

 

    const row = document.getElementById(`row-${index}`); 

 

    if (!row) return; 

 

    row.style.transition = 'opacity 0.3s, transform 0.3s'; 

    row.style.opacity = '0'; 

    row.style.transform = 'translateX(30px)'; 

 

    setTimeout(() => { 

        xoaKhoiGioHang(index); 

        renderBangGioHang(); 

 

        if (typeof showToast === 'function') { 

            showToast('🗑️ Đã xóa sản phẩm khỏi giỏ hàng'); 

        } 

    }, 300); 

} 

 

function capNhatTongTien() { 

    const elem = document.getElementById('totalPrice'); 

 

    if (!elem) return; 

 

    const total = tinhTongTienGioHang(); 

 

    elem.textContent = total.toLocaleString('vi-VN') + ' đ'; 

} 

 

function thanhToan() { 

    if (!canSuDungTinhNangCanDangNhap('⚠️ Vui lòng đăng nhập để thanh toán!')) { 

        return; 

    } 

 

    const cart = typeof layGioHang === 'function' ? layGioHang() : []; 

 

    if (cart.length === 0) { 

        if (typeof showToast === 'function') { 

            showToast('⚠️ Giỏ hàng trống!'); 

        } 

        return; 

    } 

 

    const total = tinhTongTienGioHang(); 

 

    const message = 

        `🛒 THANH TOÁN DEMO\n\n` + 

        `📦 Sản phẩm (${cart.length}):\n` + 

        cart.map(p => '• ' + p.name).join('\n') + 

        `\n\n💰 Tổng tiền: ${total.toLocaleString('vi-VN')} đ\n\n` + 

        `⚠️ Tính năng thanh toán đang được phát triển!`; 

 

    alert(message); 

 

    if (typeof showToast === 'function') { 

        showToast('⏳ Tính năng thanh toán đang phát triển...'); 

    } 

} 

 

/* ======================================================================== 

   YÊU THÍCH 

   ======================================================================== */ 

function laYeuThich(productId) { 

    if (!productId) return false; 

 

    const favorites = typeof layDanhSachYeuThich === 'function' 

        ? layDanhSachYeuThich() 

        : []; 

 

    return favorites.some(f => String(f.id) === String(productId)); 

} 

 

function toggleYeuThich(product) { 

    if (!canSuDungTinhNangCanDangNhap('⚠️ Vui lòng đăng nhập để thêm yêu thích!')) { 

        return false; 

    } 

 

    if (!product || !product.id) { 

        if (typeof showToast === 'function') { 

            showToast('⚠️ Sản phẩm không hợp lệ!'); 

        } 

        return false; 

    } 

 

    let favorites = typeof layDanhSachYeuThich === 'function' 

        ? layDanhSachYeuThich() 

        : []; 

 

    const existIndex = favorites.findIndex(f => String(f.id) === String(product.id)); 

 

    if (existIndex > -1) { 

        favorites.splice(existIndex, 1); 

 

        if (typeof luuDanhSachYeuThich === 'function') { 

            luuDanhSachYeuThich(favorites); 

        } 

 

        capNhatBadgeYeuThich(); 

 

        if (typeof showToast === 'function') { 

            showToast('💔 Đã bỏ yêu thích'); 

        } 

 

        return false; 

    } 

 

    favorites.push(product); 

 

    if (typeof luuDanhSachYeuThich === 'function') { 

        luuDanhSachYeuThich(favorites); 

    } 

 

    capNhatBadgeYeuThich(); 

 

    if (typeof showToast === 'function') { 

        showToast('❤️ Đã thêm yêu thích!'); 

    } 

 

    return true; 

} 

 

function xoaKhoiYeuThich(productId) { 

    if (!canSuDungTinhNangCanDangNhap('⚠️ Vui lòng đăng nhập để quản lý yêu thích!')) { 

        return; 

    } 

 

    let favorites = typeof layDanhSachYeuThich === 'function' 

        ? layDanhSachYeuThich() 

        : []; 

 

    favorites = favorites.filter(f => String(f.id) !== String(productId)); 

 

    if (typeof luuDanhSachYeuThich === 'function') { 

        luuDanhSachYeuThich(favorites); 

    } 

 

    capNhatBadgeYeuThich(); 

 

    if (typeof showToast === 'function') { 

        showToast('💔 Đã bỏ sản phẩm khỏi yêu thích'); 

    } 

} 

 

function capNhatBadgeYeuThich() { 

    const badges = document.querySelectorAll('#favCount'); 

 

    if (!badges || badges.length === 0) return; 

 

    const favorites = typeof layDanhSachYeuThich === 'function' 

        ? layDanhSachYeuThich() 

        : []; 

 

    badges.forEach(badge => { 

        badge.textContent = favorites.length; 

        badge.style.display = favorites.length > 0 ? 'flex' : 'none'; 

    }); 

} 

 
