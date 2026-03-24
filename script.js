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


//troca de imagem do main

const imagens = [
    "./assets/lanchonete.jpg",
    "./assets/quadra-futevolei.jpg",
    "./assets/churrasqueira-iphone.jpg",
    "./assets/quadras-futevolei.jpg",
    "./assets/quadra-society.jpg"
]

let index = 0;
const banner = document.querySelector('.background-main');

function trocarImagem() {
    banner.style.opacity = 0;

    setTimeout(() => {
    banner.style.backgroundImage = `url(${imagens[index]})`;
    banner.style.opacity = 0.3;
  }, 500);
}

// troca a cada 5 segundos
setInterval(() => {
  index++;
  if (index >= imagens.length) index = 0;
  trocarImagem();
}, 5000);

// imagem inicial
trocarImagem();

// menu hamburguer
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});