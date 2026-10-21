
const projects = [
   {
      id: 1,
      title: "Sistem Inventaris Keuangan",
      category: "Web App",
      budget: 2500000,
      completed: true
   },
   {
      id: 2,
      title: "Sistem Kasir Digital POS",
      category: "Desktop App",
      budget: 5000000,
      completed: true
   },
   {
      id: 3,
      title: "Landing Page Profil Perusahaan",
      category: "Web App",
      budget: 1500000,
      completed: false
   },
   {
      id: 4,
      title: "Aplikasi Presensi GPS Mobile",
      category: "Mobile App",
      budget: 4500000,
      completed: false
   }
];

let selectedCategory = "Semua";
let searchTerm = "";

const formatRupiah = angka => {
   return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
   }).format(angka);
};

// Memperbarui statistik
function updateStats() {
   document.getElementById("stat-total-projects").textContent =
      projects.length;

   const totalBudget = projects.reduce(
      (total, project) => total + project.budget, 0
   );

   document.getElementById("stat-total-budget").textContent =
      formatRupiah(totalBudget);

   const completedCount = projects.filter(
      project => project.completed
   ).length;

   document.getElementById("stat-completed-projects").textContent =
      completedCount;
}

// Filter kategori dan pencarian
function getFilteredProjects() {
   return projects.filter(project => {
      const matchesCategory =
         selectedCategory === "Semua" ||
         project.category === selectedCategory;

      const matchesSearch =
         project.title.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesSearch;
   });
}

// Menampilkan daftar proyek
function renderProjects() {
   const container = document.getElementById("project-list");
   const filteredProjects = getFilteredProjects();

   if (filteredProjects.length === 0) {
      container.innerHTML =
         '<p class="empty">Tidak ada proyek yang ditemukan.</p>';
      return;
   }

   container.innerHTML = filteredProjects.map(project => `
        <div class="project-card">
            <div class="project-info">
                <span class="project-category">
                    ${escapeHTML(project.category)}
                </span>

                <h4>${escapeHTML(project.title)}</h4>

                <p class="project-budget">
                    ${formatRupiah(project.budget)}
                </p>
            </div>

            <div>
                <span class="badge ${project.completed ? "badge-success" : "badge-pending"
      }">
                    ${project.completed ? "Selesai" : "Dalam Pengerjaan"}
                </span>

                <div class="card-actions">
                    <button type="button" class="btn-status"
                            data-action="toggle" data-id="${project.id}">
                        Ubah Status
                    </button>

                    <button type="button" class="btn-delete"
                            data-action="delete" data-id="${project.id}">
                        Hapus
                    </button>
                </div>
            </div>
        </div>
    `).join("");
}

// Mencegah teks input dibaca sebagai HTML
function escapeHTML(text) {
   return text.replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
   })[char]);
}

// Memperbarui tampilan
function refreshUI() {
   updateStats();
   renderProjects();
}

document.addEventListener("DOMContentLoaded", () => {
   const form = document.getElementById("project-form");
   const titleInput = document.getElementById("project-title");
   const categoryInput = document.getElementById("project-category");
   const budgetInput = document.getElementById("project-budget");
   const completedInput = document.getElementById("project-completed");
   const message = document.getElementById("form-message");
   const searchInput = document.getElementById("search-input");
   const filterButtons = document.querySelectorAll(".btn-filter");
   const projectList = document.getElementById("project-list");

   refreshUI();

   // FITUR 1: Form input proyek dan validasi
   form.addEventListener("submit", event => {
      event.preventDefault();

      const title = titleInput.value.trim();
      const budget = Number(budgetInput.value);

      if (title === "") {
         message.textContent = "Judul proyek tidak boleh kosong.";
         message.style.color = "red";
         return;
      }

      if (!Number.isFinite(budget) || budget <= 0) {
         message.textContent =
            "Anggaran harus lebih besar dari 0.";
         message.style.color = "red";
         return;
      }

      const newProject = {
         id: Date.now(),
         title: title,
         category: categoryInput.value,
         budget: budget,
         completed: completedInput.checked
      };

      projects.push(newProject);

      form.reset();
      message.textContent = "Proyek berhasil ditambahkan!";
      message.style.color = "green";

      selectedCategory = "Semua";
      searchTerm = "";
      searchInput.value = "";

      filterButtons.forEach(button => {
         button.classList.toggle(
            "active",
            button.dataset.category === "Semua"
         );
      });

      refreshUI();
   });

   // FITUR 2: Pencarian real-time
   searchInput.addEventListener("input", event => {
      searchTerm = event.target.value.trim();
      renderProjects();
   });

   // Filter berdasarkan kategori
   filterButtons.forEach(button => {
      button.addEventListener("click", () => {
         selectedCategory = button.dataset.category;

         filterButtons.forEach(item => {
            item.classList.toggle("active", item === button);
         });

         renderProjects();
      });
   });

   // FITUR 3: Ubah status dan hapus proyek
   projectList.addEventListener("click", event => {
      const button = event.target.closest("button[data-action]");

      if (!button) return;

      const id = Number(button.dataset.id);
      const index = projects.findIndex(project => project.id === id);

      if (index === -1) return;

      if (button.dataset.action === "toggle") {
         projects[index].completed = !projects[index].completed;
      }

      if (button.dataset.action === "delete") {
         const yakin = confirm(
            `Yakin ingin menghapus proyek "${projects[index].title}"?`
         );

         if (!yakin) return;

         projects.splice(index, 1);
      }

      refreshUI();
   });
});
