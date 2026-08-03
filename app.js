
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
  });
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', () => mainNav.classList.remove('open'));
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, {threshold: 0.12});

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('nameField').value.trim();
    const email = document.getElementById('emailField').value.trim();
    const company = document.getElementById('companyField').value.trim();
    const subject = document.getElementById('subjectField').value.trim();
    const message = document.getElementById('messageField').value.trim();
    const body = `Name: ${name}
Email: ${email}
Company: ${company}

${message}`;
    window.location.href = `mailto:datasyssolutionsllp@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}
