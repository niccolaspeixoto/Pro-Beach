const elementos = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting){
            entry.target.classList.add('ativo');
            observer.unobserve(entry.target);
        }
    });
});

elementos.forEach((el) => {
    observer.observe(el);
});


// ==============================
// SLIDER COM TRANSIÇÃO SUAVE
// ==============================

const imagens = [
    "./assets/lanchonete.jpg",
    "./assets/quadra-futevolei.jpg",
    "./assets/churrasqueira-iphone.jpg",
    "./assets/quadras-futevolei.jpg",
    "./assets/quadra-society.jpg"
];

let index = 0;
let ativo = 1;

// seleciona as duas camadas
const bg1 = document.querySelector('.bg1');
const bg2 = document.querySelector('.bg2');

// pré-carregamento (evita travadas no mobile)
imagens.forEach(src => {
    const img = new Image();
    img.src = src;
});

// imagem inicial
bg1.style.backgroundImage = `url(${imagens[0]})`;

// troca automática
setInterval(() => {
    index = (index + 1) % imagens.length;

    if (ativo === 1) {
        bg2.style.backgroundImage = `url(${imagens[index]})`;
        bg2.style.opacity = 1;
        bg1.style.opacity = 0;
        ativo = 2;
    } else {
        bg1.style.backgroundImage = `url(${imagens[index]})`;
        bg1.style.opacity = 1;
        bg2.style.opacity = 0;
        ativo = 1;
    }

}, 5000);

// menu hamburguer
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});