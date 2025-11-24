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
            timer: 1000,
            timerProgressBar:true,
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

const registerUser = async () => {
    const isStrongPassword = password => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+]).{8,}$/;
        return regex.test(password);
    };

    const data = {
        username: document.getElementById("regUsername").value,
        password: document.getElementById("regPassword").value,
        role: parseInt(document.getElementById("regRole").value)
    };

    const userNameError = document.getElementById("userNameError");
    const userPasswordError = document.getElementById("userPasswordError");
    const userRoleError = document.getElementById("userRoleError");

    userNameError.textContent = "";
    userPasswordError.textContent = "";
    userRoleError.textContent = "";

    let hasError = false;

    if (!data.username) {
        userNameError.textContent = "Username is required!";
        hasError = true;
    }

    if (!data.password) {
        userPasswordError.textContent = "Password is required!";
        hasError = true;
    } else if (!isStrongPassword(data.password)) {
        userPasswordError.textContent =
            "Password must have at least 8 characters, including uppercase, lowercase, number and special character.";
        hasError = true;
    }

    
    if (isNaN(data.role)) {
        userRoleError.textContent = "Role is required!";
        hasError = true;
    }

    if (hasError) return;

    try {
        await axios.post("https://localhost:7244/api/Auth/register", data);
        Swal.fire({ icon: "success", title: "Register success" });

        loginDiv.style.display = "block";
        registerDiv.style.display = "none";

    } catch (err) {
        Swal.fire({ icon: "error", title: "Register failed" });
        console.error(err);
    }
};


document.getElementById("registerBtn").addEventListener("click", registerUser);
document.getElementById("showRegister").addEventListener("click", () => {
    loginDiv.style.display = "none";
    registerDiv.style.display = "block";
});
document.getElementById("backLogin").addEventListener("click", () => {
    loginDiv.style.display = "block";
    registerDiv.style.display = "none";
});
// document.addEventListener("DOMContentLoaded", () => {
//     document.getElementById("loginUsername").value = '';
//     document.getElementById("loginPassword").value = '';
// });
