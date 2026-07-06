/* ======================================================================== 

   GIAODIEN.JS - Components giao diện chung 

   ------------------------------------------------------------------------ 

   Vai trò: 

   - Toast notification 

   - Modal chi tiết sản phẩm 

   - Dropdown khu vực 

   - Gắn sự kiện cho product card 

   - Xử lý nút thêm giỏ trong modal 

   - Bỏ nút gọi điện / nhắn tin 

   - Hỗ trợ nút Facebook người bán nếu sản phẩm có data-facebook 

   ======================================================================== */ 

 

// Sản phẩm đang được mở trong modal 

let sanPhamDangXem = null; 

 

/* ======================================================================== 

   TOAST - Thông báo góc dưới 

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

   MODAL - HIỂN THỊ CHI TIẾT SẢN PHẨM 

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

    const modalQty = document.getElementById('modalQty'); 

    const modalSeller = document.getElementById('modalSeller'); 

    const modalPhone = document.getElementById('modalPhone'); 

 

    if (modalImg) { 

        modalImg.src = product.image || 'https://via.placeholder.com/400x300?text=Cho+Tot'; 

        modalImg.alt = product.name || 'Sản phẩm'; 

 

        modalImg.onerror = function () { 

            this.src = 'https://via.placeholder.com/400x300?text=No+Image'; 

        }; 

    } 

 

    if (modalName) { 

        modalName.textContent = product.name || 'Sản phẩm'; 

    } 

 

    if (modalPrice) { 

        modalPrice.textContent = '₫' + (Number(product.price) || 0).toLocaleString('vi-VN'); 

    } 

 

    if (modalDesc) { 

        modalDesc.textContent = product.desc || 'Không có mô tả'; 

    } 

 

    if (modalLocation) { 

        modalLocation.textContent = product.location || 'Chưa cập nhật'; 

    } 

 

    if (modalQty) { 

        modalQty.textContent = product.qty || '1'; 

    } 

 

    if (modalSeller) { 

        modalSeller.textContent = product.seller || 'Ẩn danh'; 

    } 

 

    /* 

       Số điện thoại: 

       - Đăng nhập rồi mới xem được 

       - Không có nút gọi điện nữa 

    */ 

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

 

    if (modal) { 

        modal.classList.remove('show'); 

    } 

 

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

   SETUP MODAL EVENTS 

   ======================================================================== */ 

function setupModalEvents() { 

    const modal = document.getElementById('modal'); 

 

    if (!modal) return; 

 

    if (modal.dataset.modalEventsBound === 'true') return; 

    modal.dataset.modalEventsBound = 'true'; 

 

    // Click ra ngoài modal để đóng 

    modal.addEventListener('click', (e) => { 

        if (e.target === modal) { 

            dongModal(); 

        } 

    }); 

 

    // Nhấn ESC để đóng 

    document.addEventListener('keydown', (e) => { 

        if (e.key === 'Escape') { 

            dongModal(); 

        } 

    }); 

} 

 

/* ======================================================================== 

   DROPDOWN KHU VỰC 

   ------------------------------------------------------------------------ 

   File này chỉ mở / đóng dropdown. 

   Logic lọc theo miền nằm trong trang.js 

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

   ------------------------------------------------------------------------ 

   - Click card: mở modal 

   - Click tim: yêu thích 

   - Click giỏ: thêm giỏ hàng 

   ======================================================================== */ 

