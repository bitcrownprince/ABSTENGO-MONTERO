(function(){
'use strict';
var WA='5358863261';var BASE=document.body.getAttribute('data-base')||'';
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var norm=function(s){return String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase()};
var store={get:function(k,d){try{var v=localStorage.getItem(k);return v===null?d:v}catch(e){return d}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
var fmt=function(n,c){return c==='usd'?'$'+Number(n).toFixed(2)+' USD':Math.round(n).toLocaleString('es-CU')+' CUP'};
/* currency */
var root=document.documentElement;
function cur(){return root.getAttribute('data-cur')||'cup'}
function setCur(c){root.setAttribute('data-cur',c);store.set('cur',c);renderCart()}
root.setAttribute('data-cur',store.get('cur','cup')==='usd'?'usd':'cup');
$$('.cur button').forEach(function(b){b.addEventListener('click',function(){setCur(b.getAttribute('data-c'))})});
/* toast */
var tt;function toast(m){var t=$('.toast');if(!t){t=document.createElement('div');t.className='toast';t.setAttribute('role','status');document.body.appendChild(t)}t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(function(){t.classList.remove('on')},1800)}
/* cart */
var cart={};try{cart=JSON.parse(store.get('cart','{}'))||{}}catch(e){cart={}}
function save(){store.set('cart',JSON.stringify(cart));renderCart()}
function add(p,q){q=Math.max(1,parseInt(q,10)||1);if(cart[p.id])cart[p.id].q+=q;else cart[p.id]={id:p.id,n:p.n,cup:p.cup,usd:p.usd,q:q};save();toast('Agregado al pedido')}
var drawer;
function build(){
 drawer=document.createElement('div');drawer.className='drawer';drawer.innerHTML='<div class="bg"></div><aside role="dialog" aria-label="Mi pedido"><header><h2>Mi pedido</h2><button class="btn ghost sm" data-x>Cerrar</button></header><div class="items"></div><footer><div class="tot"><span>Total</span><span data-tot></span></div><a class="btn wa" data-send target="_blank" rel="noopener">Enviar pedido por WhatsApp</a><button class="btn ghost sm" data-clear>Vaciar pedido</button></footer></aside>';
 document.body.appendChild(drawer);
 drawer.addEventListener('click',function(e){var t=e.target;
  if(t.classList.contains('bg')||t.hasAttribute('data-x'))drawer.classList.remove('open');
  if(t.hasAttribute('data-clear')){cart={};save()}
  var id=t.getAttribute('data-rm');if(id){delete cart[id];save()}
  var d=t.getAttribute('data-d');if(d){var i=t.getAttribute('data-id');cart[i].q+=parseInt(d,10);if(cart[i].q<1)delete cart[i];save()}});
 document.addEventListener('keydown',function(e){if(e.key==='Escape')drawer.classList.remove('open')});
}
function renderCart(){
 var ids=Object.keys(cart),n=ids.reduce(function(a,i){return a+cart[i].q},0);
 $$('.cartbtn .n').forEach(function(e){e.textContent=n});
 if(!drawer)return;var c=cur(),tot=0,h='';
 ids.forEach(function(i){var it=cart[i];tot+=it[c]*it.q;h+='<div class="it"><a href="/producto/'+it.id+'.html">'+it.n.replace(/</g,'&lt;')+'</a><button class="rm" data-rm="'+it.id+'" aria-label="Quitar">✕</button><span>'+fmt(it[c],c)+'</span><span class="qty"><button data-d="-1" data-id="'+it.id+'">−</button><input value="'+it.q+'" readonly aria-label="Cantidad"><button data-d="1" data-id="'+it.id+'">+</button></span></div>'});
 $('.items',drawer).innerHTML=h||'<p class="empty">Tu pedido está vacío.</p>';
 $('[data-tot]',drawer).textContent=fmt(tot,c);
 var msg='Hola, quiero hacer este pedido:\n'+ids.map(function(i){var it=cart[i];return '- '+it.q+' x '+it.n+' ('+fmt(it[c],c)+')'}).join('\n')+'\nTotal: '+fmt(tot,c);
 var a=$('[data-send]',drawer);a.href='https://wa.me/'+WA+'?text='+encodeURIComponent(msg);a.style.display=ids.length?'':'none';
}
build();renderCart();
$$('[data-cart]').forEach(function(b){b.addEventListener('click',function(){drawer.classList.add('open')})});
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-add]');if(!b)return;
 var q=b.getAttribute('data-q');var qi=q?$(q):null;
 add({id:b.getAttribute('data-add'),n:b.getAttribute('data-n'),cup:+b.getAttribute('data-cup'),usd:+b.getAttribute('data-usd')},qi?qi.value:1)});
/* qty widget on product page */
$$('.qty[data-qw]').forEach(function(w){var i=$('input',w);w.addEventListener('click',function(e){var d=e.target.getAttribute('data-d');if(d)i.value=Math.max(1,(parseInt(i.value,10)||1)+parseInt(d,10))})});
/* catalog */
var cg=$('#grid');if(cg){
 var DATA=[],state={q:'',cat:'',sort:'rel'};
 var params=new URLSearchParams(location.search);state.q=params.get('q')||'';state.cat=params.get('cat')||'';
 var qi=$('#q'),si=$('#sort'),chips=$('#chips'),cnt=$('#count');qi.value=state.q;
 function card(p){var img=p.img?'<img src="'+BASE+p.img+'" alt="'+p.name.replace(/"/g,'&quot;')+'" loading="lazy">':'<img class="ph" src="'+BASE+'img/ph-'+p.cat+'.svg" alt="" loading="lazy">';
  return '<article class="card"><a class="cl" href="'+BASE+'producto/'+p.id+'.html"><div class="im">'+img+'</div><div class="bd"><span class="ct">'+p.catTitle+'</span><h3>'+p.name.replace(/</g,'&lt;')+'</h3></div></a><div class="ft"><div><div class="price cup">'+fmt(p.cup,'cup')+'</div><div class="price usd">'+fmt(p.usd,'usd')+'</div></div><button class="btn sm" data-add="'+p.id+'" data-n="'+p.name.replace(/"/g,'&quot;')+'" data-cup="'+p.cup+'" data-usd="'+p.usd+'">Agregar</button></div></article>'}
 function render(){
  var q=norm(state.q).split(/\s+/).filter(Boolean);
  var r=DATA.filter(function(p){return (!state.cat||p.cat===state.cat)&&q.every(function(w){return p._s.indexOf(w)>-1})});
  if(state.sort==='asc')r.sort(function(a,b){return a.cup-b.cup});else if(state.sort==='desc')r.sort(function(a,b){return b.cup-a.cup});else if(state.sort==='az')r.sort(function(a,b){return a.name.localeCompare(b.name,'es')});
  cnt.textContent=r.length+' producto'+(r.length===1?'':'s');
  cg.innerHTML=r.length?r.slice(0,300).map(card).join(''):'<p class="empty" style="grid-column:1/-1">No encontramos productos con esa búsqueda. <a href="https://wa.me/'+WA+'">Pregúntanos por WhatsApp</a>.</p>';
  $$('.chip',chips).forEach(function(c){c.classList.toggle('on',c.getAttribute('data-c')===state.cat)});
  var u=new URLSearchParams();if(state.q)u.set('q',state.q);if(state.cat)u.set('cat',state.cat);try{history.replaceState(null,'',location.pathname+(u.toString()?'?'+u:''))}catch(e){};
 }
 (function(j){
  DATA=j.products;DATA.forEach(function(p){p._s=norm(p.name+' '+p.catTitle+' '+p.group+' '+p.tags.join(' '))});
  chips.innerHTML='<button class="chip" data-c="">Todo</button>'+j.categories.map(function(c){return '<button class="chip" data-c="'+c.id+'">'+c.title+' ('+c.count+')</button>'}).join('');
  chips.addEventListener('click',function(e){var c=e.target.getAttribute('data-c');if(c===null)return;state.cat=c;render()});
  render();
 })(window.CATALOG||{products:[],categories:[]});
 var t;qi.addEventListener('input',function(){clearTimeout(t);t=setTimeout(function(){state.q=qi.value;render()},120)});
 si.addEventListener('change',function(){state.sort=si.value;render()});
}
/* home search */
var hs=$('#homesearch');if(hs)hs.addEventListener('submit',function(e){e.preventDefault();location.href=BASE+'catalogo.html?q='+encodeURIComponent($('input',hs).value)});
})();
