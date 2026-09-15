document.addEventListener('DOMContentLoaded',()=>{
 const particles=document.querySelector('.particles');
 setInterval(()=>{
  const e=document.createElement('span');
  e.innerHTML=['❤️','✨','🌸','💛'][Math.floor(Math.random()*4)];
  e.className='floating-item';
  e.style.left=Math.random()*100+'vw';
  e.style.fontSize=20+Math.random()*35+'px';
  particles.appendChild(e);
  setTimeout(()=>e.remove(),7000);
 },500);

 const images=document.querySelectorAll('.photos img');
 const modal=document.createElement('div');
 modal.className='photo-modal';
 modal.innerHTML='<img alt="Просмотр фотографии"><button>×</button>';
 document.body.appendChild(modal);
 const modalImage=modal.querySelector('img');
 images.forEach(img=>img.addEventListener('click',()=>{
   modalImage.src=img.src;
   modal.classList.add('active');
 }));
 modal.addEventListener('click',()=>modal.classList.remove('active'));
});