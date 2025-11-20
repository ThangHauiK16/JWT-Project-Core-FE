const apiBookUrl = "https://localhost:7244/api/Sach";
const apiOrderUrl = "https://localhost:7244/api/HoaDon";
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");
let currentPage = 1;
const itemsPerPage = 5; 
if (!token) {
    window.location.href = "Login.html";
}

let OrderTable;
let BookTable;
let BookModal;
let ModalTitile;
let modalSaveBtn;
let Bookform;
let OrderModal;
let ModalTitleOrder;
let modalSaveOrderBtn;
let OrderForm;
let DetailModal; 
let detailModalLabel; 
let detailModalBody; 

let editingBookId = null;
let editingOrderId = null;
let detailIndex = 0; 
let availableBooks = []; 

// =======================================================
//                  HÀM HỖ TRỢ CHUNG
// =======================================================

const getBaseUrl = () => {
    const url = new URL(apiBookUrl);
    return `${url.protocol}//${url.host}`;
};

const fullServerUrl = getBaseUrl(); 

const getFullImageUrl = (relativeUrl) => {
    if (!relativeUrl) return '';
    if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
        return relativeUrl;
    }
    return `${fullServerUrl}${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl.trimStart('/')}`;
};


const fetchAvailableBooks = async () => {
    try {
        const { data: books } = await axios.get(apiBookUrl, {
            headers: { Authorization: `Bearer ${token}` }
        });
        availableBooks = books; 
    } catch (error) {
        console.error("Failed to fetch available books for order details:", error);
    }
};

// =======================================================
//                    QUẢN LÝ SÁCH
// =======================================================

