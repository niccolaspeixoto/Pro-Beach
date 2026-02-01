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
    'https://lh3.googleusercontent.com/p/AF1QipMUDmA1JpYuDmJZg-GjtBwNHhG096sssFQPQ_jM=s680-w680-h510-rw',
    "./assets/churrasqueira.jpg",
    "./assets/lanchonete.jpg"
]

let index = 0;
const banner = document.querySelector('.background-main');

function trocarImagem() {
    banner.style.opacity = 0;

    setTimeout(() => {
    banner.style.backgroundImage = `url(${imagens[index]})`;
    banner.style.opacity = 0.3;
  }, 300);
}

// troca a cada 5 segundos
setInterval(() => {
  index++;
  if (index >= imagens.length) index = 0;
  trocarImagem();
}, 5000);

// imagem inicial
trocarImagem();