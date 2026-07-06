
/* ======================================================================== 

   DANGTIN.JS - Xử lý nghiệp vụ đăng tin thanh lý 

   ------------------------------------------------------------------------ 

   Vai trò: Thu thập thông tin sản phẩm, kiểm tra đăng nhập, tự động phân miền 

            và lưu trữ vào localStorage thông qua luutru.js 

   Phụ thuộc: storage.js, ui.js, auth.js 

   ======================================================================== */ 

 

document.addEventListener('DOMContentLoaded', () => { 

    const postForm = document.getElementById('postForm'); 

    if (!postForm) return; 

 

    // 🔐 CHẶN BẢO MẬT: Phải đăng nhập mới được truy cập form đăng tin 

    if (!dangDangNhap()) { 

        showToast('🔐 Vui lòng đăng nhập để thực hiện đăng tin!'); 

        setTimeout(() => { 

            window.location.href = 'taikhoan.html'; 

        }, 1500); 

        return; 

    } 

 

    // Xử lý sự kiện gửi form đăng tin 

    postForm.addEventListener('submit', (e) => { 

        e.preventDefault(); 

 

        // Thu thập dữ liệu từ Form 

        const formData = new FormData(postForm); 

        const name = formData.get('name').toString().trim(); 

        const cat = formData.get('cat').toString().trim(); 

        const priceRaw = formData.get('price').toString().trim(); 

        const city = formData.get('city').toString().trim(); // Tỉnh/thành chọn từ dropdown 

        const phone = formData.get('phone').toString().trim(); 

        const imageRaw = formData.get('image').toString().trim(); 

        const desc = formData.get('desc').toString().trim(); 

 

        // 1. Kiểm tra rỗng (Validation) - M8 Reliable Programming 

        if (!name || !cat || !priceRaw || !city || !phone || !desc) { 

            showToast('⚠️ Vui lòng điền đầy đủ các thông tin bắt buộc!'); 

            return; 

        } 

 

        // 2. Chuyển đổi và ép kiểu dữ liệu an toàn 

        const price = parseInt(priceRaw, 10); 

        if (isNaN(price) || price < 0) { 

            showToast('⚠️ Giá bán không hợp lệ (phải là số dương)!'); 

            return; 

        } 

 

        // 3. Chuẩn hóa SĐT (loại bỏ khoảng trắng) 

        const cleanPhone = phone.replace(/\s+/g, ''); 

 

        // 4. Xử lý ảnh mặc định nếu để trống 

        const image = imageRaw || 'box.png';  

 

        // 5. Tự động chia miền dựa trên Tỉnh/Thành (Chức năng cốt lõi) 

        const region = layMienTheoTinhThanh(city); 

 

        // Lấy thông tin user đăng tin hiện tại 

        const currentUser = layUserHienTai(); 

 

        // 6. Tạo đối tượng tin đăng hoàn chỉnh 

        const uniqueId = 'post-' + Date.now() + '-' + Math.floor(Math.random() * 1000); 

        const newPost = { 

            id: uniqueId, 

            name: name, 

            cat: cat, 

            price: price, 

            city: city,          // Tỉnh/Thành phố chi tiết (VD: Hà Nội) 

            location: city,      // Đồng bộ location 

            region: region,      // Miền (Bắc / Trung / Nam) 

            phone: cleanPhone, 

            image: image, 

            desc: desc, 

            seller: currentUser ? currentUser.name : 'Thành viên Chợ Tốt', 

            sellerEmail: currentUser ? currentUser.email : '', 

            qty: '1', 

            createdAt: new Date().toISOString() 

        }; 

 

        // 7. Lưu vào cơ sở dữ liệu localStorage 

        const posts = layDanhSachTinDang(); 

        posts.unshift(newPost); // Thêm tin mới lên đầu danh sách 

        luuDanhSachTinDang(posts); 

 

        // Hiển thị thông báo và chuyển hướng 

        showToast('✅ Đăng tin thanh lý thành công!'); 

        postForm.reset(); 

         

        setTimeout(() => { 

            window.location.href = 'idea.html'; // Quay lại trang chủ để xem tin đăng 

        }, 1200); 

    }); 

}); 

 