const handleBookDoubleClick = async (maSach) => {
    try {
        const { data: book } = await axios.get(`${apiBookUrl}/${maSach}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const fullImageUrl = getFullImageUrl(book.imageUrl);
        detailModalLabel.innerText = `Chi Tiết Sách: ${book.tenSach}`;
        detailModalBody.innerHTML = `
            <p><strong>Mã Sách:</strong> ${book.maSach}</p>
            <p><strong>Tên Sách:</strong> ${book.tenSach}</p>
            <p><strong>Thể Loại:</strong> ${book.theLoai}</p>
            <p><strong>Tác Giả:</strong> ${book.tenTacGia}</p>
            <p><strong>Giá Nhập:</strong> ${book.giaNhap.toLocaleString('vi-VN')} VNĐ</p>
            <p><strong>Giá Bán:</strong> ${book.giaBan.toLocaleString('vi-VN')} VNĐ</p>
            <p><strong>Nội Dung:</strong></p>
            <p>${book.noiDungSach || 'Không có nội dung mô tả.'}</p>
            ${fullImageUrl ? `<img src="${fullImageUrl}" class="img-fluid mt-3" alt="Hình ảnh sách">` : ''}
        `;
        DetailModal.show();
    } catch (error) {
        console.error("Lỗi lấy chi tiết sách:", error);
        Swal.fire({ icon: "error", title: "Lỗi", text: "Không thể tải chi tiết sách!" });
    }
};



const createBookRow = (book, index) =>
 {
        const fullImageUrl = getFullImageUrl(book.imageUrl);
        const imageTag = fullImageUrl 
            ? `<img src="${fullImageUrl}" style="width: 100px; height: 100px; border-radius: 4px;" alt="${book.tenSach}">` 
            : 'Không ảnh';
        return `
            <tr>
                <td>${index + 1}</td>
                <td ondblclick="handleBookDoubleClick('${book.maSach}')" style="cursor: pointer; ">
                    ${book.tenSach} 
                
                </td>
                <td>${book.theLoai}</td>
                <td class="text-center">${imageTag}</td>
                <td class="text-center align-content-center">
                    <button class="btn btn-danger btn-sm" onclick="deleteBook('${book.maSach}')">Delete</button>
                    <button class="btn btn-secondary btn-sm ms-2" onclick="updateBook('${book.maSach}')">Update</button>
                </td>
            </tr>
        `;
 }

const LoadBook = async () => {
    try {
        const { data: books } = await axios.get(apiBookUrl, {
            headers: { Authorization: `Bearer ${token}` }
        });

       
        const totalItems = books.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        if (currentPage > totalPages) currentPage = totalPages;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        const booksToShow = books.slice(startIndex, endIndex);

        
        if (BookTable) {
            BookTable.innerHTML = booksToShow.map((book, index) =>
                createBookRow(book, startIndex + index)
            ).join("");
        }

        
        renderBookPagination(totalPages);

    } catch (error) {
        console.error("Failed to load books:", error);
    }
};

const renderBookPagination = (totalPages) => {
    const pagination = document.getElementById("bookPagination");
    if (!pagination) return;

    let html = "";

   
    html += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeBookPage(${currentPage - 1})">Previous</a>
        </li>
    `;

   
    for (let i = 1; i <= totalPages; i++) {
        html += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changeBookPage(${i})">${i}</a>
            </li>
        `;
    }

   
    html += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changeBookPage(${currentPage + 1})">Next</a>
        </li>
    `;

    pagination.innerHTML = html;
};

const  changeBookPage = (page) => {
    currentPage = page;
    LoadBook();
}


const updateBook = async (maSach) => {
    try {
        const { data: book } = await axios.get(`${apiBookUrl}/${maSach}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        ModalTitile.innerText = "Chinh sua sach";
        editingBookId = maSach;

        Bookform.MaSach.value = book.maSach;
        Bookform.TenSach.value = book.tenSach;
        Bookform.TheLoai.value = book.theLoai;
        Bookform.GiaNhap.value = book.giaNhap;
        Bookform.GiaBan.value = book.giaBan;
        Bookform.TenTacGia.value = book.tenTacGia;
        Bookform.NoiDungSach.value = book.noiDungSach;
        
            const previewImg = document.getElementById("previewImage");
            const fullImageUrl = getFullImageUrl(book.imageUrl);
            
            if (previewImg) {
                if (fullImageUrl) {
                    previewImg.src = fullImageUrl;
                    previewImg.style.display = "block";
                } else {
                    previewImg.src = "#";
                    previewImg.style.display = "none";
                }
            }

        BookModal.show();
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Loi lay du lieu theo ma sach!",
            timer: 1500,
            showConfirmButton: false
        });
    }
};

const deleteBook = async (maSach) => {
    const confirmDelete = await Swal.fire({
        title: "Bạn chắc chắn muốn xóa sách này?",
        text: "Dữ liệu sẽ không thể hoàn tác!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy"
    });
    if (!confirmDelete.isConfirmed) return;
    try {
        await axios.delete(`${apiBookUrl}/${maSach}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        LoadBook();
        Swal.fire({
            title: "Success", text: "Delete Thanh Cong", icon: "success", toast: true, position: "bottom-end", timer: 2000, showConfirmButton: false
        });
    } catch (error) {
        Swal.fire({
            title: "Error", text: "Loi Khi Xoa", icon: "error", toast: true, position: "bottom-end", timer: 2000, showConfirmButton: false
        });
    }
};


// =======================================================
//                    QUẢN LÝ HÓA ĐƠN
// =======================================================


const handleOrderDoubleClick = async (maHoaDon) => {
    try {
        const { data: order } = await axios.get(`${apiOrderUrl}/${maHoaDon}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        detailModalLabel.innerText = `Chi Tiết Đơn Hàng: ${order.maHoaDon}`;
        let total = 0;
        let detailsHtml = `
            <p><strong>Mã Hóa Đơn:</strong> ${order.maHoaDon}</p>
            <p><strong>Ngày Tạo:</strong> ${new Date(order.ngayTao).toLocaleString('vi-VN')}</p>
            <p><strong>Người Tạo:</strong> ${order.username}</p>
            <h5 class="mt-4">Sản Phẩm:</h5>
            <table class="table table-bordered table-sm">
                <thead>
                    <tr>
                        <th>Mã Sách</th>
                        <th>Tên Sách</th>
                        <th>Số Lượng</th>
                        <th>Giá Thành</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        if (order.hoaDon_Saches && order.hoaDon_Saches.length > 0) {
            order.hoaDon_Saches.forEach(detail => {
                
                const book = availableBooks.find(b => b.maSach === detail.maSach);
                const tenSach = book ? book.tenSach : 'Không rõ';
                const giaThanh = book ? book.giaBan * detail.soLuong : 0;

                total += giaThanh; 
                detailsHtml += `
                    <tr>
                        <td>${detail.maSach}</td>
                        <td>${tenSach}</td>
                        <td>${detail.soLuong}</td>
                        <td>${giaThanh}</td>
                    </tr>
                `;
            });
        } else {
            detailsHtml += `<tr><td colspan="3" class="text-center">Không có sản phẩm nào.</td></tr>`;
        }
        
        detailsHtml += `
                </tbody>
            </table>
             <div class="d-flex justify-content-end mt-2">
                <h5><strong>Tổng tiền: </strong> 
                    <span class="text-success">${total.toLocaleString('vi-VN')} VNĐ</span>
                </h5>
            </div>
        `;

        detailModalBody.innerHTML = detailsHtml;
        DetailModal.show();
    } catch (error) {
        console.error("Lỗi lấy chi tiết hóa đơn:", error);
        Swal.fire({ icon: "error", title: "Lỗi", text: "Không thể tải chi tiết hóa đơn!" });
    }
};


const LoadOrder = async () => {
    try {
        const { data: orders } = await axios.get(apiOrderUrl, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
 
        await fetchAvailableBooks(); 

        if (OrderTable) OrderTable.innerHTML = orders.map((order, index) => `
            <tr>
                <td>${index + 1}</td>
                <td ondblclick="handleOrderDoubleClick('${order.maHoaDon}')" style="cursor: pointer; ">
                    ${order.maHoaDon}
                   
                </td>
                <td>${order.ngayTao}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteOrder('${order.maHoaDon}')">Delete</button>
                    <button class="btn btn-secondary btn-sm ms-2" onclick="updateOrder('${order.maHoaDon}')">Update</button>
                </td>
            </tr>
        `).join("");
    } catch (error) {
        console.error("Failed to load orders:", error);
    }
};


const addBookToOrder = (maSachSelected = '', soLuong = 1) => {
    const container = document.getElementById("orderDetailsContainer");
    
    if (!container) {
        console.error("Lỗi: Không tìm thấy orderDetailsContainer.");
        return;
    }
    

    const bookOptions = availableBooks.map(book => {
        const selected = book.maSach === maSachSelected ? 'selected' : '';
        return `<option value="${book.maSach}" ${selected}>${book.tenSach} (Mã: ${book.maSach})</option>`;
    }).join('');

    const newIndex = detailIndex++; 
    const row = document.createElement('div');
    row.className = 'row g-3 mb-2 order-detail-row';
    row.setAttribute('data-index', newIndex);
    row.innerHTML = `
        <div class="col-6">
            <select class="form-select" name="MaSach" required>
                <option value="" disabled ${maSachSelected ? '' : 'selected'}>-- Chọn Sách --</option>
                ${bookOptions}
            </select>
        </div>
        <div class="col-4">
            <input type="number" class="form-control" placeholder="Số Lượng" 
                name="SoLuong" value="${soLuong}" min="1" required>
        </div>
        <div class="col-2">
            <button type="button" class="btn btn-danger btn-sm w-100" 
                onclick="removeBookFromOrder(${newIndex})">Xóa</button>
        </div>
    `;
    container.appendChild(row);
};

const removeBookFromOrder = (index) => {
    const row = document.querySelector(`.order-detail-row[data-index="${index}"]`);
    if (row) {
        row.remove();
    }
};


const updateOrder = async (maHoaDon) => {
    try {
        
        await fetchAvailableBooks(); 
        
      
        const { data: order } = await axios.get(`${apiOrderUrl}/${maHoaDon}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        ModalTitleOrder.innerText = "Chỉnh Sửa Đơn Hàng";
        editingOrderId = maHoaDon;
        OrderForm.reset();

      
        if (OrderForm.NgayTao) {
            const date = new Date(order.ngayTao);
            const formattedDate = date.toISOString().slice(0, 16);
            OrderForm.NgayTao.value = formattedDate;
        }

       
        const orderContainer = document.getElementById("orderDetailsContainer");
        if (orderContainer) {
            orderContainer.innerHTML = '';
        }
        detailIndex = 0; 

       
        if (order.hoaDon_Saches && order.hoaDon_Saches.length > 0) {
            order.hoaDon_Saches.forEach(detail => {
                addBookToOrder(detail.maSach, detail.soLuong);
            });
        } else {
            addBookToOrder();
        }

        OrderModal.show();
    } catch (error) {
        console.error("Lỗi lấy dữ liệu hóa đơn:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Lỗi lấy dữ liệu hóa đơn để sửa! (Kiểm tra API C#)",
            timer: 1500,
            showConfirmButton: false
        });
    }
};



async function deleteOrder(maHoaDon) {
    const confirmDelete = await Swal.fire({
        title: "Xác nhận xóa?",
        text: "Dữ liệu hóa đơn sẽ không thể hoàn tác!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy"
    });
    if (!confirmDelete.isConfirmed) return;
    
    try {
        await axios.delete(`${apiOrderUrl}/${maHoaDon}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        LoadOrder();
        Swal.fire({
            title: "Success", text: "Xóa thành công", icon: "success", toast: true, position: "bottom-end", timer: 2000, showConfirmButton: false
        });
    } catch (error) {
         console.error("Lỗi khi xóa đơn hàng:", error.response ? error.response.data : error.message);
        Swal.fire({
            title: "Error", text: "Lỗi Khi Xóa (Kiểm tra ràng buộc dữ liệu)", icon: "error", toast: true, position: "bottom-end", timer: 2000, showConfirmButton: false
        });
    }
}


// =======================================================
//                    LOGIC CHUNG
// =======================================================

document.addEventListener("DOMContentLoaded", () => {
  
    OrderTable = document.getElementById("OrderTable");
    BookTable = document.getElementById("BookTable");
    BookModal = new bootstrap.Modal(document.getElementById("BookModal"));
    ModalTitile = document.getElementById("modalTitle");
    modalSaveBtn = document.getElementById("modalSaveBtn");
    Bookform = document.getElementById("bookForm");
    
   
    OrderModal = new bootstrap.Modal(document.getElementById("OrderModal"));
    ModalTitleOrder = document.getElementById("modalTitleOrder");
    modalSaveOrderBtn = document.getElementById("modalSaveOrderBtn");
    OrderForm = document.getElementById("OrderForm");

   
    DetailModal = new bootstrap.Modal(document.getElementById("DetailModal"));
    detailModalLabel = document.getElementById("detailModalLabel");
    detailModalBody = document.getElementById("detailModalBody");

   
    document.getElementById("addBookBtn").addEventListener("click", () => {
        ModalTitile.innerText = "Them sach";
        Bookform.reset();
        editingBookId = null;
            const previewImg = document.getElementById("previewImage");
            if (previewImg) {
                previewImg.src = "#";
                previewImg.style.display = "none";
            }
            
        BookModal.show();
    });
    
    
    
    modalSaveBtn.addEventListener("click", async () => {
    if (!Bookform.checkValidity()) {
        Bookform.reportValidity();
        return;
    }

    const formData = new FormData(Bookform);

    try {
        if (editingBookId) {
            await axios.put(`${apiBookUrl}/${editingBookId}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            Swal.fire({ title: "Success", text: "Update Thành Công", icon: "success", toast: true, position: "bottom-end", timer: 2000 ,showConfirmButton: false});
        } else {
            await axios.post(apiBookUrl, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            Swal.fire({ title: "Success", text: "Add Thành Công", icon: "success", toast: true, position: "bottom-end", timer: 2000 ,showConfirmButton: false});
        }

        BookModal.hide();
        LoadBook();

    } catch (error) {
        Swal.fire({
            title: "False", text: "Lưu thất bại", icon: "error", toast: true, timer: 2000
        });
    }
});

    document.getElementById("addOrderBtn").addEventListener("click", async () => {
        ModalTitleOrder.innerText = "Thêm Đơn Hàng";
        OrderForm.reset();
        editingOrderId = null;
        
        
        await fetchAvailableBooks(); 

        const orderContainer = document.getElementById("orderDetailsContainer");
        if (orderContainer) {
            orderContainer.innerHTML = '';
        }
        
        detailIndex = 0; 
        addBookToOrder(); 
        OrderModal.show();
    });

    
    document.getElementById("addBookToOrderBtn").addEventListener("click", addBookToOrder);
    

    function getUsernameFromToken(token) {
    if (!token) return null;
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(atob(payloadBase64));
    return payload.unique_name || payload.username || payload.sub; 
}

    modalSaveOrderBtn.addEventListener("click", async () => {
        if (!OrderForm.checkValidity()) {
            OrderForm.reportValidity();
            return;
        }
        const username = getUsernameFromToken(token);
        const orderDetails = [];
        const detailRows = document.querySelectorAll("#orderDetailsContainer .order-detail-row");

        detailRows.forEach(row => {
            const maSachInput = row.querySelector('select[name="MaSach"]'); 
            const soLuongInput = row.querySelector('input[name="SoLuong"]');

            if (maSachInput && maSachInput.value && soLuongInput && soLuongInput.value) {
                orderDetails.push({
                    MaSach: maSachInput.value,
                    SoLuong: parseInt(soLuongInput.value, 10)
                });
            }
        });

        if (orderDetails.length === 0) {
            Swal.fire({
                icon: "warning", text: "Đơn hàng phải có ít nhất một sản phẩm!", toast: true, position: "bottom-end", timer: 2000, showConfirmButton: false
            });
            return;
        }

        const baseData = Object.fromEntries(new FormData(OrderForm).entries());
        
       
        const orderData = {
            NgayTao: baseData.NgayTao,
            HoaDon_Saches: orderDetails,
            Username: username
        };

        try {
            if (editingOrderId) {
             
                await axios.put(`${apiOrderUrl}/${editingOrderId}`, orderData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire({
                    title: "Success", text: "Cập nhật Đơn Hàng Thành Công!", icon: "success", toast: true, position: "bottom-end", timer: 2000, showConfirmButton: false
                });
            } else {
              
                await axios.post(apiOrderUrl, orderData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire({
                    title: "Success", text: "Thêm Đơn Hàng Thành Công!", icon: "success", toast: true, position: "bottom-end", timer: 2000, showConfirmButton: false
                });
            }
            OrderModal.hide();
            LoadOrder();
        } catch (error) {
            console.error("Lỗi khi lưu đơn hàng:", error.response ? error.response.data : error.message);
            Swal.fire({
                title: "False", text: "Lỗi: Lưu đơn hàng thất bại! (Kiểm tra Mã Sách, API)", icon: "error", toast: true, position: "bottom-end", timer: 2000, showConfirmButton: false
            });
        }
    });

 
    document.getElementById("imageInput").addEventListener("change", function (e) {
        const file = e.target.files[0];
        const previewImg = document.getElementById("previewImage");

        if (file) {
            const imageUrl = URL.createObjectURL(file);
            previewImg.src = imageUrl;
            previewImg.style.display = "block";
        } else {
            previewImg.src = "#";
            previewImg.style.display = "none";
        }
    });

   
    showModule("books");
});

function showModule(module) {
    const booksModule = document.getElementById("booksModule");
    const ordersModule = document.getElementById("ordersModule");

    if (module === "books") {
        booksModule.style.display = "block";
        ordersModule.style.display = "none";
        LoadBook();
    } else if (module === "orders") {
        booksModule.style.display = "none";
        ordersModule.style.display = "block";
        LoadOrder();
    }
}




