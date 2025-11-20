const LoginUser = async () => {
    const Username = document.getElementById("loginUsername").value;
    const Password = document.getElementById("loginPassword").value;

    try {
        const { data } = await axios.post("https://localhost:7244/api/Auth/Login", { Username, Password });
        
        const token = data.token;
        const role = JSON.parse(atob(token.split('.')[1]))?.role;

        
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);

        Swal.fire({
            icon: "success",
            title: "Login success",
            toast: true,
            position: "bottom-end",
            timer: 2000,
            showConfirmButton: false,
            willClose: () => {
                 if (role === "Admin") {
                    window.location.href = "Admin.html";
                } else if (role === "Customer") {
                    window.location.href = "Customer.html";
                } else {
                    window.location.href = "Login.html"; 
                }
            }
        });

    } catch (err) {
        Swal.fire({ icon: "error", title: "Login failed"  , text:"Sai ten dang nhap hoac mat khau!"});
        console.error(err);
    }
};


const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
    loginBtn.addEventListener("click", LoginUser);
}
