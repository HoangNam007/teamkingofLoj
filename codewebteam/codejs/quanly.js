let SORT_MODE = 'default';   
let SORT_DIR = 'desc';       
let EMAIL_DANG_CHAN = '';     
function khoiTaoNoiDungAdmin() {
    capNhatThongKe();
    renderDanhSachUsers();
}

function capNhatThongKe() {
    const users = layDanhSachUsers();
    const posts = layDanhSachBaiDang();

    const totalUsers = users.length;
    const totalActive = posts.filter(p => (p.status || 'active') === 'active').length;
    const totalSold = posts.filter(p => p.status === 'sold').length;

    let totalRevenue = 0;
    let totalProfit = 0;
    posts.filter(p => p.status === 'sold').forEach(p => {
        const giaGoc = p.priceOriginal || Math.round(p.price / 1.05);
        totalRevenue += giaGoc;
        totalProfit += Math.round(giaGoc * 0.05);
    });

    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('totalActivePosts').textContent = totalActive;
    document.getElementById('totalSold').textContent = totalSold;
    document.getElementById('totalRevenue').textContent = formatGiaTien(totalRevenue) + 'đ';
    document.getElementById('totalProfit').textContent = formatGiaTien(totalProfit) + 'đ';
}

function renderDanhSachUsers() {
    const tbody = document.getElementById('adminUsersBody');
    if (!tbody) return;

    const users = layDanhSachUsers();
    const posts = layDanhSachBaiDang();

    const filterRegion = document.getElementById('filterRegion')?.value || 'all';
    let filtered = users;
    if (filterRegion !== 'all') {
        filtered = filtered.filter(u => u.region === filterRegion);
    }

    const userStats = filtered.map(u => {
        const userEmail = chuanHoaEmail(u.email);
        const myPosts = posts.filter(p => chuanHoaEmail(p.ownerEmail) === userEmail);
        const activeCount = myPosts.filter(p => (p.status || 'active') === 'active').length;
        const soldCount = myPosts.filter(p => p.status === 'sold').length;

        let revenue = 0;
        let profit = 0;
        myPosts.filter(p => p.status === 'sold').forEach(p => {
            const giaGoc = p.priceOriginal || Math.round(p.price / 1.05);
            revenue += giaGoc;
            profit += Math.round(giaGoc * 0.05);
        });

        return {
            ...u,
            _active: activeCount,
            _sold: soldCount,
            _revenue: revenue,
            _profit: profit
        };
    });

    if (SORT_MODE === 'default') {
     
        userStats.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
        const key = '_' + SORT_MODE;
        userStats.sort((a, b) => {
            if (SORT_DIR === 'asc') return a[key] - b[key];
            return b[key] - a[key];
        });
    }

    if (userStats.length === 0) {
        tbody.innerHTML = `<tr><td colspan="12" style="text-align:center; padding:30px; color:#888;">
            Không có người dùng nào.
        </td></tr>`;
        return;
    }

    let html = '';
    userStats.forEach((u, index) => {
        const isAdmin = laAdmin(u);
        const isBlocked = u.blocked === true;
        const rowStyle = isBlocked ? 'opacity:0.5; background:#ffebee;' : '';

        html += `
            <tr style="${rowStyle}">
                <td class="stt">${index + 1}</td>
                <td>
                    <strong>${u.name}</strong>
                    ${isAdmin ? '<span class="admin-badge">ADMIN</span>' : ''}
                </td>
                <td>${u.email}</td>
                <td>${u.phone || ''}</td>
                <td>${u.city || ''}</td>
                <td>${u.region || ''}</td>
                <td style="text-align:center;">
                    <span class="badge-count ${u._active > 0 ? '' : 'gray'}">${u._active}</span>
                </td>
                <td style="text-align:center;">
                    <span class="badge-count ${u._sold > 0 ? 'sold' : 'gray'}">${u._sold}</span>
                </td>
                <td style="text-align:right; font-weight:bold; color:#ee4d2d;">
                    ${formatGiaTien(u._revenue)}đ
                </td>
                <td style="text-align:right; font-weight:bold; color:#28a745;">
                    ${formatGiaTien(u._profit)}đ
                </td>
                <td style="text-align:center;">
                    ${isBlocked 
                        ? '<span style="color:#dc3545; font-weight:bold;">🔒 Đã chặn</span>' 
                        : '<span style="color:#28a745; font-weight:bold;">✅ OK</span>'}
                </td>
                <td style="text-align:center;">
                    ${isAdmin 
                        ? '<span style="color:#999; font-style:italic; font-size:12px;">Admin</span>'
                        : (isBlocked 
                            ? `<button onclick="moKhoaUserUI('${u.email}')" 
                                     style="padding:5px 10px; background:#28a745; color:#fff; 
                                            border:none; border-radius:4px; cursor:pointer; font-size:12px;">
                                🔓 Mở khóa
                              </button>`
                            : `<button onclick="moModalChan('${u.email}', '${u.name}')" 
                                     style="padding:5px 10px; background:#dc3545; color:#fff; 
                                            border:none; border-radius:4px; cursor:pointer; font-size:12px;">
                                🔒 Chặn
                              </button>`)
                    }
                </td>
            </tr>`;
    });

    tbody.innerHTML = html;
}

function doiSort(mode, direction) {
    if (direction === 'none') {
        SORT_MODE = 'default';
        SORT_DIR = 'desc';
    } else {
        SORT_MODE = mode;
        SORT_DIR = direction;
    }

    // Reset các dropdown khác về "Mặc định"
    const allSorts = ['sortActive', 'sortSold', 'sortRevenue', 'sortProfit'];
    const currentId = 'sort' + mode.charAt(0).toUpperCase() + mode.slice(1);
    allSorts.forEach(id => {
        if (id !== currentId) {
            const el = document.getElementById(id);
            if (el) el.value = 'none';
        }
    });

    renderDanhSachUsers();
}
function moModalChan(email, name) {
    EMAIL_DANG_CHAN = email;
    document.getElementById('modalChanName').textContent = name;
    document.getElementById('lyDoChan').value = '';
    document.getElementById('modalChan').style.display = 'flex';
}

function dongModalChan() {
    document.getElementById('modalChan').style.display = 'none';
    EMAIL_DANG_CHAN = '';
}

function xacNhanChan() {
    const lyDo = document.getElementById('lyDoChan').value.trim();
    if (!lyDo) {
        alert('⚠️ Vui lòng nhập lý do chặn!');
        return;
    }

    if (chanUser(EMAIL_DANG_CHAN, lyDo)) {
        alert('✅ Đã chặn user!');
        dongModalChan();
        renderDanhSachUsers();
        capNhatThongKe();
    } else {
        alert('⚠️ Không thể chặn user!');
    }
}

function moKhoaUserUI(email) {
    if (!confirm('Mở khóa cho user này?')) return;
    if (moKhoaUser(email)) {
        alert('✅ Đã mở khóa!');
        renderDanhSachUsers();
    }
}
