// Padroniza a coluna de opções de todas as tabelas: ícone de olho para abrir/editar e menu "⋯".
// Os botões originais ficam ocultos e continuam recebendo os cliques, preservando as rotinas de cada tela.
const PICK_ACTIONS='[data-participant]';
function rowActionIcon(b){const t=b.textContent;return b.classList.contains('danger')?(/vínculo/i.test(t)?'unlink':'trash'):/editar/i.test(t)?'edit':/selecionar/i.test(t)?'check':'preview'}
function enhanceRowActions(){
 document.querySelectorAll('td:not([data-row-options])').forEach(td=>{
  const buttons=[...td.children].filter(b=>b.matches('button.row-action'));
  if(!buttons.length||buttons.some(b=>b.matches(PICK_ACTIONS)))return;
  td.dataset.rowOptions='';
  const row=td.closest('tr'),name=row.cells[0]?.innerText.split('\n')[0].trim()||'registro';
  const primary=buttons.find(b=>!b.classList.contains('danger'));
  buttons.forEach(b=>b.hidden=true);
  const wrap=document.createElement('div');wrap.className='row-actions';
  wrap.innerHTML=(primary?`<button type="button" class="icon-action" data-row-open title="${esc(primary.textContent)}" aria-label="${esc(primary.textContent)}: ${esc(name)}">${opIcon('eye')}</button>`:'')+`<button type="button" class="icon-action" data-row-menu aria-haspopup="menu" aria-expanded="false" title="Mais opções" aria-label="Mais opções de ${esc(name)}">${opIcon('more')}</button>`;
  td.append(wrap);
  wrap.querySelector('[data-row-open]')?.addEventListener('click',()=>primary.click());
  const menuButton=wrap.querySelector('[data-row-menu]');
  menuButton.addEventListener('click',()=>{
   const item=b=>({label:b.textContent.trim(),icon:rowActionIcon(b),danger:b.classList.contains('danger'),run:()=>b.click()});
   openActionMenu(menuButton,'Opções de '+name,[buttons.filter(b=>!b.classList.contains('danger')).map(item),buttons.filter(b=>b.classList.contains('danger')).map(item)]);
  });
 });
 document.querySelectorAll('th').forEach(th=>{if(/^Aç(ão|ões)$/.test(th.textContent.trim()))th.textContent='Opções'});
}
let rowActionsQueued=false;
new MutationObserver(()=>{if(rowActionsQueued)return;rowActionsQueued=true;queueMicrotask(()=>{rowActionsQueued=false;enhanceRowActions()})}).observe(document.body,{childList:true,subtree:true});
enhanceRowActions();
