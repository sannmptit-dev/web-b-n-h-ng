document.addEventListener("DOMContentLoaded", function() {
        const blogItems = Array.from(document.querySelectorAll('.blog-item-new'));
        const btnPrev = document.getElementById('btn-prev-hai');
        const btnNext = document.getElementById('btn-next-hai');
        const searchInput = document.getElementById('search-input-hai');
        const searchDropdown = document.getElementById('search-dropdown-hai');
        const categoryLinks = document.querySelectorAll('#category-list-hai a');
        const tagsContainer = document.getElementById('tags-container-hai');

        // Khởi tạo các trạng thái dữ liệu nền
        let currentFilteredItems = [...blogItems]; // Mảng chứa các bài viết đang được lọc ra
        let windowStart = 0;                       // Vị trí bắt đầu của khung trượt hiển thị
        const windowSize = 4;                      // Số lượng hiển thị mặc định cố định

        // Sao lưu danh sách thẻ Tag gốc để phục hồi khi cần thiết
        const originalTagsHTML = tagsContainer.innerHTML;
        function renderSlidingWindow() {
            // Ẩn tất cả các bài viết hiện hữu trước
            blogItems.forEach(item => item.style.display = 'none');

            // Chỉ lấy ra tối đa `windowSize` phần tử tính từ điểm trượt `windowStart`
            const itemsToDisplay = currentFilteredItems.slice(windowStart, windowStart + windowSize);
            itemsToDisplay.forEach(item => item.style.display = 'block');

            // Cập nhật trạng thái bật/tắt các nút chuyển trang logic
            btnPrev.disabled = (windowStart === 0);
            btnNext.disabled = (windowStart + windowSize >= currentFilteredItems.length);
        }

        // Hành động bấm nút "Hiện thêm" -> Tiến 2 bài
        btnNext.addEventListener('click', function() {
            if (windowStart + windowSize < currentFilteredItems.length) {
                windowStart += 2;
                renderSlidingWindow();
            }
        });

        // Hành động bấm nút "Quay lại" -> Lùi 2 bài
        btnPrev.addEventListener('click', function() {
            if (windowStart > 0) {
                windowStart -= 2;
                if (windowStart < 0) windowStart = 0;
                renderSlidingWindow();
            }
        });


        // =========================================================================
        // CHỨC NĂNG 2: LIVE SEARCH DROPDOWN (TÌM KIẾM TRỰC TIẾP RA THUMBNAIL)
        // =========================================================================
        searchInput.addEventListener('input', function() {
            const keyword = this.value.trim().toLowerCase();
            searchDropdown.innerHTML = ''; // Dọn sạch dropdown cũ

            if (!keyword) {
                searchDropdown.style.display = 'none';
                return;
            }

            // Lọc bài viết khớp với từ khóa tiêu đề hoặc nội dung đoạn văn ngắn
            const matches = blogItems.filter(item => {
                const title = item.querySelector('h5 a').textContent.toLowerCase();
                const text = item.querySelector('p').textContent.toLowerCase();
                return title.includes(keyword) || text.includes(keyword);
            });

            if (matches.length > 0) {
                matches.forEach(item => {
                    const titleText = item.querySelector('h5 a').textContent;
                    const imgSrc = item.querySelector('.blog-item-new__pic img').src;
                    const postId = item.getAttribute('data-id');

                    // Tạo khối item hiển thị kèm ảnh thu nhỏ cho Dropdown
                    const div = document.createElement('div');
                    div.className = 'dropdown-item-hai';
                    div.innerHTML = `
                        <img src="${imgSrc}" alt="thumb">
                        <div class="item-info-hai">
                            <h7>${titleText}</h7>
                        </div>
                    `;

                    // Sự kiện khi Click chọn 1 gợi ý bất kỳ từ danh sách xổ xuống
                    div.addEventListener('click', function() {
                        searchInput.value = titleText;
                        searchDropdown.style.display = 'none';

                        // Chế độ xem lọc riêng lẻ: Chỉ hiển thị bài viết được chọn
                        currentFilteredItems = blogItems.filter(i => i.getAttribute('data-id') === postId);
                        windowStart = 0;
                        renderSlidingWindow();

                        // Tính năng 5: Đồng bộ hóa đồng thời bộ Tag của bài viết này vào Sidebar
                        syncTagsForSinglePost(item);
                    });

                    searchDropdown.appendChild(div);
                });
                searchDropdown.style.display = 'block';
            } else {
                searchDropdown.innerHTML = '<div style="padding:10px 15px; font-size:13px; color:#999;">Không tìm thấy bài viết</div>';
                searchDropdown.style.display = 'block';
            }
        });


        // =========================================================================
        // CHỨC NĂNG 3: FOCUS AUTO-CLEAR (DỌN SẠCH KHI CHUỘT TRỞ LẠI Ô TÌM KIẾM)
        // =========================================================================
        searchInput.addEventListener('focus', function() {
            this.value = '';                 // Xóa rỗng văn bản đang nhập
            searchDropdown.innerHTML = '';   // Xóa bỏ hoàn toàn cụm kết quả gợi ý
            searchDropdown.style.display = 'none';

            // Khôi phục giao diện phân trang ban đầu (hiển thị tất cả bài viết)
            currentFilteredItems = [...blogItems];
            windowStart = 0;
            renderSlidingWindow();

            // Khôi phục đồng thời nhóm Tag gốc ban đầu của Sidebar
            tagsContainer.innerHTML = originalTagsHTML;
        });

        // Đóng nhanh dropdown nếu click chuột ra vùng ngoài form tìm kiếm
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.sidebar-tim-kiem')) {
                searchDropdown.style.display = 'none';
            }
        });


        // =========================================================================
        // CHỨC NĂNG 4: CATEGORY FILTER (BẤM DANH MỤC LỌC BÀI VIẾT)
        // =========================================================================
        categoryLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetCategory = this.getAttribute('data-cat');

                if (targetCategory === 'all') {
                    currentFilteredItems = [...blogItems];
                } else {
                    // Lọc các bài có thuộc tính data-category trùng khớp danh mục click
                    currentFilteredItems = blogItems.filter(item => item.getAttribute('data-category') === targetCategory);
                }

                // Reset chỉ số phân trang về đầu và hiển thị lại khung trượt mới
                windowStart = 0;
                renderSlidingWindow();

                // Khi đổi danh mục, tự trả bộ Tag về mặc định ban đầu
                tagsContainer.innerHTML = originalTagsHTML;
            });
        });


        // =========================================================================
        // CHỨC NĂNG 5: ĐỒNG BỘ SEARCH BY TAGS (ĐỔI TAG THEO BÀI VIẾT XEM CHI TIẾT)
        // =========================================================================
        function syncTagsForSinglePost(postElement) {
            // Đọc thuộc tính chuỗi tags ẩn ở bài viết được click
            const tagsString = postElement.getAttribute('data-tags');
            if (!tagsString) return;

            const tagsArray = tagsString.split(',').map(tag => tag.trim());
            tagsContainer.innerHTML = ''; // Làm sạch các nút cũ

            // Tái tạo mảng nút tag mới tương ứng riêng cho bài viết
            tagsArray.forEach(tag => {
                const aTag = document.createElement('a');
                aTag.href = '#';
                aTag.textContent = tag;
                tagsContainer.appendChild(aTag);
            });
        }


        // =========================================================================
        // CHỨC NĂNG BỔ SUNG: CLICK VÀO THẺ TAG ĐỂ LỌC BÀI VIẾT THEO TAG ĐÓ
        // =========================================================================
        tagsContainer.addEventListener('click', function(e) {
            // Kiểm tra chính xác xem người dùng có click vào thẻ <a> bên trong khu vực Tag không
            if (e.target.tagName === 'A') {
                e.preventDefault();
                
                // Lấy tên chữ của Tag được click (Ví dụ: "Beauty", "Apple") và chuyển về chữ thường
                const selectedTag = e.target.textContent.trim().toLowerCase();

                // Tiến hành lọc danh sách: Bài nào có chứa selectedTag trong thuộc tính data-tags sẽ được giữ lại
                currentFilteredItems = blogItems.filter(item => {
                    const itemTagsStr = item.getAttribute('data-tags');
                    if (!itemTagsStr) return false;
                    
                    // Cắt chuỗi tag của bài viết thành mảng để so sánh chính xác tuyệt đối
                    const tagsArray = itemTagsStr.split(',').map(t => t.trim().toLowerCase());
                    return tagsArray.includes(selectedTag);
                });

                // Reset chỉ số trượt phân trang về vị trí đầu tiên
                windowStart = 0;
                
                // Gọi hàm cập nhật hiển thị danh sách bài viết đã lọc lên giao diện
                renderSlidingWindow();
            }
        });


        // Gọi khởi tạo chạy giao diện phân trang lần đầu tiên khi tải trang
        renderSlidingWindow();
    });