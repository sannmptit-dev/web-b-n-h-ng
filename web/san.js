document.addEventListener("DOMContentLoaded", function() {
    const cacBaiViet = Array.from(document.querySelectorAll('.bai-viet-moi'));
    const nutTruoc = document.getElementById('nut-truoc-san');
    const nutSau = document.getElementById('nut-sau-san');
    const oTimKiem = document.getElementById('o-tim-kiem-san');
    const hopGoiY = document.getElementById('hop-goi-y-san');
    const cacLienKetDanhMuc = document.querySelectorAll('#danh-sach-danh-muc-san a');
    const khungTheTag = document.getElementById('khung-the-tag-san');

    // Khởi tạo trạng thái dữ liệu nền
    let cacBaiDaLocHienTai = [...cacBaiViet]; 
    let viTriBatDau = 0;                       
    const kichThuocKhung = 4;                      

    // Sao lưu danh sách thẻ Tag gốc để phục hồi khi cần
    const maTagGocHTML = khungTheTag.innerHTML;

    // =========================================================================
    // CHỨC NĂNG 1: QUẢN LÝ PHÂN TRANG TỊNH TIẾN (SLIDING WINDOW)
    // =========================================================================
    function hienThiKhungTruot() {
        // Ẩn tất cả các bài viết trước
        cacBaiViet.forEach(item => item.style.display = 'none');

        // Lấy ra tối đa 4 phần tử tính từ vị trí bắt đầu
        const cacBaiCanHienThi = cacBaiDaLocHienTai.slice(viTriBatDau, viTriBatDau + kichThuocKhung);
        cacBaiCanHienThi.forEach(item => item.style.display = 'block');

        // Cập nhật trạng thái bật/tắt các nút chuyển trang
        nutTruoc.disabled = (viTriBatDau === 0);
        nutSau.disabled = (viTriBatDau + kichThuocKhung >= cacBaiDaLocHienTai.length);
    }

    // Bấm nút "Hiện thêm" -> Tiến 2 bài
    nutSau.addEventListener('click', function() {
        if (viTriBatDau + kichThuocKhung < cacBaiDaLocHienTai.length) {
            viTriBatDau += 2;
            hienThiKhungTruot();
        }
    });

    // Bấm nút "Quay lại" -> Lùi 2 bài
    nutTruoc.addEventListener('click', function() {
        if (viTriBatDau > 0) {
            viTriBatDau -= 2;
            if (viTriBatDau < 0) viTriBatDau = 0;
            hienThiKhungTruot();
        }
    });

    // =========================================================================
    // CHỨC NĂNG 2: LIVE SEARCH DROPDOWN (TÌM KIẾM TRỰC TIẾP RA THUMBNAIL)
    // =========================================================================
    oTimKiem.addEventListener('input', function() {
        const tuKhoa = this.value.trim().toLowerCase();
        hopGoiY.innerHTML = ''; // Dọn sạch gợi ý cũ

        if (!tuKhoa) {
            hopGoiY.style.display = 'none';
            return;
        }

        // Lọc bài viết khớp với tiêu đề hoặc nội dung tóm tắt
        const cacBaiKhop = cacBaiViet.filter(item => {
            const tieuDe = item.querySelector('h5 a').textContent.toLowerCase();
            const doanVan = item.querySelector('p').textContent.toLowerCase();
            return tieuDe.includes(tuKhoa) || doanVan.includes(tuKhoa);
        });

        if (cacBaiKhop.length > 0) {
            cacBaiKhop.forEach(item => {
                const chuTieuDe = item.querySelector('h5 a').textContent;
                const duongDanAnh = item.querySelector('.anh-bai-moi img').src;
                const maBaiViet = item.getAttribute('data-id');

                // Tạo khối item hiển thị kèm ảnh thu nhỏ cho Dropdown
                const div = document.createElement('div');
                div.className = 'muc-goi-y-san';
                div.innerHTML = `
                    <img src="${duongDanAnh}" alt="thumb">
                    <div class="thong-tin-muc-san">
                        <h7>${chuTieuDe}</h7>
                    </div>
                `;

                // Khi Click chọn 1 gợi ý từ danh sách xổ xuống
                div.addEventListener('click', function() {
                    oTimKiem.value = chuTieuDe;
                    hopGoiY.style.display = 'none';

                    // Chỉ hiển thị đúng bài viết được chọn
                    cacBaiDaLocHienTai = cacBaiViet.filter(i => i.getAttribute('data-id') === maBaiViet);
                    viTriBatDau = 0;
                    hienThiKhungTruot();

                    // Đồng bộ bộ Tag của bài viết này vào Sidebar
                    dongBoTagChoMotBai(item);
                });

                hopGoiY.appendChild(div);
            });
            hopGoiY.style.display = 'block';
        } else {
            hopGoiY.innerHTML = '<div style="padding:10px 15px; font-size:13px; color:#999;">Không tìm thấy bài viết</div>';
            hopGoiY.style.display = 'block';
        }
    });

    // =========================================================================
    // CHỨC NĂNG 3: FOCUS AUTO-CLEAR (DỌN SẠCH KHI CHUỘT TRỞ LẠI Ô TÌM KIẾM)
    // =========================================================================
    oTimKiem.addEventListener('focus', function() {
        this.value = '';                 
        hopGoiY.innerHTML = '';   
        hopGoiY.style.display = 'none';

        // Khôi phục giao diện phân trang ban đầu
        cacBaiDaLocHienTai = [...cacBaiViet];
        viTriBatDau = 0;
        hienThiKhungTruot();

        // Khôi phục nhóm Tag gốc ban đầu
        khungTheTag.innerHTML = maTagGocHTML;
    });

    // Đóng nhanh dropdown nếu click chuột ra ngoài
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.sidebar-tim-kiem')) {
            hopGoiY.style.display = 'none';
        }
    });

    // =========================================================================
    // CHỨC NĂNG 4: CATEGORY FILTER (BẤM DANH MỤC LỌC BÀI VIẾT)
    // =========================================================================
    cacLienKetDanhMuc.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const danhMucMucTieu = this.getAttribute('data-dm');

            if (danhMucMucTieu === 'all') {
                cacBaiDaLocHienTai = [...cacBaiViet];
            } else {
                cacBaiDaLocHienTai = cacBaiViet.filter(item => item.getAttribute('data-danh-muc') === danhMucMucTieu);
            }

            viTriBatDau = 0;
            hienThiKhungTruot();
            khungTheTag.innerHTML = maTagGocHTML;
        });
    });

    // =========================================================================
    // CHỨC NĂNG 5: ĐỒNG BỘ SEARCH BY TAGS (ĐỔI TAG THEO BÀI VIẾT XEM CHI TIẾT)
    // =========================================================================
    function dongBoTagChoMotBai(postElement) {
        const chuoiTags = postElement.getAttribute('data-the');
        if (!chuoiTags) return;

        const mangTags = chuoiTags.split(',').map(tag => tag.trim());
        khungTheTag.innerHTML = ''; 

        mangTags.forEach(tag => {
            const aTag = document.createElement('a');
            aTag.href = '#';
            aTag.textContent = tag;
            khungTheTag.appendChild(aTag);
        });
    }

    // CLICK VÀO THẺ TAG ĐỂ LỌC BÀI VIẾT THEO TAG ĐÓ
    khungTheTag.addEventListener('click', function(e) {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const tagDuocChon = e.target.textContent.trim().toLowerCase();

            cacBaiDaLocHienTai = cacBaiViet.filter(item => {
                const chuoiTagCuaBai = item.getAttribute('data-the');
                if (!chuoiTagCuaBai) return false;
                
                const mangTags = chuoiTagCuaBai.split(',').map(t => t.trim().toLowerCase());
                return mangTags.includes(tagDuocChon);
            });

            viTriBatDau = 0;
            hienThiKhungTruot();
        }
    });

    hienThiKhungTruot();
});