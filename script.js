// ====== ĐĂNG NHẬP / ĐĂNG KÝ ======
function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (!user || !pass) {
    alert("Vui lòng nhập đủ thông tin!");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || {};
  if (!users[user]) {
    users[user] = pass; // Đăng ký mới
  } else if (users[user] !== pass) {
    alert("Sai mật khẩu!");
    return;
  }

  localStorage.setItem("currentUser", user);
  localStorage.setItem("users", JSON.stringify(users));
  window.location.href = "quiz.html";
}

// ====== KIỂM TRA ĐĂNG NHẬP ======
function checkLogin(page) {
  const user = localStorage.getItem("currentUser");
  if (!user) {
    alert("Bạn cần đăng nhập trước!");
    window.location.href = "index.html";
  } else {
    const display = document.getElementById(page === "quiz" ? "userDisplay" : "adminUser");
    if (display) display.innerText = user;
  }
}

// ====== LẤY DANH SÁCH CÂU HỎI ======
function getQuestions() {
  return JSON.parse(localStorage.getItem("questions")) || [
    {
      q: "Thủ đô của Việt Nam là gì?",
      options: ["Hà Nội", "TP.HCM", "Đà Nẵng", "Huế"],
      answer: 0,
    },
    {
      q: "2 + 3 bằng bao nhiêu?",
      options: ["4", "5", "6", "7"],
      answer: 1,
    },
  ];
}

// ====== LƯU DANH SÁCH CÂU HỎI ======
function saveQuestions(qs) {
  localStorage.setItem("questions", JSON.stringify(qs));
}

// ====== HIỂN THỊ CÂU HỎI TRẮC NGHIỆM ======
if (window.location.pathname.includes("quiz.html")) {
  checkLogin("quiz");
  const questions = getQuestions();
  const quizDiv = document.getElementById("quiz");
  let html = "";
  questions.forEach((q, i) => {
    html += `<div class='question'>
      <p>${i + 1}. ${q.q}</p>
      ${q.options
        .map(
          (opt, j) =>
            `<label><input type="radio" name="q${i}" value="${j}"> ${opt}</label><br>`
        )
        .join("")}
    </div>`;
  });
  quizDiv.innerHTML = html;
}

// ====== NỘP BÀI ======
function submitQuiz() {
  const questions = getQuestions();
  let score = 0;
  questions.forEach((q, i) => {
    const ans = document.querySelector(`input[name='q${i}']:checked`);
    if (ans && Number(ans.value) === q.answer) score++;
  });
  document.getElementById("result").innerText = `Kết quả: ${score}/${questions.length}`;
}

// ====== TRANG ADMIN ======
if (window.location.pathname.includes("admin.html")) {
  checkLogin("admin");
  renderQuestionList();
}

let editIndex = null; // Lưu chỉ số câu hỏi đang sửa

function renderQuestionList() {
  const listDiv = document.getElementById("questionList");
  const questions = getQuestions();
  let html = "<h3>Danh sách câu hỏi:</h3>";
  questions.forEach((q, i) => {
    html += `<div>
      <b>${i + 1}. ${q.q}</b>
      <ul>${q.options.map((o, j) => `<li>${j + 1}. ${o}</li>`).join("")}</ul>
      <p>✅ Đáp án đúng: ${q.answer + 1}</p>
      <button onclick="editQuestion(${i})">✏️ Sửa</button>
      <button onclick="deleteQuestion(${i})">🗑️ Xóa</button>
    </div><hr>`;
  });
  listDiv.innerHTML = html;
}

function deleteQuestion(index) {
  if (!confirm("Bạn có chắc muốn xóa câu hỏi này không?")) return;
  const qs = getQuestions();
  qs.splice(index, 1);
  saveQuestions(qs);
  renderQuestionList();
}

// ====== THÊM HOẶC CẬP NHẬT CÂU HỎI ======
function saveQuestion() {
  const qText = document.getElementById("questionText").value.trim();
  const opts = [
    document.getElementById("opt1").value.trim(),
    document.getElementById("opt2").value.trim(),
    document.getElementById("opt3").value.trim(),
    document.getElementById("opt4").value.trim(),
  ];
  const ans = parseInt(document.getElementById("correctIndex").value) - 1;

  if (!qText || opts.some(o => !o) || ans < 0 || ans > 3) {
    alert("Vui lòng nhập đầy đủ thông tin và chọn đáp án đúng hợp lệ!");
    return;
  }

  const qs = getQuestions();

  if (editIndex !== null) {
    // Nếu đang ở chế độ chỉnh sửa
    qs[editIndex] = { q: qText, options: opts, answer: ans };
    alert("✅ Đã cập nhật câu hỏi!");
    editIndex = null;
    document.querySelector("button[onclick='saveQuestion()']").innerText = "Lưu câu hỏi";
  } else {
    qs.push({ q: qText, options: opts, answer: ans });
    alert("✅ Đã thêm câu hỏi mới!");
  }

  saveQuestions(qs);
  clearForm();
  renderQuestionList();
}

// ====== NẠP DỮ LIỆU CÂU HỎI LÊN FORM ĐỂ SỬA ======
function editQuestion(index) {
  const q = getQuestions()[index];
  document.getElementById("questionText").value = q.q;
  q.options.forEach((o, i) => (document.getElementById(`opt${i + 1}`).value = o));
  document.getElementById("correctIndex").value = q.answer + 1;
  editIndex = index;
  document.querySelector("button[onclick='saveQuestion()']").innerText = "Cập nhật câu hỏi";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ====== XÓA DỮ LIỆU TRÊN FORM ======
function clearForm() {
  document.getElementById("questionText").value = "";
  for (let i = 1; i <= 4; i++) document.getElementById(`opt${i}`).value = "";
  document.getElementById("correctIndex").value = "";
}
