// --- Lógica para el Modo Oscuro ---
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

function toggleTheme() {
    html.classList.toggle('dark');
    themeToggle.innerHTML = html.classList.contains('dark') 
        ? '<i class="fas fa-sun"></i>' 
        : '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
}

themeToggle.addEventListener('click', toggleTheme);

// Cargar el tema guardado al inicio
if (localStorage.getItem('theme') === 'dark') {
    html.classList.add('dark');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

// --- Animaciones GSAP para el efecto fade-in (solo se usa en index.html) ---
document.addEventListener('DOMContentLoaded', () => {
    // Verificamos si existe el elemento para evitar errores en otras páginas
    if (document.querySelector('.animate__fadeIn')) {
        document.querySelectorAll('.animate__fadeIn').forEach(el => {
            gsap.from(el, {
                opacity: 0,
                y: 20,
                duration: 1,
                delay: el.dataset.delay || 0,
                ease: 'power2.out'
            });
        });
    }
});