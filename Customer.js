const apiBookUrl = "https://localhost:7244/api/Sach";
let books = [];
let filteredBooks = [];
let currentPage = 1;
const itemsPerPage = 8; 

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

const loadBooks = async () => {
    try {
        const { data } = await axios.get(apiBookUrl);
        books = data;
        filteredBooks = [...books]; 
        renderCategories();
        renderBooks();
        renderPagination();
    } catch (err) {
        console.error(err);
    }
};


const getCategories = () => {
    const categories = new Set();
    books.forEach(book => categories.add(book.theLoai));
    return Array.from(categories);
};

const renderCategories = () => {
    const categoryList = document.getElementById("categoryList");
    categoryList.innerHTML = "";

    const allLi = document.createElement("li");
    allLi.className = "list-group-item list-group-item-action active text-center";
    allLi.textContent = "Tất cả";
    allLi.addEventListener("click", () => filterBooks(null));
    categoryList.appendChild(allLi);

    getCategories().forEach(cat => {
        const li = document.createElement("li");
        li.className = "list-group-item list-group-item-action text-center";
        li.textContent = cat;
        li.addEventListener("click", () => filterBooks(cat));
        categoryList.appendChild(li);
    });
};

const filterBooks = (category) => {
    if (!category) filteredBooks = [...books];
    else filteredBooks = books.filter(b => b.theLoai === category);
    currentPage = 1;
    renderBooks();
    renderPagination();

    document.querySelectorAll("#categoryList li").forEach(li => {
        li.classList.remove("active");
        if (li.textContent === (category || "Tất cả")) li.classList.add("active");
    });
};


const renderBooks = () => {
    const container = document.getElementById("bookContainer");
    container.innerHTML = "";

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageBooks = filteredBooks.slice(start, end);

    pageBooks.forEach(book => {
        const fullImageUrl = getFullImageUrl(book.imageUrl);
        const imageTag = fullImageUrl 
            ? `<img src="${fullImageUrl}" style="object-fit: contain; width: 100%;
                            height: 300px; border-radius: 4px;" alt="${book.tenSach}">` 
            : 'Không ảnh';
        const card = document.createElement("div");
        card.className = "col-md-3 mb-4 "; 
        card.style = "margin-top : 1.90rem;";
        card.innerHTML = `
            <div class="card h-100">
                ${imageTag}
                <div class="card-body text-center">
                    <h6 class="card-title">${book.tenSach}</h6>
                    <p class="card-text text-danger">${book.giaBan.toLocaleString('vi-VN')} VNĐ</p>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
};


const renderPagination = () => {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

    
    const createPageItem = (label, page, disabled = false, active = false) => {
        return `<li class="page-item ${disabled ? "disabled" : ""} ${active ? "active" : ""}">
                    <a class="page-link" href="#" data-page="${page}">${label}</a>
                </li>`;
    };

   
    pagination.innerHTML += createPageItem("Previous", currentPage - 1, currentPage === 1);

    
    for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += createPageItem(i, i, false, i === currentPage);
    }

   
    pagination.innerHTML += createPageItem("Next", currentPage + 1, currentPage === totalPages);

    
    pagination.querySelectorAll("a.page-link").forEach(a => {
        a.addEventListener("click", e => {
            e.preventDefault();
            const page = parseInt(a.dataset.page);
            if (page >= 1 && page <= totalPages) {
                currentPage = page;
                renderBooks();
                renderPagination();
            }
        });
    });
};


document.addEventListener("DOMContentLoaded", loadBooks);