function setupCardEvents() { 

    const cards = document.querySelectorAll('.product-card'); 

 

    cards.forEach(card => { 

        // Nếu card đã bind rồi thì chỉ cập nhật trạng thái tim 

        if (card.dataset.cardEventsBound === 'true') { 

            capNhatTrangThaiTimChoCard(card); 

            return; 

        } 

 

        card.dataset.cardEventsBound = 'true'; 

 

        // Đảm bảo card có ID ổn định 

        if (typeof taoProductTuCard === 'function') { 

            taoProductTuCard(card); 

        } 

 

        // Click card mở modal 

        card.addEventListener('click', (e) => { 

            if (e.target.closest('.card-btn')) return; 

 

            if (typeof taoProductTuCard !== 'function') return; 

 

            const product = taoProductTuCard(card); 

            moModal(product); 

        }); 

 

        // Nút yêu thích 

        const btnHeart = card.querySelector('.btn-heart'); 

 

        if (btnHeart) { 

            capNhatTrangThaiTimChoCard(card); 

 

            btnHeart.addEventListener('click', (e) => { 

                e.stopPropagation(); 

 

                if (!yeuCauDangNhapNeuCan('⚠️ Vui lòng đăng nhập để thêm yêu thích!')) { 

                    return; 

                } 

 

                if (typeof taoProductTuCard !== 'function' || typeof toggleYeuThich !== 'function') { 

                    return; 

                } 

 

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

 

        // Nút thêm giỏ hàng 

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

   CẬP NHẬT TRẠNG THÁI TIM CHO CARD 

   ======================================================================== */ 

function capNhatTrangThaiTimChoCard(card) { 

    const btnHeart = card.querySelector('.btn-heart'); 

 

    if (!btnHeart) return; 

    if (typeof taoProductTuCard !== 'function') return; 

    if (typeof laYeuThich !== 'function') return; 

 

    const product = taoProductTuCard(card); 

 

    if (product && laYeuThich(product.id)) { 

        btnHeart.classList.add('liked'); 

        btnHeart.textContent = '♥'; 

    } else { 

        btnHeart.classList.remove('liked'); 

        btnHeart.textContent = '♡'; 

    } 

} 

 

/* ======================================================================== 

   SETUP NÚT TRONG MODAL 

   ------------------------------------------------------------------------ 

   Hiện tại chỉ giữ: 

   - Thêm vào giỏ 

   - Facebook người bán nếu có 

   Bỏ: 

   - Gọi điện 

   - Nhắn tin 

   ======================================================================== */ 

function setupModalActions() { 

    const btnAddCart = document.querySelector('.btn-add-cart'); 

    const btnContact = document.querySelector('.btn-contact'); 

    const btnMessage = document.querySelector('.btn-message'); 

    const btnClose = document.querySelector('.modal-close'); 

    const modalActions = document.querySelector('.modal-actions'); 

 

    // Xóa nút Gọi điện nếu HTML cũ còn 

    if (btnContact) { 

        btnContact.remove(); 

    } 

 

    // Xóa nút Nhắn tin nếu HTML cũ còn 

    if (btnMessage) { 

        btnMessage.remove(); 

    } 

 

    // Nút thêm vào giỏ 

    if (btnAddCart) { 

        btnAddCart.onclick = themSpDangXemVaoGio; 

    } 

 

    /* 

       Tạo nút Facebook người bán. 

       Nếu sản phẩm không có facebook thì nút ẩn. 

    */ 

    if (modalActions && !document.querySelector('.btn-facebook')) { 

        const btnFacebook = document.createElement('button'); 

 

        btnFacebook.type = 'button'; 

        btnFacebook.className = 'btn-facebook'; 

        btnFacebook.textContent = 'Facebook người bán'; 

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

 

    // Nút đóng modal 

    if (btnClose) { 

        btnClose.onclick = dongModal; 

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

 

    if (hasFacebook && isLoggedIn) { 

        btnFacebook.style.display = 'block'; 

    } else { 

        btnFacebook.style.display = 'none'; 

    } 

} 

/* ======================================================================== 

   THÔNG BÁO (Chuông) 

   ======================================================================== */ 

 

function themThongBao(noti) { 

    let notis = JSON.parse(localStorage.getItem('notifications') || '[]'); 

    notis.unshift({ 

        id: Date.now(), 

        fromUser: noti.fromUser || 'Người dùng', 

        productName: noti.productName || 'Sản phẩm', 

        time: new Date().toISOString() 

    }); 

    if (notis.length > 10) notis.pop(); 

    localStorage.setItem('notifications', JSON.stringify(notis)); 

    capNhatSoThongBao(); 

} 

 

function capNhatSoThongBao() { 

    const countEl = document.getElementById('notiCount'); 

    if (!countEl) return; 

    const notis = JSON.parse(localStorage.getItem('notifications') || '[]'); 

    countEl.textContent = notis.length; 

    countEl.style.display = notis.length > 0 ? 'flex' : 'none'; 

} 

 

function setupNotification() { 

    const notiBtn = document.getElementById('notificationBtn'); 

    if (!notiBtn) return; 

 

    notiBtn.addEventListener('mouseenter', () => { 

        const notis = JSON.parse(localStorage.getItem('notifications') || '[]'); 

        if (notis.length === 0) { 

            showToast('Chưa có ai quan tâm đến sản phẩm của bạn'); 

            return; 

        } 

 

        let html = `<div style="position:absolute;background:#fff;border:1px solid #ddd;padding:12px;border-radius:8px;width:320px;z-index:10000;box-shadow:0 6px 20px rgba(0,0,0,0.3);right:0;top:55px;max-height:320px;overflow-y:auto;">`; 

        html += `<h4 style="margin:0 0 10px 0;color:#222;">Người quan tâm gần đây (${notis.length})</h4>`; 

 

        notis.slice(0, 3).forEach(n => { 

            html += ` 

                <div style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;"> 

                    <strong>${n.fromUser}</strong> đã thêm vào giỏ<br> 

                    <small style="color:#555">"${n.productName}"</small> 

                </div>`; 

        }); 

        html += `</div>`; 

 

        const popup = document.createElement('div'); 

        popup.innerHTML = html; 

        notiBtn.appendChild(popup); 

 

        setTimeout(() => popup.remove(), 7000); 

    }); 

} 

 

// Gọi khi trang load 

document.addEventListener('DOMContentLoaded', () => { 

    capNhatSoThongBao(); 

    setupNotification(); 

}); 

 

/* ======================================================================== 

   THÔNG BÁO - Chuông (ĐÃ HOÀN CHỈNH) 

   ======================================================================== */ 

 

function themThongBao(noti) { 

    try { 

        let notis = JSON.parse(localStorage.getItem('notifications') || '[]'); 

        notis.unshift({ 

            id: Date.now(), 

            fromUser: noti.fromUser || 'Người dùng', 

            productName: noti.productName || 'Sản phẩm', 

            time: new Date().toISOString() 

        }); 

        if (notis.length > 10) notis.pop(); 

        localStorage.setItem('notifications', JSON.stringify(notis)); 

        capNhatSoThongBao(); 

    } catch(e) { 

        console.error("Lỗi thông báo:", e); 

    } 

} 

 

function capNhatSoThongBao() { 

    const countEl = document.getElementById('notiCount'); 

    if (!countEl) return; 

    const notis = JSON.parse(localStorage.getItem('notifications') || '[]'); 

    countEl.textContent = notis.length; 

    countEl.style.display = notis.length > 0 ? 'flex' : 'none'; 

} 

 

function setupNotification() { 

    const notiBtn = document.getElementById('notificationBtn'); 

    if (!notiBtn) return; 

 

    notiBtn.addEventListener('mouseenter', () => { 

        const notis = JSON.parse(localStorage.getItem('notifications') || '[]'); 

        if (notis.length === 0) { 

            showToast('Chưa có ai quan tâm đến sản phẩm của bạn'); 

            return; 

        } 

 

        let html = `<div style="position:absolute;background:#fff;border:1px solid #ddd;padding:12px;border-radius:8px;width:320px;z-index:10000;box-shadow:0 6px 20px rgba(0,0,0,0.3);right:0;top:55px;max-height:320px;overflow-y:auto;">`; 

        html += `<h4 style="margin:0 0 10px 0;color:#222;">Người quan tâm gần đây (${notis.length})</h4>`; 

 

        notis.slice(0, 3).forEach(n => { 

            html += ` 

                <div style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px;"> 

                    <strong>${n.fromUser}</strong> đã thêm vào giỏ<br> 

                    <small style="color:#555">"${n.productName}"</small> 

                </div>`; 

        }); 

        html += `</div>`; 

 

        const popup = document.createElement('div'); 

        popup.innerHTML = html; 

        notiBtn.appendChild(popup); 

 

        setTimeout(() => popup.remove(), 7000); 

    }); 

} 

 

// Gọi khi load trang 

document.addEventListener('DOMContentLoaded', () => { 

    capNhatSoThongBao(); 

    setupNotification(); 

}); 

 
